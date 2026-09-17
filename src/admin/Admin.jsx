import { useEffect, useState } from "react";
import "./Admin.css";

function Admin() {
  const [orders, setOrders] = useState([]);

  const loadOrders = () => {
    fetch("http://localhost:5000/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((error) => console.error(error));
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <div className="admin-page">

      <header className="admin-header">
        <h1>👑 The Shakes Reign</h1>
        <p>Admin Order Panel</p>
      </header>

      <main className="admin-container">

        <div className="admin-top">
          <div>
            <p className="admin-label">ORDER MANAGEMENT</p>
            <h2>Customer Orders</h2>
          </div>

          <button
            className="refresh-btn"
            onClick={loadOrders}
          >
            🔄 Refresh
          </button>
        </div>

        <div className="order-count">
          Total Orders: <strong>{orders.length}</strong>
        </div>

        {orders.length === 0 ? (
          <div className="no-orders">
            <div>📦</div>
            <h3>No orders yet</h3>
            <p>New customer orders will appear here.</p>
          </div>
        ) : (
          <div className="orders-list">

            {orders
              .slice()
              .reverse()
              .map((order) => (

                <div className="admin-order" key={order.id}>

                  <div className="order-header">
                    <div>
                      <span className="order-tag">
                        ORDER
                      </span>

                      <h3>#{order.id}</h3>
                    </div>

                    <span className="order-date">
                      {new Date(
                        order.createdAt
                      ).toLocaleString()}
                    </span>
                  </div>

                  <div className="order-items">

                    {order.items.map((item, index) => (

                      <div
                        className="admin-item"
                        key={index}
                      >

                        <span>
                          {item.name}
                          <small>
                            × {item.quantity}
                          </small>
                        </span>

                        <strong>
                          ₹{item.price * item.quantity}
                        </strong>

                      </div>

                    ))}

                  </div>

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