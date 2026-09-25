import QRCode from "qrcode";
import { useEffect, useRef, useState } from "react";
import "./App.css";

import Admin from "./admin/Admin";
import AdminLogin from "./admin/AdminLogin";

import {
  BrowserRouter,
  Routes,
  Route,
  Link,
} from "react-router-dom";

const API = "https://the-shakes-reign.onrender.com";

function App() {
  // =========================
  // CART
  // =========================

  const [cart, setCart] = useState([]);
  const [paymentOpen, setPaymentOpen] = useState(false);

const [paymentData, setPaymentData] = useState({
  qrCode: "",
  upiUrl: "",
  amount: "",
  customerName: "",
  customerPhone: "",
  customerAddress: "",
});
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  // SECTION NAVIGATION
  // =========================

  const goToSection = (sectionId) => {
    if (window.location.pathname !== "/") {
      sessionStorage.setItem("scrollToSection", sectionId);
      window.location.href = `/#${sectionId}`;
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.history.replaceState(
      null,
      "",
      `#${sectionId}`
    );
  };

  useEffect(() => {
    const sectionId =
      sessionStorage.getItem("scrollToSection") ||
      window.location.hash.replace("#", "");

    if (!sectionId) return;

    sessionStorage.removeItem("scrollToSection");

    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 300);
  }, []);

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
// UPI PAYMENT
// =========================

const payOnline = async () => {
  if (cart.length === 0) {
    alert("Please add something to your cart first.");
    return;
  }

  const customerName =
    customerNameRef.current?.value || "";

  const customerPhone =
    customerPhoneRef.current?.value || "";

  const customerAddress =
    customerAddressRef.current?.value || "";

  if (!customerName.trim()) {
    alert("Please enter your name first.");
    return;
  }

  if (!customerPhone.trim()) {
    alert("Please enter your phone number first.");
    return;
  }

  if (!customerAddress.trim()) {
    alert("Please enter your delivery address first.");
    return;
  }

  const upiUrl =
    `upi://pay?pa=umasingh007@axisbank` +
    `&pn=The%20Shakes%20Reign` +
    `&am=${Number(total).toFixed(2)}` +
    `&cu=INR` +
    `&tn=The%20Shakes%20Reign%20Order`;

  try {
    const qrCode = await QRCode.toDataURL(upiUrl);

    setPaymentData({
  qrCode,
  upiUrl,
  amount: Number(total).toFixed(2),
  customerName: customerName.trim(),
  customerPhone: customerPhone.trim(),
  customerAddress: customerAddress.trim(),
});
    setPaymentOpen(true);
  } catch (error) {
    console.error("QR generation error:", error);
    alert("Payment QR create nahi ho paya. Please try again.");
  }
};
  // =========================
  // ORDER ON WHATSAPP
  // =========================

  const orderOnWhatsApp = async (paidCustomer = null) => {
    if (cart.length === 0) {
      alert(
        "Please add something to your cart first."
      );
      return;
    }

    const customerName =
  paidCustomer?.customerName ||
  customerNameRef.current?.value ||
  "";

const customerPhone =
  paidCustomer?.customerPhone ||
  customerPhoneRef.current?.value ||
  "";

const customerAddress =
  paidCustomer?.customerAddress ||
  customerAddressRef.current?.value ||
  "";
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
      // Open a blank WhatsApp tab immediately from the button click.
      // This prevents the browser popup blocker from blocking WhatsApp
      // after the backend request finishes.
      const whatsappWindow = window.open("about:blank", "_blank");

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

      const whatsappUrl =
        `https://wa.me/919794428589?text=${encodeURIComponent(
          message
        )}`;

      if (whatsappWindow) {
        whatsappWindow.location.href = whatsappUrl;
      } else {
        // Fallback if the browser blocked the blank tab.
        window.location.href = whatsappUrl;
      }

      // Close cart
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
    if (trackingStatus === "Confirmed") {
      return "Your order has been confirmed by the restaurant.";
    }

    if (trackingStatus === "Preparing") {
      return "Your order is being prepared.";
    }

    if (trackingStatus === "Completed") {
      return "Your order is ready. Thank you! ❤️";
    }

    return "Waiting for restaurant confirmation.";
  };

  // =========================
  // HOME PAGE
  // =========================

  const HomePage = () => {
    return (
      <div className="app">

        {/* ================= NAVBAR ================= */}
        <header className={`navbar ${mobileMenuOpen ? "menu-open" : ""}`}>
          <Link
            to="/"
            className="brand-text"
            onClick={() => setMobileMenuOpen(false)}
          >
            The Shakes Reign
          </Link>

          <nav className="desktop-nav">
            <a href="#home">Home</a>
            <Link to="/menu">Menu</Link>
            <a href="#about">About Us</a>
            <a
              href="#reviews"
              onClick={(e) => {
                e.preventDefault();
                goToSection("reviews");
                setMobileMenuOpen(false);
              }}
            >
              Reviews
            </a>
            <a href="#contact">Contact</a>
            <a href="#tracking">Track Order</a>
          </nav>

          <div className="nav-actions">
            <button
              type="button"
              className="nav-cart-btn"
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
            >
              🛒
              {totalItems > 0 && <span>{totalItems}</span>}
            </button>

            <Link
              to="/menu"
              className="nav-btn desktop-order-btn"
            >
              Order Now
            </Link>

            <button
              type="button"
              className={`hamburger-btn ${
                mobileMenuOpen ? "is-open" : ""
              }`}
              onClick={() =>
                setMobileMenuOpen((previous) => !previous)
              }
              aria-label={
                mobileMenuOpen ? "Close menu" : "Open menu"
              }
              aria-expanded={mobileMenuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>

          <div className={`mobile-menu ${mobileMenuOpen ? "show" : ""}`}>
            <a
              href="#home"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </a>
            <Link
              to="/menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              Menu
            </Link>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </a>
            <a
              href="#reviews"
              onClick={() => setMobileMenuOpen(false)}
            >
              Reviews
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </a>
            <a
              href="#tracking"
              onClick={() => setMobileMenuOpen(false)}
            >
              Track Order
            </a>

            <div className="mobile-menu-divider" />

            <button
              type="button"
              className="mobile-cart-link"
              onClick={() => {
                setCartOpen(true);
                setMobileMenuOpen(false);
              }}
            >
              🛒 View Cart
            </button>

            <Link
              to="/menu"
              className="mobile-order-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              🔴 Order Now
            </Link>
          </div>
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

              <Link
                to="/menu"
                className="primary-btn"
              >
                Explore Menu
              </Link>

              <Link
                to="/menu"
                className="secondary-btn"
              >
                Order Now
              </Link>

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

        {/* ================= ABOUT US ================= */}

<section
  id="about"
  className="about-section"
>
  <div className="about-content">

    <p className="about-tag">
      OUR STORY
    </p>

    <h2>
      The Story Behind{" "}
      <span>The Shakes Reign</span>
    </h2>

    <p className="about-text">
      The Shakes Reign began as a small cloud kitchen in 2019,
      founded by our beloved <strong>son and brother, Varun Singh Rathore.</strong>
    </p>

    <p className="about-text">
      After losing him in 2024, his parents and sisters revived
      his dream in 2025. Today, we dream of taking his vision
      from a small city to a global chain that cares about people,
      animals, and every living being.
    </p>

    <div className="about-highlight">
      <span>❤️</span>

      <div>
        <strong>Help us take his dream forward.</strong>

        <p>
          Every order, review, share, and kind word makes you
          a part of this journey.
        </p>
      </div>
    </div>

    <p className="about-connect">
      Join us, support his dream, and help us take it forward.
      To connect with Varun's journey, find us on{" "}
      <a
        href="https://www.instagram.com/"
        target="_blank"
        rel="noreferrer"
      >
        Instagram
      </a>
      {" "}and{" "}
      <a
        href="https://wa.me/919794428589"
        target="_blank"
        rel="noreferrer"
      >
        WhatsApp
      </a>
      .
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
    Let's <span>Connect</span>
  </h2>

  <p className="contact-subtitle">
    Have a craving, a question, or just want to connect?
    We would love to hear from you.
  </p>

  <div className="contact-buttons">

    <a
      href="https://wa.me/919794428589"
      className="contact-btn whatsapp-btn"
      target="_blank"
      rel="noreferrer"
    >
      <span className="contact-icon">💬</span>
      <span>
        <strong>WhatsApp</strong>
        <small>Order & Chat With Us</small>
      </span>
    </a>

    <a
  href="https://www.instagram.com/theunderratedhuman_/"
  className="contact-btn instagram-btn"
  target="_blank"
  rel="noreferrer"
>
  <span className="contact-icon">📸</span>
  <span>
    <strong>Instagram</strong>
    <small>@theunderratedhuman_</small>
  </span>
</a>

<a
  href="https://www.instagram.com/the.shakes.reign_/"
  className="contact-btn instagram-btn"
  target="_blank"
  rel="noreferrer"
>
  <span className="contact-icon">📸</span>
  <span>
    <strong>Instagram</strong>
    <small>@the.shakes.reign_</small>
  </span>
</a>
    <a
      href="mailto:theshakesreign@gmail.com"
      className="contact-btn email-btn"
    >
      <span className="contact-icon">✉️</span>
      <span>
        <strong>Email Us</strong>
        <small>theshakesreign@gmail.com</small>
      </span>
    </a>

    <a
      href="https://www.facebook.com/share/1Avid6KZPU/"
      className="contact-btn facebook-btn"
      target="_blank"
      rel="noreferrer"
    >
      <span className="contact-icon">f</span>
      <span>
        <strong>Facebook</strong>
        <small>Follow Our Journey</small>
      </span>
    </a>

    <a
      href="https://zomato.onelink.me/xqzv/ijomh2h0"
      className="contact-btn zomato-btn"
      target="_blank"
      rel="noreferrer"
    >
      <span className="contact-icon">🍽️</span>
      <span>
        <strong>Order on Zomato</strong>
        <small>Find Us on Zomato</small>
      </span>
    </a>

  </div>

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

              <div className="tracking-timeline">

                <div
                  className={`tracking-step ${
                    [
                      "Pending",
                      "Confirmed",
                      "Preparing",
                      "Completed",
                    ].includes(trackingStatus)
                      ? "active"
                      : ""
                  }`}
                >
                  <div className="tracking-icon">🛒</div>

                  <div>
                    <strong>Order Placed</strong>
                    <p>Your order has been submitted.</p>
                  </div>
                </div>

                <div
                  className={`tracking-line ${
                    [
                      "Confirmed",
                      "Preparing",
                      "Completed",
                    ].includes(trackingStatus)
                      ? "active"
                      : ""
                  }`}
                />

                <div
                  className={`tracking-step ${
                    [
                      "Confirmed",
                      "Preparing",
                      "Completed",
                    ].includes(trackingStatus)
                      ? "active"
                      : ""
                  }`}
                >
                  <div className="tracking-icon">✅</div>

                  <div>
                    <strong>Confirmed</strong>
                    <p>Restaurant has confirmed your order.</p>
                  </div>
                </div>

                <div
                  className={`tracking-line ${
                    [
                      "Preparing",
                      "Completed",
                    ].includes(trackingStatus)
                      ? "active"
                      : ""
                  }`}
                />

                <div
                  className={`tracking-step ${
                    [
                      "Preparing",
                      "Completed",
                    ].includes(trackingStatus)
                      ? "active"
                      : ""
                  }`}
                >
                  <div className="tracking-icon">👨‍🍳</div>

                  <div>
                    <strong>Preparing</strong>
                    <p>Your order is being prepared.</p>
                  </div>
                </div>

                <div
                  className={`tracking-line ${
                    trackingStatus === "Completed"
                      ? "active"
                      : ""
                  }`}
                />

                <div
                  className={`tracking-step ${
                    trackingStatus === "Completed"
                      ? "active"
                      : ""
                  }`}
                >
                  <div className="tracking-icon">🎉</div>

                  <div>
                    <strong>Completed</strong>
                    <p>Your order is ready. Thank you! ❤️</p>
                  </div>
                </div>

              </div>

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
  className="upi-payment-btn"
  onClick={payOnline}
>
  💳 Pay Online with UPI
</button>
              <button
                className="whatsapp-order-btn"
                onClick={
                  orderOnWhatsApp
                }
              >
                💬 Order on WhatsApp
              </button>
              <button
  className="whatsapp-order-btn"
  onClick={payOnline}
  style={{
    marginTop: "10px",
    background: "#3b7d3b",
  }}
>
  💳 Pay Online
</button>

            </div>

          )}

        </section>

        <CartUI />

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

      </div>
    );
  };

  // =========================
  // GLOBAL CART UI
  // =========================

  const CartUI = () => (
    <>
      {cart.length > 0 && (
        <button
          className="floating-cart-btn"
          onClick={() => setCartOpen(true)}
          aria-label="Open cart"
        >
          🛒 <span>{totalItems}</span>
        </button>
      )}

      {cartOpen && (
        <div className="cart-popup-overlay">
          <div className="cart-popup">
            <div className="cart-popup-header">
              <h3>Your Cart</h3>
              <button
                onClick={() => setCartOpen(false)}
                aria-label="Close cart"
              >
                ✕
              </button>
            </div>

            {cart.length === 0 ? (
              <p className="empty-cart">Your cart is empty.</p>
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
                  />

                  <input
                    type="tel"
                    placeholder="Phone Number"
                    ref={customerPhoneRef}
                  />

                  <textarea
                    placeholder="Delivery Address"
                    ref={customerAddressRef}
                    rows="3"
                  />
                </div>

                <div className="cart-popup-items">
                  {cart.map((item) => (
                    <div
                      className="cart-popup-item"
                      key={item.name}
                    >
                      <div>
                        <strong>{item.name}</strong>
                        <p>₹{item.price}</p>
                      </div>

                      <div className="quantity-controls">
                        <button
                          onClick={() =>
                            decreaseQuantity(item.name)
                          }
                        >
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          onClick={() =>
                            increaseQuantity(item.name)
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-popup-total">
                  <span>Total</span>
                  <strong>₹{total}</strong>
                </div>

                <button
                  className="whatsapp-order-btn"
                  onClick={orderOnWhatsApp}
                >
                  💬 Order on WhatsApp
                </button>

                <button
  className="whatsapp-order-btn"
  onClick={payOnline}
  style={{
    marginTop: "10px",
    background: "#3b7d3b",
  }}
>
  💳 Pay Online
</button>
              </>
            )}
          </div>
        </div>
      )}
      {paymentOpen && (
  <div className="cart-popup-overlay">
    <div className="cart-popup payment-popup">

      <div className="cart-popup-header">
        <h3>Pay Online</h3>

        <button onClick={() => setPaymentOpen(false)}>
          ✕
        </button>
      </div>

      <p className="payment-amount">
        Pay ₹{paymentData.amount}
      </p>

      <p className="payment-instruction">
        Scan this QR using GPay, PhonePe, Paytm, Navi or any UPI app.
      </p>
<div className="upi-details">
  <span>UPI ID</span>

  <strong>umasingh007@axisbank</strong>

  <button
    type="button"
    onClick={() => {
      navigator.clipboard.writeText(
        "umasingh007@axisbank"
      );

      alert("UPI ID copied!");
    }}
  >
    📋 Copy UPI ID
  </button>
</div>
      {paymentData.qrCode && (
        <img
          src={paymentData.qrCode}
          alt="UPI Payment QR Code"
          className="payment-qr"
        />
      )}

      <button
  type="button"
  className="whatsapp-order-btn"
  onClick={() => {
    const isMobile =
      /Android|iPhone|iPad|iPod/i.test(
        navigator.userAgent
      );

    if (!isMobile) {
      alert(
        "Please scan the QR code using your phone's UPI app."
      );
      return;
    }

    window.location.href = paymentData.upiUrl;
  }}
>
  📱 Open UPI App
</button>
      <p className="payment-note">
        Payment complete karne ke baad WhatsApp par order details send karein.
      </p>
      <button
  type="button"
  className="payment-paid-btn"
  onClick={() => {
    setPaymentOpen(false);
    orderOnWhatsApp(paymentData);
  }}
>
  ✅ I Have Paid — Continue
</button>

    </div>
  </div>
)}
    </>
  );

  // =========================
  // DEDICATED MENU PAGE
  // =========================

  const MenuPage = () => {
    return (
      <div className="app menu-page">
        <header className={`navbar ${mobileMenuOpen ? "menu-open" : ""}`}>
          <Link
            to="/"
            className="brand-text"
            onClick={() => setMobileMenuOpen(false)}
          >
            The Shakes Reign
          </Link>

          <nav className="desktop-nav">
            <Link to="/">Home</Link>
            <Link to="/menu">Menu</Link>
            <Link to="/#about">About Us</Link>
            <a
              href="#reviews"
              onClick={(e) => {
                e.preventDefault();
                goToSection("reviews");
                setMobileMenuOpen(false);
              }}
            >
              Reviews
            </a>
            <Link to="/#contact">Contact</Link>
          </nav>

          <div className="nav-actions">
            <button
              type="button"
              className="nav-cart-btn"
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
            >
              🛒
              {totalItems > 0 && <span>{totalItems}</span>}
            </button>

            <Link
              to="/menu"
              className="nav-btn desktop-order-btn"
            >
              Order Now
            </Link>

            <button
              type="button"
              className={`hamburger-btn ${
                mobileMenuOpen ? "is-open" : ""
              }`}
              onClick={() =>
                setMobileMenuOpen((previous) => !previous)
              }
              aria-label={
                mobileMenuOpen ? "Close menu" : "Open menu"
              }
              aria-expanded={mobileMenuOpen}
            >
              <span />
              <span />
              <span />
            </button>
          </div>

          <div className={`mobile-menu ${mobileMenuOpen ? "show" : ""}`}>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/menu"
              onClick={() => setMobileMenuOpen(false)}
            >
              Menu
            </Link>
            <Link
              to="/#about"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              to="/#reviews"
              onClick={() => setMobileMenuOpen(false)}
            >
              Reviews
            </Link>
            <Link
              to="/#contact"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>

            <div className="mobile-menu-divider" />

            <button
              type="button"
              className="mobile-cart-link"
              onClick={() => {
                setCartOpen(true);
                setMobileMenuOpen(false);
              }}
            >
              🛒 View Cart
            </button>

            <Link
              to="/menu"
              className="mobile-order-btn"
              onClick={() => setMobileMenuOpen(false)}
            >
              🔴 Order Now
            </Link>
          </div>
        </header>

        <main className="dedicated-menu-page">
          <div className="dedicated-menu-hero">
            <p className="section-tag">THE SHAKES REIGN</p>
            <h1>
              Choose Your <span>Craving.</span>
            </h1>
            <p>
              Fresh shakes, lassi, food and beverages — made to
              order.
            </p>
          </div>

          {menuLoading ? (
            <div className="empty-cart menu-loading-state">
              Loading menu...
            </div>
          ) : menuItems.length === 0 ? (
            <div className="empty-cart menu-loading-state">
              Menu is currently unavailable.
            </div>
          ) : (
            <div className="dedicated-menu-content">
              {menuItems.map((section) => (
                <section
                  className="menu-category dedicated-category"
                  key={section.category}
                >
                  <div className="dedicated-category-heading">
                    <p className="section-tag">MENU</p>
                    <h2>{section.category}</h2>
                  </div>

                  <div className="menu-grid">
                    {section.items.map((item) => (
                      <div
                        className="menu-card motion-card"
                        key={item.id || item.name}
                      >
                        <div className="menu-image">
                          <img
                            src={item.image || "/logo.jpg"}
                            alt={item.name}
                            loading="lazy"
                          />
                        </div>

                        <div className="menu-card-content">
                          <h4>{item.name}</h4>

                          <div className="menu-bottom">
                            <span className="menu-price">
                              ₹{item.price}
                            </span>

                            <button
                              className="add-btn"
                              onClick={() => addToCart(item)}
                            >
                              + Add
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </main>

        <CartUI />

        <footer>
          <p>© 2026 The Shakes Reign. All Rights Reserved.</p>
          <p>The Taste of Home ❤️</p>
        </footer>
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
          path="/menu"
          element={<MenuPage />}
        />

        <Route
          path="/admin"
          element={<AdminPage />}
        />

      </Routes>

    </BrowserRouter>
  );
}
// =========================
// LIVE REVIEWS COMPONENT
// =========================

function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [name, setName] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const REVIEWS_API = "http://localhost:5000/reviews";

  const loadReviews = async () => {
    try {
      const response = await fetch(REVIEWS_API);

      if (!response.ok) {
        throw new Error("Reviews load failed");
      }

      const data = await response.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Reviews error:", error);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const submitReview = async (e) => {
    e.preventDefault();

    if (!name.trim() || !reviewText.trim()) {
      setMessage("Please enter your name and review.");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      const response = await fetch(REVIEWS_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          review: reviewText.trim(),
          rating: Number(rating),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Review submission failed");
      }

      setName("");
      setReviewText("");
      setRating(5);
      setMessage("Thank you! Your review has been submitted. ❤️");

      await loadReviews();
    } catch (error) {
      console.error("Review submit error:", error);
      setMessage("Review submit nahi ho paya. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="reviews" className="reviews-section">

      <div className="reviews-heading">
        <p className="section-tag">CUSTOMER LOVE</p>

        <h2>
          What Our <span>Customers Say</span>
        </h2>

        <p>
          Loved by shake and food lovers.
        </p>
      </div>

      {/* LIVE REVIEWS */}
      <div className="reviews-grid">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div className="review-card" key={review.id}>

              <div className="review-stars">
                {"★".repeat(Number(review.rating))}
                {"☆".repeat(5 - Number(review.rating))}
              </div>

              <p>“{review.review}”</p>

              <strong>— {review.name}</strong>

            </div>
          ))
        ) : (
          <div className="no-reviews">
            <p>Be the first to share your experience! ❤️</p>
          </div>
        )}
      </div>

      {/* WRITE A REVIEW */}
      <div className="review-form-box">

        <h3>Share Your Experience</h3>

        <p>
          Had a great shake or meal? Tell us what you think!
        </p>

        <form onSubmit={submitReview}>

          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
          />

          <div className="star-rating-input">
  {[1, 2, 3, 4, 5].map((star) => (
    <button
      key={star}
      type="button"
      className={star <= Number(rating) ? "active" : ""}
      onClick={() => setRating(star)}
      aria-label={`${star} star rating`}
    >
      ★
    </button>
  ))}
</div>

          <textarea
            placeholder="Write your review..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            rows="5"
            maxLength={500}
          />

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Review"}
          </button>

        </form>

        {message && (
          <p className="review-message">
            {message}
          </p>
        )}

      </div>

    </section>
  );
}
export default App;
