import { useEffect, useState } from "react";
import "./Admin.css";

function Admin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadOrders = () => {
    setLoading(true);

    fetch("https://the-shakes-reign.onrender.com/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const reversedOrders = orders.slice().reverse();

  const filteredOrders = reversedOrders.filter((order) =>
    String(order.id).toLowerCase().includes(search.toLowerCase())
  );

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  return (
    <div className="admin-page">

      {/* HEADER */}
      <header className="admin-header">
        <div>
          <h1>The Shakes Reign</h1>
          <p>Restaurant Admin Dashboard</p>
        </div>

        <button className="refresh-btn" onClick={loadOrders}>
          ↻ Refresh
        </button>
      </header>

      <main className="admin-container">

        {/* WELCOME */}
        <div className="admin-title">
          <div>
            <p className="admin-label">DASHBOARD</p>
            <h2>Order Management</h2>
            <p className="admin-subtitle">
              Manage and monitor your customer orders.
            </p>
          </div>
        </div>

        {/* STATS */}
        <div className="admin-stats">

          <div className="stat-card">
            <span className="stat-icon">📦</span>
            <div>
              <p>Total Orders</p>
              <h3>{orders.length}</h3>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">₹</span>
            <div>
              <p>Total Revenue</p>
              <h3>₹{totalRevenue}</h3>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">🛍️</span>
            <div>
              <p>Items Sold</p>
              <h3>
                {orders.reduce(
                  (sum, order) =>
                    sum +
                    order.items.reduce(
                      (itemSum, item) => itemSum + Number(item.quantity || 0),
                      0
                    ),
                  0
                )}
              </h3>
            </div>
          </div>

        </div>

        {/* ORDERS HEADER */}
        <div className="orders-toolbar">

          <div>
            <h2>Customer Orders</h2>
            <p>
              {filteredOrders.length} order
              {filteredOrders.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <input
            type="text"
            placeholder="Search order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="order-search"
          />

        </div>

        {/* LOADING */}
        {loading ? (
          <div className="no-orders">
            <div>⏳</div>
            <h3>Loading orders...</h3>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="no-orders">
            <div>📦</div>
            <h3>No orders found</h3>
            <p>Customer orders will appear here.</p>
          </div>
        ) : (

          <div className="orders-list">

            {filteredOrders.map((order) => (

              <div className="admin-order" key={order.id}>

                {/* ORDER HEADER */}
                <div className="order-header">

                  <div>
                    <span className="order-tag">
                      ORDER
                    </span>

                    <h3>#{order.id}</h3>
                  </div>

                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleString()}
                  </span>

                </div>

                {/* ITEMS */}
                <div className="order-items">

                  {order.items.map((item, index) => (

                    <div className="admin-item" key={index}>

                      <div>
                        <span>{item.name}</span>
                        <small>× {item.quantity}</small>
                      </div>

                      <strong>
                        ₹{item.price * item.quantity}
                      </strong>

                    </div>

                  ))}

                </div>

                {/* TOTAL */}
                <div className="order-total">

                  <span>Total Amount</span>

                  <strong>
                    ₹{order.total}
                  </strong>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>

    </div>
  );
}

export default Admin;