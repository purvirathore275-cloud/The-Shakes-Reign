import { useEffect, useRef, useState } from "react";
import "./Admin.css";

const API = "https://the-shakes-reign.onrender.com";
function Admin() {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(true);

  const [search, setSearch] = useState("");

  const [activeTab, setActiveTab] = useState("orders");
  const [newOrderAlert, setNewOrderAlert] = useState(null);

  const knownOrderIdsRef = useRef(new Set());
  const hasInitialOrderSnapshotRef = useRef(false);
  const activeAlertOrderIdRef = useRef(null);

  const [dish, setDish] = useState({
    name: "",
    category: "Shakes & Lassi",
    price: "",
    image: "",
  });

  // =========================
  // LOAD ORDERS
  // =========================

  const orderAudioRef = useRef(null);
  const audioUnlockedRef = useRef(false);

  const armOrderAudio = async () => {
    try {
      const audio = orderAudioRef.current;
      if (!audio || audioUnlockedRef.current) return;

      audio.loop = true;
      audio.muted = true;
      audio.volume = 0;
      audio.currentTime = 0;
      await audio.play();
      audioUnlockedRef.current = true;

      if (activeAlertOrderIdRef.current) {
        audio.currentTime = 0;
        audio.muted = false;
        audio.volume = 1;
      }
    } catch (error) {
      console.warn("Order alert audio waiting for page interaction.");
    }
  };

  const playOrderBell = () => {
    try {
      const audio = orderAudioRef.current;
      if (!audio || !audioUnlockedRef.current) return;
      audio.loop = true;
      audio.currentTime = 0;
      audio.muted = false;
      audio.volume = 1;
      const promise = audio.play();
      if (promise && typeof promise.catch === "function") promise.catch(() => {});
    } catch (error) {
      console.error("Order alert audio error:", error);
    }
  };

  const stopOrderAlertSound = () => {
    const audio = orderAudioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audio.muted = true;
    audio.volume = 0;
  };

  const startOrderAlertSound = (orderId) => {
    activeAlertOrderIdRef.current = String(orderId);
    playOrderBell();
  };

  useEffect(() => {
    const audio = new Audio("/traveloka.mp3");
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = 0;
    audio.muted = true;
    orderAudioRef.current = audio;

    // No Alert On button. Any normal Admin-page interaction unlocks audio.
    const unlock = () => { armOrderAudio(); };
    window.addEventListener("pointerdown", unlock, { passive: true });
    window.addEventListener("keydown", unlock, { passive: true });
    window.addEventListener("touchstart", unlock, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
      audio.pause();
      audio.src = "";
      orderAudioRef.current = null;
    };
  }, []);

  const testOrderSound = async () => {
    try {
      await armOrderAudio();
      const audio = orderAudioRef.current;
      if (!audio) return;
      audio.loop = false;
      audio.muted = false;
      audio.volume = 1;
      audio.currentTime = 0;
      await audio.play();
      setTimeout(() => {
        const current = orderAudioRef.current;
        if (!current) return;
        current.pause();
        current.currentTime = 0;
        current.loop = true;
        current.muted = true;
        current.volume = 0;
      }, 5000);
    } catch (error) {
      alert("Sound play nahi hua. Check karo ki public folder ke andar traveloka.mp3 hai.");
    }
  };

  const loadOrders = async ({ notify = false } = {}) => {
    if (!notify) {
      setLoadingOrders(true);
    }

    try {
      const response = await fetch(`${API}/orders`);
      const data = await response.json();

      const nextOrders = Array.isArray(data) ? data : [];

      // Stop the repeating alert as soon as the active order is no longer Pending.
      if (activeAlertOrderIdRef.current) {
        const activeOrder = nextOrders.find(
          (order) => String(order.id) === String(activeAlertOrderIdRef.current)
        );

        if (activeOrder && String(activeOrder.status || "Pending").trim().toLowerCase() !== "pending") {
          stopOrderAlertSound();
          activeAlertOrderIdRef.current = null;
          setNewOrderAlert(null);
        }
      }

      if (notify && hasInitialOrderSnapshotRef.current) {
        const newOrder = nextOrders.find(
          (order) => !knownOrderIdsRef.current.has(String(order.id))
        );

        if (newOrder) {
          setNewOrderAlert(newOrder);

          startOrderAlertSound(newOrder.id);
        }
      }

      knownOrderIdsRef.current = new Set(
        nextOrders.map((order) => String(order.id))
      );

      hasInitialOrderSnapshotRef.current = true;
      setOrders(nextOrders);
    } catch (error) {
      console.error("Orders error:", error);

      if (!notify) {
        setOrders([]);
      }
    } finally {
      if (!notify) {
        setLoadingOrders(false);
      }
    }
  };

  // =========================
// UPDATE ORDER STATUS
// =========================

const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await fetch(
      `${API}/orders/${encodeURIComponent(orderId)}/status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: status,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Could not update order status.");
      return;
    }

    if (String(status).trim().toLowerCase() !== "pending") {
      stopOrderAlertSound();
      if (String(activeAlertOrderIdRef.current) === String(orderId)) {
        activeAlertOrderIdRef.current = null;
        setNewOrderAlert(null);
      }
    }

    await loadOrders();
  } catch (error) {
    console.error("Status update error:", error);
    alert("Backend connection failed.");
  }
};


// =========================
// UPDATE PAYMENT STATUS
// =========================

const updatePaymentStatus = async (orderId, payment_status) => {
  try {
    const response = await fetch(
      `${API}/orders/${encodeURIComponent(orderId)}/payment-status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          payment_status,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Could not update payment status.");
      return;
    }

    await loadOrders();
  } catch (error) {
    console.error("Payment status update error:", error);
    alert("Backend connection failed.");
  }
};

  // =========================
  // LOAD MENU
  // =========================

  const loadMenu = async () => {
  try {
    setLoadingMenu(true);

    const response = await fetch(
      "https://the-shakes-reign.onrender.com/menu"
    );

    if (!response.ok) {
      throw new Error(`Menu API error: ${response.status}`);
    }

    const data = await response.json();

    console.log("LIVE MENU DATA:", data);

    if (!Array.isArray(data)) {
      throw new Error("Menu data is not an array");
    }

    setMenu(data);
  } catch (error) {
    console.error("Menu loading error:", error);
    setMenu([]);
  } finally {
    setLoadingMenu(false);
  }
};
  // =========================
  // LOAD DATA
  // =========================

  useEffect(() => {
    loadOrders();
    loadMenu();

    const orderPolling = setInterval(() => {
      loadOrders({ notify: true });
    }, 10000);

    return () => {
      clearInterval(orderPolling);
      stopOrderAlertSound();
    };
  }, []);

  // =========================
  // REFRESH
  // =========================

  const refreshAll = () => {
    loadOrders();
    loadMenu();
  };

  // =========================
  // ORDER STATS
  // =========================

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  // =========================
  // MENU ITEMS
  // =========================

  const allMenuItems = menu.flatMap((category) =>
    Array.isArray(category.items)
      ? category.items.map((item) => ({
          ...item,
          category: category.category,
        }))
      : []
  );

  const availableCount = allMenuItems.filter(
    (item) => item.available
  ).length;

  const outOfStockCount = allMenuItems.filter(
    (item) => !item.available
  ).length;

  const filteredItems = allMenuItems.filter((item) =>
    String(item.name || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );
// =========================
// ADD CATEGORY
// =========================

const addCategory = async () => {
  const categoryName = window.prompt(
    "Enter new category name:"
  );

  if (!categoryName || !categoryName.trim()) {
    return;
  }

  try {
    const response = await fetch(`${API}/menu/category`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        category: categoryName.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Could not add category.");
      return;
    }

    await loadMenu();

    setDish((previous) => ({
      ...previous,
      category: categoryName.trim(),
    }));

    alert("Category added successfully!");
  } catch (error) {
    console.error("Add category error:", error);
    alert("Backend connection failed.");
  }
};
  // =========================
  // ADD DISH
  // =========================

  const addDish = async () => {
    if (!dish.name.trim() || !dish.price) {
      alert("Please enter dish name and price.");
      return;
    }

    try {
      const response = await fetch(`${API}/menu`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: dish.name.trim(),
          category: dish.category,
          price: Number(dish.price),
          image: dish.image.trim(),
          available: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Could not add dish.");
        return;
      }

      setDish({
        name: "",
        category: "Shakes & Lassi",
        price: "",
        image: "",
      });

      await loadMenu();

      alert("Dish added successfully!");
    } catch (error) {
      console.error("Add dish error:", error);
      alert("Backend connection failed.");
    }
  };

  // =========================
  // TOGGLE STOCK
  // =========================

  const toggleAvailability = async (event, id) => {
  event.preventDefault();
  event.stopPropagation();

  try {
    const response = await fetch(
      `${API}/menu/${encodeURIComponent(id)}/toggle`,
      {
        method: "PATCH",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Could not update availability.");
      return;
    }

    await loadMenu();
  } catch (error) {
    console.error("Toggle error:", error);
    alert("Backend connection failed.");
  }
};
  // =========================
  // DELETE DISH
  // =========================

  const deleteDish = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this dish?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API}/menu/${encodeURIComponent(id)}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Could not delete dish.");
        return;
      }

      await loadMenu();

      alert("Dish deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Backend connection failed.");
    }
  };

  return (
    <div className="admin-page">

      {/* ================= HEADER ================= */}

      <header className="admin-header">
        <div>
          <h1>The Shakes Reign</h1>
          <p>Restaurant Admin Dashboard</p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            className="refresh-btn"
            onClick={refreshAll}
            type="button"
          >
            ↻ Refresh
          </button>
        </div>
      </header>

      {/* ================= NEW ORDER ALERT ================= */}

      {newOrderAlert && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0, 0, 0, 0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "420px",
              background: "#fff",
              borderRadius: "22px",
              padding: "30px",
              textAlign: "center",
              boxShadow: "0 25px 70px rgba(0,0,0,0.35)",
              border: "3px solid #b40000",
              animation: "newOrderPop 0.35s ease-out",
            }}
          >
            <div style={{ fontSize: "58px", marginBottom: "8px" }}>🔔</div>

            <h2
              style={{
                margin: "0 0 10px",
                color: "#b40000",
                fontSize: "28px",
              }}
            >
              NEW ORDER RECEIVED!
            </h2>

            <p
              style={{
                margin: "8px 0",
                fontWeight: "700",
                fontSize: "18px",
              }}
            >
              Order #{newOrderAlert.id}
            </p>

            <p style={{ margin: "8px 0" }}>
              👤 {newOrderAlert.customer_name || "Customer"}
            </p>

            <p
              style={{
                margin: "8px 0 22px",
                fontSize: "24px",
                fontWeight: "800",
                color: "#b40000",
              }}
            >
              ₹{newOrderAlert.total || 0}
            </p>

            <button
              type="button"
              onClick={() => {
                setNewOrderAlert(null);
                setActiveTab("orders");
              }}
              style={{
                width: "100%",
                padding: "14px",
                border: "none",
                borderRadius: "12px",
                background: "#b40000",
                color: "#fff",
                fontSize: "16px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              View Order
            </button>

            <button
              type="button"
              onClick={() => setNewOrderAlert(null)}
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "11px",
                border: "1px solid #ddd",
                borderRadius: "12px",
                background: "#fff",
                color: "#333",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes newOrderPop {
          from {
            opacity: 0;
            transform: scale(0.85);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      {/* ================= MAIN ================= */}

      <main className="admin-container">

        {/* TITLE */}

        <div className="admin-title">
          <p className="admin-label">
            DASHBOARD
          </p>

          <h2>
            Restaurant Management
          </h2>

          <p className="admin-subtitle">
            Manage orders and your online menu from one place.
          </p>
        </div>

        {/* ================= STATS ================= */}

        <div className="admin-stats">

          <div className="stat-card">
            <span className="stat-icon">
              📦
            </span>

            <div>
              <p>Total Orders</p>
              <h3>
                {orders.length}
              </h3>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              ₹
            </span>

            <div>
              <p>Total Revenue</p>
              <h3>
                ₹{totalRevenue}
              </h3>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              🍽️
            </span>

            <div>
              <p>Menu Items</p>
              <h3>
                {allMenuItems.length}
              </h3>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">
              🔴
            </span>

            <div>
              <p>Out of Stock</p>
              <h3>
                {outOfStockCount}
              </h3>
            </div>
          </div>

        </div>

        {/* ================= TABS ================= */}

<div className="admin-tabs">

  <button
    type="button"
    className={`admin-tab ${activeTab === "orders" ? "active" : ""}`}
    onClick={() => setActiveTab("orders")}
  >
    📦 Orders
  </button>

  <button
    type="button"
    className={`admin-tab ${activeTab === "menu" ? "active" : ""}`}
    onClick={() => setActiveTab("menu")}
  >
    🍽️ Menu Management
  </button>

</div>
{/* ================= ORDERS ================= */}

{activeTab === "orders" && (
<section className="orders-management">

  <div className="orders-heading">
    <div>
      <h2>Customer Orders</h2>
      <p>Manage incoming orders and update their status.</p>
    </div>

    <button
      className="refresh-btn"
      onClick={loadOrders}
    >
      ↻ Refresh Orders
    </button>
  </div>

  {loadingOrders ? (
    <div className="no-orders">
      <div>⏳</div>
      <h3>Loading orders...</h3>
    </div>
  ) : orders.length === 0 ? (
    <div className="no-orders">
      <div>📦</div>
      <h3>No orders yet</h3>
      <p>Customer orders will appear here.</p>
    </div>
  ) : (
    <div className="orders-list">

      {orders.map((order) => (

        <div className="order-admin-card" key={order.id}>

          <div className="order-admin-top">

            <div>
              <span className="order-id">
                Order #{order.id}
              </span>

              <h3>
                {order.customer_name || "Customer"}
              </h3>

              <p>
                📞 {order.phone || "No phone"}
              </p>

              <p>
                📍 {order.address || "No address"}
              </p>
            </div>

            <div className="order-total">
              ₹{order.total || 0}
            </div>

          </div>

          {/* ORDER ITEMS */}

          <div className="order-items">

            <h4>Items</h4>

            {Array.isArray(order.items) ? (
              order.items.map((item, index) => (
                <div
                  className="order-item-row"
                  key={index}
                >
                  <span>
                    {item.name || "Item"}
                  </span>

                  <span>
                    × {item.quantity || 1}
                  </span>
                </div>
              ))
            ) : (
              <p>No item details available.</p>
            )}

          </div>

          {/* STATUS */}

          <div className="order-status-area">

            <label>
              Order Status
            </label>

            <select
              value={order.status || "Pending"}
              onChange={(e) =>
                updateOrderStatus(
                  order.id,
                  e.target.value
                )
              }
            >
              <option value="Pending">
                Pending
              </option>

              <option value="Confirmed">
                Confirmed
              </option>

              <option value="Rejected">
                Rejected
              </option>

              <option value="Preparing">
                Preparing
              </option>

              <option value="Completed">
                Completed
              </option>
            </select>

          </div>


          <div className="payment-status-control">

            <label>
              Payment Status
            </label>

            <select
              value={order.payment_status || "Not Paid"}
              onChange={(e) =>
                updatePaymentStatus(
                  order.id,
                  e.target.value
                )
              }
            >
              <option value="Not Paid">
                🔴 Not Paid
              </option>

              <option value="Pending Verification">
                🟠 Pending Verification
              </option>

              <option value="Verified">
                🟢 Verified
              </option>

              <option value="Rejected">
                ❌ Rejected
              </option>
            </select>

          </div>

        </div>

      ))}

    </div>
  )}

</section>
)}

        {/* ================= MENU ================= */}

{activeTab === "menu" && (
        <section className="menu-management">

          {/* MENU HEADING */}

          <div className="menu-heading">

            <div>
              <h2>
                Menu Management
              </h2>

              <p>
                {availableCount} available •{" "}
                {outOfStockCount} out of stock
              </p>
            </div>

            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              className="order-search"
            />

          </div>

          {/* ================= ADD DISH ================= */}

          <div className="add-dish-card">

            <h3>
              Add New Dish
            </h3>
<button
  className="add-category-btn"
  onClick={addCategory}
>
  ＋ Add Category
</button>
            <div className="dish-form">

              {/* DISH NAME */}

              <div>
                <label>
                  Dish Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Chocolate Shake"
                  value={dish.name}
                  onChange={(e) =>
                    setDish({
                      ...dish,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              {/* CATEGORY */}

              <div>
                <label>
                  Category
                </label>

                <select
                  value={dish.category}
                  onChange={(e) =>
                    setDish({
                      ...dish,
                      category: e.target.value,
                    })
                  }
                >
                  {menu.map((category) => (
                    <option
                      key={category.category}
                      value={category.category}
                    >
                      {category.category}
                    </option>
                  ))}

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* PRICE */}

              <div>
                <label>
                  Price (₹)
                </label>

                <input
                  type="number"
                  placeholder="129"
                  value={dish.price}
                  onChange={(e) =>
                    setDish({
                      ...dish,
                      price: e.target.value,
                    })
                  }
                />
              </div>

              {/* IMAGE */}

              <div>
                <label>
                  Image URL
                </label>

                <input
                  type="text"
                  placeholder="https://..."
                  value={dish.image}
                  onChange={(e) =>
                    setDish({
                      ...dish,
                      image: e.target.value,
                    })
                  }
                />
              </div>

            </div>

            <button
              className="add-dish-btn"
              onClick={addDish}
            >
              ＋ Add Dish
            </button>

          </div>

          {/* ================= MENU LIST ================= */}

          <div className="menu-list">

            {loadingMenu ? (

              <div className="no-orders">
                <div>⏳</div>

                <h3>
                  Loading menu...
                </h3>
              </div>

            ) : filteredItems.length === 0 ? (

              <div className="no-orders">
                <div>🍽️</div>

                <h3>
                  No dishes found
                </h3>

                <p>
                  Try another search.
                </p>
              </div>

            ) : (

              filteredItems.map((item) => (

                <div
                  className={`menu-admin-card ${
                    !item.available
                      ? "out-of-stock"
                      : ""
                  }`}
                  key={item.id}
                >

                  {/* DISH INFO */}

                  <div className="menu-admin-info">

                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="menu-admin-image"
                      />
                    )}

                    <div>

                      <span className="menu-category">
                        {item.category}
                      </span>

                      <h3>
                        {item.name}
                      </h3>

                      <strong>
                        ₹{item.price}
                      </strong>

                    </div>

                  </div>

                  {/* ACTIONS */}

                  <div className="menu-admin-actions">

                    <button
  type="button"
  className={
    item.available
      ? "stock-btn available"
      : "stock-btn unavailable"
  }
  onClick={(event) =>
    toggleAvailability(event, item.id)
  }
>
  {item.available
    ? "🟢 Available"
    : "🔴 Out of Stock"}
</button>

                    <button
                      className="delete-dish-btn"
                      onClick={() =>
                        deleteDish(item.id)
                      }
                    >
                      🗑️ Delete
                    </button>

                  </div>

                </div>

              ))
            )}

          </div>

        </section>
)}

      </main>

    </div>
  );
}

export default Admin;