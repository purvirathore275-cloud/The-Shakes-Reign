import AdminLogin from "./admin/AdminLogin";
import { useEffect, useState } from "react";
import "./App.css";
import Admin from "./admin/Admin";

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

const API = "https://the-shakes-reign.onrender.com";

function App() {
  const [cart, setCart] = useState([]);
  const [adminLoggedIn, setAdminLoggedIn] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);

  // =========================
  // LOAD MENU
  // =========================

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setMenuLoading(true);

        const response = await fetch(`${API}/menu`);

        if (!response.ok) {
          throw new Error(`Menu API error: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Menu data is not an array");
        }

        setMenuItems(data);
      } catch (error) {
        console.error("Menu loading error:", error);
        setMenuItems([]);
      } finally {
        setMenuLoading(false);
      }
    };

    loadMenu();
  }, []);

  // =========================
  // ADD TO CART
  // =========================

  const addToCart = (item) => {
    const existingIndex = cart.findIndex(
      (cartItem) => cartItem.name === item.name
    );

    if (existingIndex !== -1) {
      const updatedCart = cart.map((cartItem, index) =>
        index === existingIndex
          ? {
              ...cartItem,
              quantity: (cartItem.quantity || 1) + 1,
            }
          : cartItem
      );

      setCart(updatedCart);
    } else {
      setCart([
        ...cart,
        {
          name: item.name,
          price: Number(item.price),
          image: item.image || "",
          quantity: 1,
        },
      ]);
    }

    // Open cart immediately
    setCartOpen(true);
  };

  // =========================
  // INCREASE QUANTITY
  // =========================

  const increaseQuantity = (index) => {
    setCart(
      cart.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity: (item.quantity || 1) + 1,
            }
          : item
      )
    );
  };

  // =========================
  // DECREASE / REMOVE
  // =========================

  const decreaseQuantity = (index) => {
    const currentQty = cart[index]?.quantity || 1;

    if (currentQty > 1) {
      setCart(
        cart.map((item, i) =>
          i === index
            ? {
                ...item,
                quantity: currentQty - 1,
              }
            : item
        )
      );

      return;
    }

    const updatedCart = cart.filter((_, i) => i !== index);

    setCart(updatedCart);

    if (updatedCart.length === 0) {
      setCartOpen(false);
    }
  };

  // =========================
  // TOTAL
  // =========================

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * (item.quantity || 1),
    0
  );

  // =========================
  // TOTAL ITEMS
  // =========================

  const totalItems = cart.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  );

  // =========================
  // WHATSAPP ORDER
  // =========================

  const orderOnWhatsApp = async () => {
    if (cart.length === 0) {
      alert("Please add something to your cart first.");
      return;
    }

    const order = {
      items: cart.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
      })),
      total: total,
    };

    try {
      const response = await fetch(
        `${API}/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(order),
        }
      );

      if (!response.ok) {
        throw new Error("Order could not be saved");
      }

      const orderText = cart
        .map(
          (item) =>
            `${item.name} × ${item.quantity || 1} — ₹${
              item.price * (item.quantity || 1)
            }`
        )
        .join("\n");

      const message =
        `Hello, I want to order:\n\n` +
        `${orderText}\n\n` +
        `Total: ₹${total}`;

      window.open(
        `https://wa.me/919794428589?text=${encodeURIComponent(
          message
        )}`,
        "_blank"
      );
    } catch (error) {
      console.error("Order error:", error);

      alert(
        "Order save nahi ho paya. Please try again."
      );
    }
  };

  // =========================
  // HOME PAGE
  // =========================

  const HomePage = () => {
    return (
      <div className="app">

        {/* =========================
            NAVBAR
        ========================= */}

        <header className="navbar">

          <div className="logo">
            <img
              src="/logo.jpg"
              alt="The Shakes Reign"
            />
          </div>

          <nav>
            <a href="#home">Home</a>
            <a href="#menu">Menu</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>

          <a
            href="#menu"
            className="nav-btn"
          >
            Order Now
          </a>

        </header>

        {/* =========================
            HERO
        ========================= */}

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
              <span>of Home.</span>
            </h1>

            <p className="hero-text">
              Delicious shakes, refreshing beverages
              and comforting food — made to satisfy
              every craving.
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

        {/* =========================
            MENU
        ========================= */}

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
              <span>Every Craving</span>
            </h2>

            <p>
              Freshly prepared favourites
              from The Shakes Reign.
            </p>

          </div>

          {menuLoading ? (
            <p className="empty-cart">
              Loading menu...
            </p>
          ) : menuItems.length === 0 ? (
            <p className="empty-cart">
              Menu is currently unavailable.
            </p>
          ) : (
            menuItems.map((section) => {

              const availableItems = Array.isArray(
                section.items
              )
                ? section.items.filter(
                    (item) =>
                      item.available !== false
                  )
                : [];

              if (availableItems.length === 0) {
                return null;
              }

              return (
                <div
                  className="menu-category"
                  key={section.category}
                >

                  <h3 className="menu-category-title">
                    {section.category}
                  </h3>

                  <div className="menu-grid">

                    {availableItems.map(
                      (item, index) => (

                        <div
                          className="menu-card"
                          key={`${item.id || item.name}-${index}`}
                        >

                          <div className="menu-image">

                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                loading="lazy"
                              />
                            ) : (
                              <div>
                                🥤
                              </div>
                            )}

                          </div>

                          <div className="menu-card-content">

                            <h4>
                              {item.name}
                            </h4>

                            <div className="menu-bottom">

                              <span className="menu-price">
                                ₹{item.price}
                              </span>

                              <button
                                type="button"
                                className="add-btn"
                                onClick={() =>
                                  addToCart(item)
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
              );
            })
          )}

        </section>

        {/* =========================
            ABOUT
        ========================= */}

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
              At The Shakes Reign, we believe
              every shake should make your day
              a little sweeter. We prepare fresh
              and delicious food and beverages
              using quality ingredients and serve
              them with love.
            </p>

          </div>

        </section>

        {/* =========================
            CONTACT
        ========================= */}

        <section
          id="contact"
          className="contact-section"
        >

          <p className="section-tag">
            GET IN TOUCH
          </p>

          <h2>
            Ready to satisfy your craving?
          </h2>

          <p>
            Have a craving? Let The Shakes Reign
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

        {/* =========================
            CART SECTION
        ========================= */}

        <section className="cart-section">

          <p className="section-tag">
            YOUR CART
          </p>

          <h2>
            Your <span>Order</span>
          </h2>

          {cart.length === 0 ? (

            <p className="empty-cart">
              Your cart is empty.
              Add something delicious! 🥤
            </p>

          ) : (

            <div className="cart-box">

              {cart.map((item, index) => (

                <div
                  className="cart-item"
                  key={`${item.name}-${index}`}
                >

                  <span>
                    {item.name} ×{" "}
                    {item.quantity || 1}
                  </span>

                  <div className="quantity-controls">

                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity(index)
                      }
                    >
                      −
                    </button>

                    <span>
                      {item.quantity || 1}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        increaseQuantity(index)
                      }
                    >
                      +
                    </button>

                  </div>

                  <strong>
                    ₹
                    {item.price *
                      (item.quantity || 1)}
                  </strong>

                </div>

              ))}

              <div className="cart-total">

                <span>
                  Total
                </span>

                <strong>
                  ₹{total}
                </strong>

              </div>

              <button
                type="button"
                className="whatsapp-order-btn"
                onClick={orderOnWhatsApp}
              >
                💬 Order on WhatsApp
              </button>

            </div>

          )}

        </section>

        {/* =========================
            CART POPUP
        ========================= */}

        {cartOpen && cart.length > 0 && (

          <div
            className="cart-popup"
            onClick={() =>
              setCartOpen(false)
            }
          >

            <div
              className="cart-popup-box"
              onClick={(event) =>
                event.stopPropagation()
              }
            >

              <div className="cart-popup-header">

                <h2>
                  Your Cart
                </h2>

                <button
                  type="button"
                  onClick={() =>
                    setCartOpen(false)
                  }
                >
                  ✕
                </button>

              </div>

              {cart.map((item, index) => (

                <div
                  className="cart-popup-item"
                  key={`${item.name}-popup-${index}`}
                >

                  <div>

                    <strong>
                      {item.name}
                    </strong>

                    <p>
                      ₹{item.price} ×{" "}
                      {item.quantity || 1}
                    </p>

                  </div>

                  <div className="cart-qty">

                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity(index)
                      }
                    >
                      −
                    </button>

                    <span>
                      {item.quantity || 1}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        increaseQuantity(index)
                      }
                    >
                      +
                    </button>

                  </div>

                </div>

              ))}

              <div className="cart-popup-total">
                Total: ₹{total}
              </div>

              <button
                type="button"
                className="whatsapp-order-btn"
                onClick={orderOnWhatsApp}
              >
                💬 Order on WhatsApp
              </button>

              <button
                type="button"
                className="continue-shopping-btn"
                onClick={() =>
                  setCartOpen(false)
                }
              >
                🛍️ Continue Shopping
              </button>

            </div>

          </div>

        )}

        {/* =========================
            FOOTER
        ========================= */}

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
  element={
    adminLoggedIn ? (
      <Admin />
    ) : (
      <AdminLogin
        onLogin={() => setAdminLoggedIn(true)}
      />
    )
  }
/>

      </Routes>

    </BrowserRouter>
  );
}

export default App;