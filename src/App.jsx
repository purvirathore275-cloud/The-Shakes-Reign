import { useEffect, useRef, useState } from "react";
import "./App.css";

import Admin from "./admin/Admin";
import AdminLogin from "./admin/AdminLogin";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

const API = "https://the-shakes-reign.onrender.com";

function App() {
  // =========================
  // CART
  // =========================

  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const customerNameRef = useRef(null);
  const customerPhoneRef = useRef(null);
  const customerAddressRef = useRef(null);

  // =========================
  // MENU
  // =========================

  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);

  // =========================
  // ADMIN LOGIN
  // =========================

  const [adminLoggedIn, setAdminLoggedIn] = useState(false);

  // =========================
  // ORDER TRACKING
  // =========================

  const [trackingOrderId, setTrackingOrderId] = useState(
    () =>
      localStorage.getItem("shakesReignOrderId") || ""
  );

  const [trackingStatus, setTrackingStatus] =
    useState("Pending");

  // =========================
  // LOAD LIVE MENU
  // =========================

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setMenuLoading(true);

        const response = await fetch(
          `${API}/menu`
        );

        if (!response.ok) {
          throw new Error(
            `Menu error: ${response.status}`
          );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error(
            "Menu data is not an array"
          );
        }

        // Remove unavailable dishes
        const availableMenu = data
          .map((category) => ({
            ...category,
            items: Array.isArray(category.items)
              ? category.items.filter(
                  (item) => item.available !== false
                )
              : [],
          }))
          .filter(
            (category) => category.items.length > 0
          );

        setMenuItems(availableMenu);
      } catch (error) {
        console.error(
          "Menu loading error:",
          error
        );

        setMenuItems([]);
      } finally {
        setMenuLoading(false);
      }
    };

    loadMenu();
  }, []);

  // =========================
  // CUSTOMER ORDER STATUS
  // =========================

  useEffect(() => {
    if (!trackingOrderId) {
      return;
    }

    const loadOrderStatus = async () => {
      try {
        const response = await fetch(
          `${API}/orders/${encodeURIComponent(
            trackingOrderId
          )}/status`
        );

        const data = await response.json();

        if (!response.ok) {
          console.error(
            data.message ||
              "Could not load order status"
          );
          return;
        }

        setTrackingStatus(
          data.status || "Pending"
        );
      } catch (error) {
        console.error(
          "Order status error:",
          error
        );
      }
    };

    loadOrderStatus();

    const interval = setInterval(
      loadOrderStatus,
      10000
    );

    return () => {
      clearInterval(interval);
    };
  }, [trackingOrderId]);

  // =========================
  // ADD TO CART
  // =========================

  const addToCart = (item) => {
    setCart((previousCart) => {
      const existingItem = previousCart.find(
        (cartItem) =>
          cartItem.name === item.name
      );

      if (existingItem) {
        return previousCart.map(
          (cartItem) =>
            cartItem.name === item.name
              ? {
                  ...cartItem,
                  quantity:
                    cartItem.quantity + 1,
                }
              : cartItem
        );
      }

      return [
        ...previousCart,
        {
          name: item.name,
          price: Number(item.price) || 0,
          image: item.image || "",
          quantity: 1,
        },
      ];
    });

    setCartOpen(true);
  };

  // =========================
  // INCREASE QUANTITY
  // =========================

  const increaseQuantity = (name) => {
    setCart((previousCart) =>
      previousCart.map((item) =>
        item.name === name
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  };

  // =========================
  // DECREASE QUANTITY
  // =========================

  const decreaseQuantity = (name) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.name === name
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // =========================
  // TOTAL
  // =========================

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.price || 0) *
        Number(item.quantity || 1),
    0
  );

  const totalItems = cart.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 1),
    0
  );

  // =========================
  // ORDER ON WHATSAPP
  // =========================

  const orderOnWhatsApp = async () => {
    if (cart.length === 0) {
      alert(
        "Please add something to your cart first."
      );
      return;
    }

    const customerName = customerNameRef.current?.value || "";
    const customerPhone = customerPhoneRef.current?.value || "";
    const customerAddress = customerAddressRef.current?.value || "";

    if (!customerName.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!customerPhone.trim()) {
      alert("Please enter your phone number.");
      return;
    }

    if (!customerAddress.trim()) {
      alert("Please enter your delivery address.");
      return;
    }

    const order = {
      customer_name: customerName.trim(),
      phone: customerPhone.trim(),
      address: customerAddress.trim(),
      items: cart.map((item) => ({
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
      })),

      total: total,
    };

    try {
      const response = await fetch(
        `${API}/orders`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(order),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Order could not be saved"
        );
      }

      // Get order ID from backend
      const newOrderId =
        data?.order?.id;

      if (!newOrderId) {
        throw new Error(
          "Order ID was not received"
        );
      }

      // Save order ID
      localStorage.setItem(
        "shakesReignOrderId",
        String(newOrderId)
      );

      setTrackingOrderId(
        String(newOrderId)
      );

      setTrackingStatus(
        data?.order?.status ||
          "Pending"
      );

      // WhatsApp message
      const orderText = cart
        .map(
          (item) =>
            `${item.name} × ${
              item.quantity
            } — ₹${
              Number(item.price) *
              Number(item.quantity)
            }`
        )
        .join("\n");

      const message =
        `Hello, I want to order:\n\n` +
        `Order ID: #${newOrderId}\n` +
        `Name: ${customerName.trim()}\n` +
        `Phone: ${customerPhone.trim()}\n` +
        `Address: ${customerAddress.trim()}\n\n` +
        `${orderText}\n\n` +
        `Total: ₹${total}`;

      const whatsappWindow = window.open(
  `https://wa.me/919794428589?text=${encodeURIComponent(
    message
  )}`,
  "_blank"
);

if (!whatsappWindow) {
  alert("Please allow popups in your browser to continue with WhatsApp.");
  return;
}

setCartOpen(false);

alert(
  `Order #${newOrderId} created successfully.\n\nWhatsApp has been opened. Please tap Send in WhatsApp to complete your order.`
);
    } catch (error) {
      console.error(
        "Order error:",
        error
      );

      alert(
        "Order save nahi ho paya. Please try again."
      );
    }
  };

  // =========================
  // STATUS MESSAGE
  // =========================

  const getStatusMessage = () => {
    if (trackingStatus === "Preparing") {
      return "Your order is being prepared.";
    }

    if (trackingStatus === "Completed") {
      return "Your order is ready. Thank you! ❤️";
    }

    return "Your order has been received.";
  };

  // =========================
  // HOME PAGE
  // =========================

  const HomePage = () => {
    return (
      <div className="app">

        {/* ================= NAVBAR ================= */}

        <header className="navbar">

          <div className="logo">
            <img
              src="/logo.jpg"
              alt="The Shakes Reign"
            />
          </div>

          <nav>
            <a href="#home">
              Home
            </a>

            <a href="#menu">
              Menu
            </a>

            <a href="#about">
              About
            </a>

            <a href="#contact">
              Contact
            </a>
            <a href="#tracking">Track Order</a>
          </nav>

          <a
            href="#menu"
            className="nav-btn"
          >
            Order Now
          </a>

        </header>

        {/* ================= HERO ================= */}

        <section
          id="home"
          className="hero-section"
        >

          <div className="hero-content">

            <p className="hero-small">
              SHAKES • FOOD • BEVERAGES
            </p>

            <h1>
              The Taste
              <br />
              <span>
                of Home.
              </span>
            </h1>

            <p className="hero-text">
              Delicious shakes,
              refreshing beverages
              and comforting food —
              made to satisfy every
              craving.
            </p>

            <div className="hero-buttons">

              <a
                href="#menu"
                className="primary-btn"
              >
                Explore Menu
              </a>

              <a
                href="#contact"
                className="secondary-btn"
              >
                Order Now
              </a>

            </div>

          </div>

          <div className="hero-visual">

            <div className="shake-circle">

              <img
                src="/logo.jpg"
                alt="The Shakes Reign"
              />

            </div>

            <div className="floating-card card-one">
              ❤️ Fresh & Delicious
            </div>

            <div className="floating-card card-two">
              ❤️ Made With Love
            </div>

          </div>

        </section>

        {/* ================= MENU ================= */}

        <section
          id="menu"
          className="menu-section"
        >

          <div className="menu-heading">

            <p className="section-tag">
              OUR MENU
            </p>

            <h2>
              Something for{" "}
              <span>
                Every Craving
              </span>
            </h2>

            <p>
              Freshly prepared
              favourites from
              The Shakes Reign.
            </p>

          </div>

          {menuLoading ? (
            <div className="empty-cart">
              Loading menu...
            </div>
          ) : menuItems.length === 0 ? (
            <div className="empty-cart">
              Menu is currently
              unavailable.
            </div>
          ) : (
            menuItems.map(
              (section) => (
                <div
                  className="menu-category"
                  key={
                    section.category
                  }
                >

                  <h3 className="menu-category-title">
                    {section.category}
                  </h3>

                  <div className="menu-grid">

                    {section.items.map(
                      (item) => (
                        <div
                          className="menu-card"
                          key={
                            item.id ||
                            item.name
                          }
                        >

                          <div className="menu-image">

                            <img
                              src={
                                item.image
                              }
                              alt={
                                item.name
                              }
                              loading="lazy"
                            />

                          </div>

                          <div className="menu-card-content">

                            <h4>
                              {
                                item.name
                              }
                            </h4>

                            <div className="menu-bottom">

                              <span className="menu-price">
                                ₹
                                {
                                  item.price
                                }
                              </span>

                              <button
                                className="add-btn"
                                onClick={() =>
                                  addToCart(
                                    item
                                  )
                                }
                              >
                                + Add
                              </button>

                            </div>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                </div>
              )
            )
          )}

        </section>

        {/* ================= ABOUT ================= */}

        <section
          id="about"
          className="about-section"
        >

          <div>

            <p className="section-tag">
              ABOUT US
            </p>

            <h2>
              Made with love,
              <br />

              <span>
                served with happiness.
              </span>
            </h2>

            <p>
              At The Shakes Reign,
              we believe every shake
              should make your day
              a little sweeter. We
              prepare fresh and
              delicious food and
              beverages using quality
              ingredients and serve
              them with love.
            </p>

          </div>

        </section>

        {/* ================= CONTACT ================= */}

        <section
          id="contact"
          className="contact-section"
        >

          <p className="section-tag">
            GET IN TOUCH
          </p>

          <h2>
            Ready to satisfy
            your craving?
          </h2>

          <p>
            Have a craving?
            Let The Shakes Reign
            satisfy it!
          </p>

          <a
            href="https://wa.me/919794428589"
            className="primary-btn"
            target="_blank"
            rel="noreferrer"
          >
            💬 Order on WhatsApp
          </a>

        </section>

        {/* ================= CUSTOMER TRACKING ================= */}

        {trackingOrderId && (
          <section id="tracking" className="cart-section">
            <p className="section-tag">
              ORDER TRACKING
            </p>

            <h2>
              Order{" "}
              <span>
                #{trackingOrderId}
              </span>
            </h2>

            <div className="customer-order-tracking">

              <div className="tracking-status">

                <span
                  className={`status-dot ${trackingStatus
                    .toLowerCase()
                    .replace(
                      " ",
                      "-"
                    )}`}
                />

                <strong>
                  {trackingStatus}
                </strong>

              </div>

              <p className="tracking-message">
                {getStatusMessage()}
              </p>

            </div>

          </section>
        )}

        {/* ================= CART ================= */}

        <section className="cart-section">

          <p className="section-tag">
            YOUR CART
          </p>

          <h2>
            Your{" "}
            <span>
              Order
            </span>
          </h2>

          {cart.length === 0 ? (

            <p className="empty-cart">
              Your cart is empty.
              Add something delicious!
              🥤
            </p>

          ) : (

            <div className="cart-box">

              {cart.map(
                (item) => (
                  <div
                    className="cart-item"
                    key={item.name}
                  >

                    <div>
                      <strong>
                        {item.name}
                      </strong>

                      <div className="cart-item-price">
                        ₹
                        {item.price}
                      </div>
                    </div>

                    <div className="quantity-controls">

                      <button
                        onClick={() =>
                          decreaseQuantity(
                            item.name
                          )
                        }
                      >
                        −
                      </button>

                      <span>
                        {
                          item.quantity
                        }
                      </span>

                      <button
                        onClick={() =>
                          increaseQuantity(
                            item.name
                          )
                        }
                      >
                        +
                      </button>

                    </div>

                    <strong>
                      ₹
                      {Number(
                        item.price
                      ) *
                        Number(
                          item.quantity
                        )}
                    </strong>

                  </div>
                )
              )}

              <div className="cart-total">

                <span>
                  Total
                </span>

                <strong>
                  ₹{total}
                </strong>

              </div>

              <button
                className="whatsapp-order-btn"
                onClick={
                  orderOnWhatsApp
                }
              >
                💬 Order on WhatsApp
              </button>

            </div>

          )}

        </section>

        {/* ================= FOOTER ================= */}

        <footer>

          <p>
            © 2026 The Shakes Reign.
            All Rights Reserved.
          </p>

          <p>
            The Taste of Home ❤️
          </p>

        </footer>

        {/* ================= FLOATING CART ================= */}

        {cart.length > 0 && (
          <button
            className="floating-cart-btn"
            onClick={() =>
              setCartOpen(true)
            }
          >
            🛒{" "}
            <span>
              {totalItems}
            </span>
          </button>
        )}

        {/* ================= CART POPUP ================= */}

        {cartOpen && (
          <div className="cart-popup-overlay">

            <div className="cart-popup">

              <div className="cart-popup-header">

                <h3>
                  Your Cart
                </h3>

                <button
                  onClick={() =>
                    setCartOpen(false)
                  }
                >
                  ✕
                </button>

              </div>

              {cart.length === 0 ? (

                <p className="empty-cart">
                  Your cart is empty.
                </p>

              ) : (

                <>
                  <div
                    className="customer-details-form"
                    style={{
                      margin: "18px 0",
                      padding: "16px",
                      background: "#fff7f7",
                      border: "1px solid #f0d0d0",
                      borderRadius: "14px",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 12px",
                        color: "#b40000",
                      }}
                    >
                      Customer Details
                    </h4>

                    <input
                      type="text"
                      placeholder="Your Name"
                      ref={customerNameRef}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        marginBottom: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "9px",
                        outline: "none",
                        background: "#fff",
                        color: "#222",
                      }}
                    />

                    <input
                      type="tel"
                      placeholder="Phone Number"
                      ref={customerPhoneRef}
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        marginBottom: "10px",
                        border: "1px solid #ddd",
                        borderRadius: "9px",
                        outline: "none",
                        background: "#fff",
                        color: "#222",
                      }}
                    />

                    <textarea
                      placeholder="Delivery Address"
                      ref={customerAddressRef}
                      rows="3"
                      style={{
                        width: "100%",
                        padding: "12px 14px",
                        border: "1px solid #ddd",
                        borderRadius: "9px",
                        outline: "none",
                        background: "#fff",
                        color: "#222",
                        resize: "vertical",
                      }}
                    />
                  </div>

                  <div className="cart-popup-items">

                    {cart.map(
                      (item) => (
                        <div
                          className="cart-popup-item"
                          key={item.name}
                        >

                          <div>
                            <strong>
                              {item.name}
                            </strong>

                            <p>
                              ₹
                              {
                                item.price
                              }
                            </p>
                          </div>

                          <div className="quantity-controls">

                            <button
                              onClick={() =>
                                decreaseQuantity(
                                  item.name
                                )
                              }
                            >
                              −
                            </button>

                            <span>
                              {
                                item.quantity
                              }
                            </span>

                            <button
                              onClick={() =>
                                increaseQuantity(
                                  item.name
                                )
                              }
                            >
                              +
                            </button>

                          </div>

                        </div>
                      )
                    )}

                  </div>

                  <div className="cart-popup-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹{total}
                    </strong>

                  </div>

                  <button
                    className="whatsapp-order-btn"
                    onClick={
                      orderOnWhatsApp
                    }
                  >
                    💬 Order on WhatsApp
                  </button>

                </>
              )}

            </div>

          </div>
        )}

      </div>
    );
  };

  // =========================
  // ADMIN PAGE
  // =========================

  const AdminPage = () => {
    if (!adminLoggedIn) {
      return (
        <AdminLogin
          onLogin={() =>
            setAdminLoggedIn(true)
          }
        />
      );
    }

    return <Admin />;
  };

  // =========================
  // ROUTES
  // =========================

  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/admin"
          element={<AdminPage />}
        />

      </Routes>

    </BrowserRouter>
  );
}

export default App;