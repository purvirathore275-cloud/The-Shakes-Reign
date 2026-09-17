import http from "http";
import fs from "fs";

const PORT = process.env.PORT || 5000;
const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // CORS preflight
  if (req.method === "OPTIONS") {
    res.statusCode = 200;
    res.end();
    return;
  }

  // Test route
  if (req.method === "GET" && req.url === "/") {
    res.statusCode = 200;

    res.end(
      JSON.stringify({
        message: "The Shakes Reign Backend is running!",
      })
    );

    return;
  }

  // Get all orders
  if (req.method === "GET" && req.url === "/orders") {
    try {
      let orders = [];

      if (fs.existsSync("./src/backend/order.json")) {
        const data = fs.readFileSync(
          "./src/backend/order.json",
          "utf8"
        );

        if (data.trim()) {
          orders = JSON.parse(data);
        }
      }

      res.statusCode = 200;
      res.end(JSON.stringify(orders));
    } catch (error) {
      res.statusCode = 500;

      res.end(
        JSON.stringify({
          message: "Could not read orders",
        })
      );
    }

    return;
  }

  // Create new order
  if (req.method === "POST" && req.url === "/orders") {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const order = JSON.parse(body);

        let orders = [];

        if (fs.existsSync("./src/backend/order.json")) {
          const data = fs.readFileSync(
            "./src/backend/order.json",
            "utf8"
          );

          if (data.trim()) {
            orders = JSON.parse(data);
          }
        }

        orders.push({
          id: Date.now(),
          ...order,
          createdAt: new Date().toISOString(),
        });

        fs.writeFileSync(
          "./src/backend/order.json",
          JSON.stringify(orders, null, 2)
        );

        res.statusCode = 201;

        res.end(
          JSON.stringify({
            message: "Order received successfully!",
          })
        );
      } catch (error) {
        res.statusCode = 400;

        res.end(
          JSON.stringify({
            message: "Invalid order data",
          })
        );
      }
    });

    return;
  }

  // Route not found
  res.statusCode = 404;

  res.end(
    JSON.stringify({
      message: "Route not found",
    })
  );
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});