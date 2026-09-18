import http from "http";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: "./src/backend/.env" });
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const PORT = process.env.PORT || 5000;

const ORDERS_FILE = "./src/backend/order.json";
const MENU_FILE = "./src/backend/menu.json";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// =========================
// READ JSON FILE
// =========================

function readJsonFile(file) {
  try {
    if (!fs.existsSync(file)) {
      return [];
    }

    const data = fs.readFileSync(file, "utf8");

    if (!data.trim()) {
      return [];
    }

    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${file}:`, error);
    return [];
  }
}

// =========================
// WRITE JSON FILE
// =========================

function writeJsonFile(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// =========================
// SEND JSON
// =========================

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}

// =========================
// GET REQUEST BODY
// =========================

function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });

    req.on("error", reject);
  });
}

// =========================
// CREATE SERVER
// =========================

const server = http.createServer(async (req, res) => {
  res.setHeader("Content-Type", "application/json");

  res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );

  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // =========================
  // CORS
  // =========================

  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  // =========================
  // TEST ROUTE
  // =========================

  if (req.method === "GET" && req.url === "/") {
    sendJson(res, 200, {
      message: "The Shakes Reign Backend is running!",
    });

    return;
  }

  // =========================
  // ADMIN LOGIN
  // =========================

  if (req.method === "POST" && req.url === "/admin-login") {
    try {
      const body = await getBody(req);

      if (!body || body.password !== ADMIN_PASSWORD) {
        return sendJson(res, 401, {
          success: false,
          message: "Invalid password",
        });
      }

      return sendJson(res, 200, {
        success: true,
        message: "Admin login successful",
      });
    } catch (error) {
      console.error("Admin login error:", error);

      return sendJson(res, 500, {
        success: false,
        message: "Login failed",
      });
    }
  }

  // =========================
// GET ORDERS
// =========================

if (req.method === "GET" && req.url === "/orders") {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase orders error:", error);

      sendJson(res, 500, {
        message: "Could not load orders",
      });

      return;
    }

    sendJson(res, 200, data);

    return;
  } catch (error) {
    console.error("Orders error:", error);

    sendJson(res, 500, {
      message: "Could not load orders",
    });

    return;
  }
}
  // =========================
  // CREATE ORDER
  // =========================

  if (req.method === "POST" && req.url === "/orders") {
  try {
    const order = await getBody(req);

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          customer_name:
            order.customerName || order.customer_name || "",
          phone: order.phone || "",
          address: order.address || "",
          items: order,
          total: Number(order.total) || 0,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase order error:", error);

      sendJson(res, 500, {
        message: "Could not save order",
      });

      return;
    }

    sendJson(res, 201, {
      message: "Order received successfully!",
      order: data,
    });

    return;
  } catch (error) {
    console.error("Order error:", error);

    sendJson(res, 400, {
      message: "Invalid order data",
    });

    return;
  }
}
  // =========================
  // GET MENU
  // =========================

  if (
    req.method === "GET" &&
    (req.url === "/menu" || req.url === "/menu/")
  ) {
    const menu = readJsonFile(MENU_FILE);

    sendJson(res, 200, menu);

    return;
  }

  // =========================
  // ADD CATEGORY
  // =========================

  if (
    req.method === "POST" &&
    req.url === "/menu/category"
  ) {
    try {
      const data = await getBody(req);

      const categoryName = String(
        data.category || ""
      ).trim();

      if (!categoryName) {
        sendJson(res, 400, {
          message: "Category name is required",
        });

        return;
      }

      const menu = readJsonFile(MENU_FILE);

      const alreadyExists = menu.some(
        (item) =>
          item.category.toLowerCase() ===
          categoryName.toLowerCase()
      );

      if (alreadyExists) {
        sendJson(res, 400, {
          message: "Category already exists",
        });

        return;
      }

      menu.push({
        category: categoryName,
        items: [],
      });

      writeJsonFile(MENU_FILE, menu);

      sendJson(res, 201, {
        message: "Category added successfully!",
        category: categoryName,
      });

      return;
    } catch (error) {
      console.error(error);

      sendJson(res, 400, {
        message: "Could not add category",
      });

      return;
    }
  }

  // =========================
  // ADD DISH
  // =========================

  if (req.method === "POST" && req.url === "/menu") {
    try {
      const dish = await getBody(req);

      const menu = readJsonFile(MENU_FILE);

      const category = dish.category || "Other";

      let categoryData = menu.find(
        (item) => item.category === category
      );

      if (!categoryData) {
        categoryData = {
          category,
          items: [],
        };

        menu.push(categoryData);
      }

      const newDish = {
        name: dish.name,
        price: Number(dish.price),
        image: dish.image || "",
        available:
          dish.available !== undefined
            ? Boolean(dish.available)
            : true,
        id:
          dish.id ||
          `${category
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
      };

      categoryData.items.push(newDish);

      writeJsonFile(MENU_FILE, menu);

      sendJson(res, 201, {
        message: "Dish added successfully!",
        item: newDish,
      });

      return;
    } catch (error) {
      console.error(error);

      sendJson(res, 400, {
        message: "Invalid dish data",
      });

      return;
    }
  }

  // =========================
  // UPDATE / EDIT DISH
  // =========================

  const menuItemMatch = req.url.match(
    /^\/menu\/([^/]+)$/
  );

  if (
    menuItemMatch &&
    (req.method === "PUT" ||
      req.method === "PATCH")
  ) {
    try {
      const itemId = decodeURIComponent(
        menuItemMatch[1]
      );

      const updates = await getBody(req);

      const menu = readJsonFile(MENU_FILE);

      let foundItem = null;

      for (const category of menu) {
        const item = category.items.find(
          (dish) => dish.id === itemId
        );

        if (item) {
          Object.assign(item, {
            ...updates,
            price:
              updates.price !== undefined
                ? Number(updates.price)
                : item.price,
          });

          foundItem = item;
          break;
        }
      }

      if (!foundItem) {
        sendJson(res, 404, {
          message: "Dish not found",
        });

        return;
      }

      writeJsonFile(MENU_FILE, menu);

      sendJson(res, 200, {
        message: "Dish updated successfully!",
        item: foundItem,
      });

      return;
    } catch (error) {
      console.error(error);

      sendJson(res, 400, {
        message: "Invalid dish data",
      });

      return;
    }
  }

  // =========================
  // TOGGLE AVAILABLE / OUT OF STOCK
  // =========================

  const toggleMatch = req.url.match(
    /^\/menu\/(.+)\/toggle$/
  );

  if (
    toggleMatch &&
    req.method === "PATCH"
  ) {
    try {
      const itemId = decodeURIComponent(
        toggleMatch[1]
      );

      const menu = readJsonFile(MENU_FILE);

      let foundItem = null;

      for (const category of menu) {
        const item = category.items.find(
          (dish) => dish.id === itemId
        );

        if (item) {
          item.available = !item.available;

          foundItem = item;

          break;
        }
      }

      if (!foundItem) {
        sendJson(res, 404, {
          message: "Dish not found",
        });

        return;
      }

      writeJsonFile(MENU_FILE, menu);

      sendJson(res, 200, {
        message: foundItem.available
          ? "Dish is now available"
          : "Dish marked out of stock",
        item: foundItem,
      });

      return;
    } catch (error) {
      console.error(error);

      sendJson(res, 400, {
        message: "Could not update availability",
      });

      return;
    }
  }

  // =========================
  // DELETE DISH
  // =========================

  if (
    menuItemMatch &&
    req.method === "DELETE"
  ) {
    try {
      const itemId = decodeURIComponent(
        menuItemMatch[1]
      );

      const menu = readJsonFile(MENU_FILE);

      let deletedItem = null;

      for (const category of menu) {
        const index = category.items.findIndex(
          (dish) => dish.id === itemId
        );

        if (index !== -1) {
          deletedItem =
            category.items.splice(index, 1)[0];

          break;
        }
      }

      if (!deletedItem) {
        sendJson(res, 404, {
          message: "Dish not found",
        });

        return;
      }

      writeJsonFile(MENU_FILE, menu);

      sendJson(res, 200, {
        message: "Dish deleted successfully!",
        item: deletedItem,
      });

      return;
    } catch (error) {
      console.error(error);

      sendJson(res, 400, {
        message: "Could not delete dish",
      });

      return;
    }
  }

  // =========================
  // ROUTE NOT FOUND
  // =========================

  sendJson(res, 404, {
    message: "Route not found",
  });
});

// =========================
// START SERVER
// =========================

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Backend running at http://localhost:${PORT}`
  );
});