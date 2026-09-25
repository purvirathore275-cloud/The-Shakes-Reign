import http from "http";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: "./src/backend/.env" });

const supabase = createClient(
  "https://buemnckuifchzwladrak.supabase.co",
  process.env.SUPABASE_SECRET_KEY
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
              order.customerName ||
              order.customer_name ||
              "",

            phone: order.phone || "",

            address: order.address || "",

            items: order.items || order,

            total: Number(order.total) || 0,

            status: "Pending",
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("Supabase order error:", error);

        return sendJson(res, 500, {
          message: "Order save failed",
          error: error.message,
        });
      }

      return sendJson(res, 201, {
        message: "Order received successfully!",
        order: data,
      });
    } catch (error) {
      console.error("Order error:", error);

      return sendJson(res, 400, {
        message: "Invalid order data",
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
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Supabase orders error:",
          error
        );

        return sendJson(res, 500, {
          message: "Orders load failed",
          error: error.message,
        });
      }

      return sendJson(res, 200, data || []);
    } catch (error) {
      console.error("Orders error:", error);

      return sendJson(res, 500, {
        message: "Orders load failed",
      });
    }
  }

  // =========================
  // CUSTOMER ORDER STATUS
  // =========================

  const orderStatusViewMatch = req.url.match(
    /^\/orders\/([^/]+)\/status$/
  );

  if (
    req.method === "GET" &&
    orderStatusViewMatch
  ) {
    try {
      const orderId = orderStatusViewMatch[1];

      const { data, error } = await supabase
        .from("orders")
        .select("id, status")
        .eq("id", orderId)
        .single();

      if (error || !data) {
        return sendJson(res, 404, {
          message: "Order not found",
        });
      }

      return sendJson(res, 200, {
        id: data.id,
        status: data.status || "Pending",
      });
    } catch (error) {
      console.error(
        "Customer status error:",
        error
      );

      return sendJson(res, 500, {
        message: "Could not load order status",
      });
    }
  }

  // =========================
  // UPDATE ORDER STATUS
  // =========================

  const orderStatusMatch = req.url.match(
    /^\/orders\/([^/]+)\/status$/
  );

  if (
    req.method === "PATCH" &&
    orderStatusMatch
  ) {
    try {
      const orderId = orderStatusMatch[1];

      const body = await getBody(req);

      const allowedStatuses = [
  "Pending",
  "Confirmed",
  "Rejected",
  "Preparing",
  "Completed",
];
      if (!allowedStatuses.includes(body.status)) {
        return sendJson(res, 400, {
          message: "Invalid order status",
        });
      }

      const { data, error } = await supabase
        .from("orders")
        .update({
          status: body.status,
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        console.error(
          "Status update error:",
          error
        );

        return sendJson(res, 500, {
          message: "Status update failed",
          error: error.message,
        });
      }

      return sendJson(res, 200, {
        message: "Order status updated",
        order: data,
      });
    } catch (error) {
      console.error("Status error:", error);

      return sendJson(res, 500, {
        message: "Status update failed",
      });
    }
  }

  // =========================
  // UPDATE PAYMENT STATUS
  // =========================

  const paymentStatusMatch = req.url.match(
    /^\/orders\/([^/]+)\/payment-status$/
  );

  if (
    req.method === "PATCH" &&
    paymentStatusMatch
  ) {
    try {
      const orderId = paymentStatusMatch[1];

      const body = await getBody(req);

      const allowedPaymentStatuses = [
        "Not Paid",
        "Pending Verification",
        "Verified",
        "Rejected",
      ];

      if (
        !allowedPaymentStatuses.includes(
          body.payment_status
        )
      ) {
        return sendJson(res, 400, {
          message: "Invalid payment status",
        });
      }

      const { data, error } = await supabase
        .from("orders")
        .update({
          payment_status: body.payment_status,
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) {
        console.error(
          "Payment status update error:",
          error
        );

        return sendJson(res, 500, {
          message:
            "Payment status update failed",
          error: error.message,
        });
      }

      return sendJson(res, 200, {
        message:
          "Payment status updated",
        order: data,
      });
    } catch (error) {
      console.error(
        "Payment status error:",
        error
      );

      return sendJson(res, 500, {
        message:
          "Payment status update failed",
      });
    }
  }

  // =====================================================
  // MENU MANAGEMENT
  // =====================================================

  // =========================
  // GET CATEGORIES
  // =========================

  if (
    req.method === "GET" &&
    (
      req.url === "/categories" ||
      req.url === "/categories/"
    )
  ) {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Supabase categories error:",
          error
        );

        return sendJson(res, 500, {
          message:
            "Categories load failed",
          error: error.message,
        });
      }

      return sendJson(
        res,
        200,
        data || []
      );
    } catch (error) {
      console.error(
        "Categories error:",
        error
      );

      return sendJson(res, 500, {
        message:
          "Categories load failed",
      });
    }
  }

  // =========================
  // GET MENU FROM SUPABASE
  // =========================

  if (
    req.method === "GET" &&
    (
      req.url === "/menu" ||
      req.url === "/menu/"
    )
  ) {
    try {
      const { data, error } = await supabase
        .from("menu")
        .select("*")
        .order("created_at", {
          ascending: true,
        });

      if (error) {
        console.error(
          "Supabase menu error:",
          error
        );

        return sendJson(res, 500, {
          message: "Menu load failed",
          error: error.message,
        });
      }

      const groupedMenu = [];

      for (const item of data || []) {
        let category =
          groupedMenu.find(
            (group) =>
              group.category ===
              item.category
          );

        if (!category) {
          category = {
            category: item.category,
            items: [],
          };

          groupedMenu.push(category);
        }

        category.items.push({
          id: item.id,
          name: item.name,
          price: Number(item.price),
          image: item.image || "",
          available:
            item.available !== false,
        });
      }

      return sendJson(
        res,
        200,
        groupedMenu
      );
    } catch (error) {
      console.error(
        "Menu error:",
        error
      );

      return sendJson(res, 500, {
        message: "Menu load failed",
      });
    }
  }

  // =========================
  // ADD CATEGORY
  // =========================

  if (
    req.method === "POST" &&
    req.url === "/menu/category"
  ) {
    try {
      const body = await getBody(req);

      const categoryName = String(
        body.category || ""
      ).trim();

      if (!categoryName) {
        return sendJson(res, 400, {
          message:
            "Category name is required",
        });
      }

      const {
        data: existingCategory,
        error: checkError,
      } = await supabase
        .from("categories")
        .select("id, name")
        .ilike(
          "name",
          categoryName
        )
        .limit(1);

      if (checkError) {
        console.error(
          "Category check error:",
          checkError
        );

        return sendJson(res, 500, {
          message:
            "Could not check category",
          error:
            checkError.message,
        });
      }

      if (
        existingCategory &&
        existingCategory.length > 0
      ) {
        return sendJson(res, 400, {
          message:
            "Category already exists",
        });
      }

      const {
        data: newCategory,
        error,
      } = await supabase
        .from("categories")
        .insert([
          {
            name: categoryName,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error(
          "Supabase category insert error:",
          error
        );

        return sendJson(res, 500, {
          message:
            "Could not add category",
          error: error.message,
        });
      }

      return sendJson(res, 201, {
        message:
          "Category added successfully!",
        category: newCategory,
      });
    } catch (error) {
      console.error(
        "Add category error:",
        error
      );

      return sendJson(res, 400, {
        message:
          "Could not add category",
      });
    }
  }

  // =========================
  // ADD DISH
  // =========================

  if (
    req.method === "POST" &&
    req.url === "/menu"
  ) {
    try {
      const body = await getBody(req);

      const category = String(
        body.category || ""
      ).trim();

      const name = String(
        body.name || ""
      ).trim();

      const price = Number(body.price);

      const image = String(
        body.image || ""
      ).trim();

      if (!category) {
        return sendJson(res, 400, {
          message:
            "Category is required",
        });
      }

      if (!name) {
        return sendJson(res, 400, {
          message:
            "Dish name is required",
        });
      }

      if (
        Number.isNaN(price) ||
        price <= 0
      ) {
        return sendJson(res, 400, {
          message:
            "Valid price is required",
        });
      }

      // Make sure category exists
      const {
        data: categoryData,
        error: categoryError,
      } = await supabase
        .from("categories")
        .select("id, name")
        .ilike("name", category)
        .limit(1);

      if (categoryError) {
        console.error(
          "Category lookup error:",
          categoryError
        );

        return sendJson(res, 500, {
          message:
            "Could not check category",
          error:
            categoryError.message,
        });
      }

      if (
        !categoryData ||
        categoryData.length === 0
      ) {
        return sendJson(res, 400, {
          message:
            "Category does not exist",
        });
      }

      const finalCategory =
        categoryData[0].name;

      // Create unique ID
      const id =
        `${finalCategory
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")}-${Date.now()}`;

      const { data, error } =
        await supabase
          .from("menu")
          .insert([
            {
              id,
              category: finalCategory,
              name,
              price,
              image,
              available: true,
            },
          ])
          .select()
          .single();

      if (error) {
        console.error(
          "Supabase dish insert error:",
          error
        );

        return sendJson(res, 500, {
          message:
            "Could not add dish",
          error: error.message,
        });
      }

      return sendJson(res, 201, {
        message:
          "Dish added successfully!",
        item: data,
      });
    } catch (error) {
      console.error(
        "Add dish error:",
        error
      );

      return sendJson(res, 400, {
        message:
          "Could not add dish",
      });
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
    (
      req.method === "PUT" ||
      req.method === "PATCH"
    )
  ) {
    try {
      const itemId =
        decodeURIComponent(
          menuItemMatch[1]
        );

      const updates =
        await getBody(req);

      const menu =
        readJsonFile(MENU_FILE);

      let foundItem = null;

      for (const category of menu) {
        const item =
          category.items.find(
            (dish) =>
              dish.id === itemId
          );

        if (item) {
          Object.assign(item, {
            ...updates,
            price:
              updates.price !==
              undefined
                ? Number(
                    updates.price
                  )
                : item.price,
          });

          foundItem = item;
          break;
        }
      }

      if (!foundItem) {
        return sendJson(res, 404, {
          message:
            "Dish not found",
        });
      }

      writeJsonFile(
        MENU_FILE,
        menu
      );

      return sendJson(res, 200, {
        message:
          "Dish updated successfully!",
        item: foundItem,
      });
    } catch (error) {
      console.error(
        "Edit dish error:",
        error
      );

      return sendJson(res, 400, {
        message:
          "Invalid dish data",
      });
    }
  }

  // =========================
  // TOGGLE AVAILABLE / OUT OF STOCK
  // =========================

  const toggleMatch =
    req.url.match(
      /^\/menu\/(.+)\/toggle$/
    );

  if (
    toggleMatch &&
    req.method === "PATCH"
  ) {
    try {
      const itemId =
        decodeURIComponent(
          toggleMatch[1]
        );

      const {
        data: currentItem,
        error: findError,
      } = await supabase
        .from("menu")
        .select(
          "id, available"
        )
        .eq("id", itemId)
        .single();

      if (
        findError ||
        !currentItem
      ) {
        return sendJson(res, 404, {
          message:
            "Dish not found",
        });
      }

      const {
        data: updatedItem,
        error,
      } = await supabase
        .from("menu")
        .update({
          available:
            !currentItem.available,
        })
        .eq("id", itemId)
        .select()
        .single();

      if (error) {
        console.error(
          "Supabase availability update error:",
          error
        );

        return sendJson(res, 500, {
          message:
            "Could not update availability",
          error:
            error.message,
        });
      }

      return sendJson(res, 200, {
        message:
          updatedItem.available
            ? "Dish is now available"
            : "Dish marked out of stock",

        item: updatedItem,
      });
    } catch (error) {
      console.error(
        "Toggle error:",
        error
      );

      return sendJson(res, 400, {
        message:
          "Could not update availability",
      });
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
      const itemId =
        decodeURIComponent(
          menuItemMatch[1]
        );

      const {
        data,
        error,
      } = await supabase
        .from("menu")
        .delete()
        .eq("id", itemId)
        .select()
        .single();

      if (error) {
        console.error(
          "Supabase menu delete error:",
          error
        );

        return sendJson(res, 500, {
          message:
            "Could not delete dish",
          error:
            error.message,
        });
      }

      if (!data) {
        return sendJson(res, 404, {
          message:
            "Dish not found",
        });
      }

      return sendJson(res, 200, {
        message:
          "Dish deleted successfully!",
        item: data,
      });
    } catch (error) {
      console.error(
        "Delete dish error:",
        error
      );

      return sendJson(res, 400, {
        message:
          "Could not delete dish",
      });
    }
  }

  // =========================
  // ADMIN LOGIN
  // =========================

  if (
    req.method === "POST" &&
    req.url === "/admin-login"
  ) {
    try {
      const body =
        await getBody(req);

      if (
        !body ||
        body.password !==
          ADMIN_PASSWORD
      ) {
        return sendJson(res, 401, {
          success: false,
          message:
            "Invalid password",
        });
      }

      return sendJson(res, 200, {
        success: true,
        message:
          "Admin login successful",
      });
    } catch (error) {
      console.error(
        "Admin login error:",
        error
      );

      return sendJson(res, 500, {
        success: false,
        message:
          "Login failed",
      });
    }
  }

  // =========================
  // CREATE REVIEW
  // =========================

  if (
    req.method === "POST" &&
    req.url === "/reviews"
  ) {
    try {
      const body =
        await getBody(req);

      const name =
        String(
          body.name || ""
        ).trim();

      const review =
        String(
          body.review || ""
        ).trim();

      const rating =
        Number(body.rating);

      if (!name || !review) {
        return sendJson(res, 400, {
          message:
            "Name and review are required",
        });
      }

      if (
        !Number.isInteger(
          rating
        ) ||
        rating < 1 ||
        rating > 5
      ) {
        return sendJson(res, 400, {
          message:
            "Rating must be between 1 and 5",
        });
      }

      const {
        data,
        error,
      } = await supabase
        .from("reviews")
        .insert([
          {
            name,
            review,
            rating,
            approved: true,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error(
          "Supabase review error:",
          error
        );

        return sendJson(res, 500, {
          message:
            "Review save failed",
          error:
            error.message,
        });
      }

      return sendJson(res, 201, {
        message:
          "Review submitted successfully!",
        review: data,
      });
    } catch (error) {
      console.error(
        "Review error:",
        error
      );

      return sendJson(res, 400, {
        message:
          "Invalid review data",
      });
    }
  }

  // =========================
  // GET REVIEWS
  // =========================

  if (
    req.method === "GET" &&
    (
      req.url === "/reviews" ||
      req.url === "/reviews/"
    )
  ) {
    try {
      const {
        data,
        error,
      } = await supabase
        .from("reviews")
        .select("*")
        .eq("approved", true)
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

      if (error) {
        console.error(
          "Supabase reviews error:",
          error
        );

        return sendJson(res, 500, {
          message:
            "Reviews load failed",
          error:
            error.message,
        });
      }

      return sendJson(
        res,
        200,
        data || []
      );
    } catch (error) {
      console.error(
        "Reviews error:",
        error
      );

      return sendJson(res, 500, {
        message:
          "Reviews load failed",
      });
    }
  }

  // =========================
  // ROUTE NOT FOUND
  // =========================

  return sendJson(res, 404, {
    message: "Route not found",
  });
});

// =========================
// START SERVER
// =========================

server.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      `Backend running at http://localhost:${PORT}`
    );
  }
);