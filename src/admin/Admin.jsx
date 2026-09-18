import { useEffect, useState } from "react";
import "./Admin.css";

const API = "https://the-shakes-reign.onrender.com";
function Admin() {
  const [orders, setOrders] = useState([]);
  const [menu, setMenu] = useState([]);

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingMenu, setLoadingMenu] = useState(true);

  const [search, setSearch] = useState("");

  const [dish, setDish] = useState({
    name: "",
    category: "Shakes & Lassi",
    price: "",
    image: "",
  });

  // =========================
  // LOAD ORDERS
  // =========================

  const loadOrders = async () => {
    setLoadingOrders(true);

    try {
      const response = await fetch(`${API}/orders`);
      const data = await response.json();

      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Orders error:", error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  // =========================
  // LOAD MENU
  // =========================

  const loadMenu = async () => {
    setLoadingMenu(true);

    try {
      const response = await fetch(`${API}/menu`);
      const data = await response.json();

      const menuData = Array.isArray(data)
        ? data
        : Array.isArray(data.value)
        ? data.value
        : [];

      setMenu(menuData);
    } catch (error) {
      console.error("Menu error:", error);
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

  const toggleAvailability = async (id) => {
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

        <button
          className="refresh-btn"
          onClick={refreshAll}
        >
          ↻ Refresh
        </button>
      </header>

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

          <button className="admin-tab">
            📦 Orders
          </button>

          <button className="admin-tab active">
            🍽️ Menu Management
          </button>

        </div>

        {/* ================= MENU ================= */}

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
                      className={
                        item.available
                          ? "stock-btn available"
                          : "stock-btn unavailable"
                      }
                      onClick={() =>
                        toggleAvailability(item.id)
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

      </main>

    </div>
  );
}

export default Admin;