import { useEffect, useState } from "react";
import "./App.css";
const API = "http://localhost:5000";
import Admin from "./admin/Admin";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [backendMenu, setBackendMenu] = useState(null);

useEffect(() => {
  fetch(`${API}/menu`)
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setBackendMenu(data);
      }
    })
    .catch((error) => {
      console.error("Menu loading error:", error);
    });
}, []);

  const initialMenuItems = [
  {
    category: "Shakes & Lassi",
    items: [
      ["Royal Dry Fruit Lassi", 99, "https://b.zmtcdn.com/data/dish_photos/d6a/24e0af3412e4fd8cd33a4c0f41018d6a.jpg"],
      ["Paan Lassi", 89, "https://b.zmtcdn.com/data/dish_photos/099/3d31059de05d528b2359ef57c8b55099.jpg"],
      ["Gulab Lassi", 89, "https://b.zmtcdn.com/data/dish_photos/c31/9fec07f3fd69a97e9ed7d57aef804c31.jpg"],
      ["Amritsar Style Lassi", 79, "https://b.zmtcdn.com/data/dish_photos/889/322f9478698c738a8a08f8e782ca6889.jpg"],
      ["Mango Lassi", 89, "https://b.zmtcdn.com/data/dish_photos/697/86473f50aba0a20865df9564c09a7697.jpeg"],
      ["Strawberry Lassi", 89, "https://b.zmtcdn.com/data/dish_photos/71d/ddf92f82669d5d0136a56887a784d71d.jpeg"],
      ["KitKat Chocolate Thickshake", 129, "https://b.zmtcdn.com/data/dish_photos/b45/880ff1dd34759025705197d1d729eb45.jpg"],
      ["Creamy Vanilla Thickshake", 109, "https://b.zmtcdn.com/data/dish_photos/a3d/a9a69c6a0f3f0765431ea0a630d4aa3d.jpg"],
      ["Butterscotch Shake With Ice Cream", 109, "https://b.zmtcdn.com/data/dish_photos/5d9/f259e989a34a220dbe83f316132bf5d9.jpeg"],
      ["Strawberry Shake With Ice Cream", 109, "https://b.zmtcdn.com/data/dish_photos/0fc/56f1ab40b68742a79150970f912bd0fc.jpeg"],
      ["Oreo Overload Thickshake", 129, "https://b.zmtcdn.com/data/dish_photos/601/936baf2fb2301e853e080ada792dd601.jpg"],
      ["Cafe Style Cold Coffee", 149, "https://b.zmtcdn.com/data/dish_photos/ac4/57997d5e6a46197e70a55ec5bb8e2ac4.png"],
      ["Creamy Badam Shake", 99, "https://b.zmtcdn.com/data/dish_photos/d1d/68b684c058050b859eb835d47a37dd1d.jpeg"],
    ],
  },

  {
    category: "Pasta",
    items: [
      ["Cheesy Masala Macaroni", 239, "https://b.zmtcdn.com/data/dish_photos/9b4/d41d4926a561aa61de37ddd40f6809b4.jpeg"],
      ["Italian White Sauce Pasta", 219, "https://b.zmtcdn.com/data/dish_photos/bc3/642a86c45314d5f7336006f121c41bc3.jpeg"],
      ["Red Sauce Macaroni Pasta", 229, "https://b.zmtcdn.com/data/dish_photos/edb/186a5150c55e780311f1675a02b03edb.jpeg"],
      ["Peri Peri Macaroni", 239, "https://b.zmtcdn.com/data/dish_photos/5a4/753c67554cd7c633daf8260913e835a4.jpeg"],
    ],
  },

  {
    category: "Snacks",
    items: [
      ["Paneer Pop Roll", 139, "https://b.zmtcdn.com/data/dish_photos/5fd/8050467d6e5ae69977076b3ee4d645fd.jpg"],
      ["Cheesy Paneer Roll", 199, "https://b.zmtcdn.com/data/dish_photos/a35/999397529332a50488fe7fe7c04d2a35.png"],
      ["Soya Protein Roll", 128, "https://b.zmtcdn.com/data/dish_photos/5cf/d0683031c102fb8a95e0cff8baccb5cf.jpeg"],
      ["Street Style Schezwan Poha", 99, "https://b.zmtcdn.com/data/dish_photos/486/9ee1bbc9ce869c7c20ea92c3d07bf486.jpeg"],
      ["Classic Indori Poha", 119, "https://b.zmtcdn.com/data/dish_photos/1ca/feccd44a8c6f757e23b2763fcd36f1ca.jpeg"],
    ],
  },

  {
    category: "Sandwiches",
    items: [
      ["Smoky Tandoori Paneer Sandwich", 229, "https://b.zmtcdn.com/data/dish_photos/b36/ca5d6a0b5fc4e91729b70f16f7942b36.jpeg"],
      ["3 Layered Cheese Sandwich", 169, "https://b.zmtcdn.com/data/dish_photos/2e4/cec3a93915d83dad0b0d6329cd1b42e4.jpg"],
      ["Mac And Cheese Sandwich", 119, "https://b.zmtcdn.com/data/dish_photos/867/0b45da62df721c644eb324aa5fe7f867.jpeg"],
      ["Veg Grilled Sandwich", 89, "https://b.zmtcdn.com/data/dish_photos/b9d/47fa1f14f672831863664193012b0b9d.png"],
      ["Mac n Malai Sandwich", 99, "https://b.zmtcdn.com/data/dish_photos/712/caf0efd00b5727d0f0a6a0455cdb1712.jpeg"],
      ["Cheese-e-Corn Sandwich", 128, "https://b.zmtcdn.com/data/dish_photos/2bb/410dad886eb7ed1428b75a581d71b2bb.png"],
      ["Masala Aloo Sandwich", 89, "https://b.zmtcdn.com/data/dish_photos/682/5d3a29bfac895df6b7168357b1db0682.jpeg"],
    ],
  },

  {
    category: "Noodles & Maggi",
    items: [
      ["Paneer Hakka Noodles", 145, "https://b.zmtcdn.com/data/dish_photos/295/6ebbe68b3b3ebe3ce2694710c3e42295.jpeg"],
      ["Street Style Chilli Garlic Noodles", 128, "https://b.zmtcdn.com/data/dish_photos/de2/b6bdb7610f5875e7fbef7368034fade2.jpg"],
      ["Punjabi Butter Tadka Maggi", 159, "https://b.zmtcdn.com/data/dish_photos/909/c143fa6ae22689a6d34d1a76e009d909.jpg"],
      ["Spicy Korean Style Maggi", 139, "https://b.zmtcdn.com/data/dish_photos/e9f/5453cc1e21467286418a1b2a56cc8e9f.jpeg"],
      ["Cheesy Chilli Maggi", 169, "https://b.zmtcdn.com/data/dish_photos/c6d/61cefa97e5b97becadcad99495e27c6d.jpeg"],
      ["Veg Double Masala Maggi", 119, "https://b.zmtcdn.com/data/dish_photos/26c/20d56b81be6d9e6585baaf87be07826c.jpg"],
      ["Pahadi Style Maggi", 199, "https://b.zmtcdn.com/data/dish_photos/fbc/c43ecbfd129c8374d23fd3f642de7fbc.jpeg"],
    ],
  },

  {
    category: "Homemade Food",
    items: [
      ["Schezwan Fried Rice", 109, "https://b.zmtcdn.com/data/dish_photos/70b/1478675c511a0b075fc9e15ba084070b.jpeg"],
      ["Extra Poori", 18, "https://b.zmtcdn.com/data/dish_photos/aa0/64d52ed27ef295890e38acc92f83daa0.jpg"],
      ["Ajwain Paratha", 28, "https://b.zmtcdn.com/data/dish_photos/2a5/92ff1856959e068fbfeeb33010e262a5.jpeg"],
      ["Soft Tawa Roti", 18, "https://b.zmtcdn.com/data/dish_photos/340/11115d45e2153a56b60aa23f4d3f3340.jpeg"],
      ["Soft Ghee Roti", 25, "https://b.zmtcdn.com/data/dish_photos/e3c/5ddbeda6ded3ab179dd8a8b3855afe3c.jpeg"],
      ["Desi Aloo Jeera", 89, "https://b.zmtcdn.com/data/dish_photos/7a4/a21623c56a59ede38e2b914c15e077a4.jpeg"],
      ["Dhaba Style Paneer Bhurji", 249, "https://b.zmtcdn.com/data/dish_photos/68b/e6b5c385a8f09e760e5da64a9dc7a68b.jpg"],
      ["8 Poori with Aloo Sabzi", 168, "https://b.zmtcdn.com/data/dish_photos/bb5/bee3f6bd9761435185a26238a6c81bb5.jpeg"],
      ["2 Jumbo Aloo Paratha + Imli Chutney", 179, "https://b.zmtcdn.com/data/dish_photos/43c/e732c28c415ccc3400f73e9dad79d43c.jpeg"],
      ["2 Jumbo Aloo Paratha + Imli Chutney", 149, "https://b.zmtcdn.com/data/dish_photos/43c/e732c28c415ccc3400f73e9dad79d43c.jpeg"],
      ["2 Pyaaj Paratha + Green Chutney", 109, "https://b.zmtcdn.com/data/dish_photos/309/4841a67eb16475c47eccee92477b8309.jpeg"],
      ["6 Poori with Aloo Jeera and Dahi", 149, "https://b.zmtcdn.com/data/dish_photos/51f/3feaf95cb01d8fef0a7494eee171a51f.png"],
      ["8 Meethi Poori with Aloo Jeera & Curd", 158, "https://b.zmtcdn.com/data/dish_photos/2cf/3b8ecfa4005d4acee8ccddec8a7a02cf.jpeg"],
      ["Desi Ghee Meethi Pua with Aloo Jeera & Curd", 229, "https://b.zmtcdn.com/data/dish_photos/745/2574589d3626ac8013a9c749147ed745.jpg"],
      ["2 Paneer Pyaaz Paratha + Green Chutney", 199, "https://b.zmtcdn.com/data/dish_photos/8a7/cdbd30ee9e6e4dfacfb24544b655a8a7.jpeg"],
      ["8 Kasturi Methi Kachori with Aloo Jeera & Boondi Raita", 179, "https://b.zmtcdn.com/data/dish_photos/76f/a706bf7c5df3f0165e7411349370876f.jpeg"],
      ["6 Aloo Kachori with Dahi & Imli Chutney", 198, "https://b.zmtcdn.com/data/dish_photos/63f/b365574aa3f6d5615ebaa5535a1ba63f.jpeg"],
      ["North Indian Roti Thali", 145, "https://b.zmtcdn.com/data/dish_photos/6ac/44a5274d9ecb75e2407731934fecd6ac.jpeg"],
    ],
  },

  {
    category: "Desserts",
    items: [
      ["Elaichi Sabudana Kheer", 229, "https://b.zmtcdn.com/data/dish_photos/832/b276794d05afc6b7383d5d71a6630832.jpeg"],
      ["Sabudana Khichdi", 199, "https://b.zmtcdn.com/data/dish_photos/bf6/2721d6835f574ad6d8a3f162f93dabf6.jpeg"],
      ["Desi Ghee Suji Halwa", 289, "https://b.zmtcdn.com/data/dish_photos/559/ca513d5c741e76eb7295b891a3ba9559.jpeg"],
    ],
  },

  {
    category: "Pizza & Combos",
    items: [
      ["Cheesy Veg Kullad Pizza (200 ml)", 119, "https://b.zmtcdn.com/data/dish_photos/671/02a3b93c24f2a19b0421c4ef7d574671.jpeg"],
      ["Chilli Paneer + Fried Rice", 388, "https://b.zmtcdn.com/data/dish_photos/981/dd9b20c3926de09ff293ed26b4b57981.jpeg"],
    ],
  },

  {
    category: "Chutney & Dips",
    items: [
      ["Gud Imli Chutney", 27, "https://b.zmtcdn.com/data/dish_photos/ed7/1c4f200b4ad333a1996dc90436d4ced7.jpeg"],
    ],
  },
];

  const [menuItems, setMenuItems] = useState(
    initialMenuItems.map((section) => ({
      ...section,
      items: section.items.map((item) => ({
        name: item[0],
        price: item[1],
        image: item[2],
        available: true,
      })),
    }))
  );

  useEffect(() => {
    fetch("https://the-shakes-reign.onrender.com/menu")
      .then((res) => {
        if (!res.ok) throw new Error("Menu could not be loaded");
        return res.json();
      })
      .then((data) =>
  setMenuItems(
    data.map((section) => ({
      ...section,
      items: section.items.filter((item) => item.available !== false),
    }))
  )
)
      .catch((error) => console.error("Menu load error:", error));
  }, []);

  const addToCart = (item) => {
  const existingIndex = cart.findIndex(
    (cartItem) => cartItem[0] === item[0]
  );

  if (existingIndex !== -1) {
    setCart(
      cart.map((cartItem, index) =>
        index === existingIndex
          ? [
              cartItem[0],
              cartItem[1],
              cartItem[2],
              (cartItem[3] || 1) + 1,
            ]
          : cartItem
      )
    );
  } else {
    setCart([...cart, [...item, 1]]);
  }

  // Open cart immediately after adding
  setCartOpen(true);
};

  const orderOnWhatsApp = async () => {
    if (cart.length === 0) {
      alert("Please add something to your cart first.");
      return;
    }

    const total = cart.reduce(
      (sum, item) =>
        sum + item[1] * (item[3] || 1),
      0
    );

    const order = {
      items: cart.map((item) => ({
        name: item[0],
        price: item[1],
        quantity: item[3] || 1,
      })),
      total: total,
    };

    try {
      const response = await fetch(
  "https://the-shakes-reign.onrender.com/orders",
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
            `${item[0]} × ${item[3] || 1} — ₹${
              item[1] * (item[3] || 1)
            }`
        )
        .join("\n");

      const message = `Hello, I want to order:\n\n${orderText}\n\nTotal: ₹${total}`;

      window.open(
        `https://wa.me/919794428589?text=${encodeURIComponent(
          message
        )}`,
        "_blank"
      );
    } catch (error) {
      console.error(error);
      alert(
        "Order save nahi ho paya. Please try again."
      );
    }
  };

  const total = cart.reduce(
    (sum, item) =>
      sum + item[1] * (item[3] || 1),
    0
  );

  return (
  <BrowserRouter>
    <Routes>

      <Route
        path="/admin"
        element={<Admin />}
      />

      {/* HOME PAGE */}
      <Route
        path="/"
        element={
          <div className="app">
              {/* NAVBAR */}
              <header className="navbar">
                <div className="logo">
  <img src="/logo.jpg" alt="The Shakes Reign" />
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

              {/* HERO */}
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
                    Delicious shakes, refreshing
                    beverages and comforting food —
                    made to satisfy every craving.
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
  <img src="/logo.jpg" alt="The Shakes Reign" />
</div>

                  <div className="floating-card card-one">
                    ❤️ Fresh & Delicious
                  </div>

                  <div className="floating-card card-two">
                    ❤️ Made With Love
                  </div>

                </div>
              </section>

              {/* MENU */}
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

                {menuItems.map((section) => (

                  <div
                    className="menu-category"
                    key={section.category}
                  >

                    <h3 className="menu-category-title">
                      {section.category}
                    </h3>

                    <div className="menu-grid">

                      {section.items.map(
                        (item, index) => (

                          <div
                            className="menu-card"
                            key={`${item.name}-${index}`}
                          >

                            <div className="menu-image">

                              <img
                                src={item.image}
                                alt={item.name}
                                loading="lazy"
                              />

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
                                  className="add-btn"
                                  disabled={item.available === false}
                                  onClick={() => addToCart([item.name, item.price, item.image])}
                                >{item.available === false ? "Out of Stock" : "+ Add"}</button>

                              </div>

                            </div>

                          </div>

                        )
                      )}

                    </div>
                  </div>
                ))}

              </section>

              {/* ABOUT */}
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

              {/* CONTACT */}
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

              {/* CART */}
              {cartOpen && (
  <div className="cart-popup">
    <div className="cart-popup-box">
      <div className="cart-popup-header">
        <h2>Your Cart</h2>
        <button onClick={() => setCartOpen(false)}>✕</button>
      </div>

      {cart.map((item, index) => (
        <div className="cart-popup-item" key={index}>
          <div>
            <strong>{item[0]}</strong>
            <p>₹{item[1]} × {item[3] || 1}</p>
          </div>

          <div className="cart-qty">
            <button
              onClick={() => {
                if ((item[3] || 1) > 1) {
                  setCart(
                    cart.map((cartItem, i) =>
                      i === index
                        ? [...cartItem.slice(0, 3), (cartItem[3] || 1) - 1]
                        : cartItem
                    )
                  );
                }
              }}
            >
              −
            </button>

            <span>{item[3] || 1}</span>

            <button
              onClick={() => {
                setCart(
                  cart.map((cartItem, i) =>
                    i === index
                      ? [...cartItem.slice(0, 3), (cartItem[3] || 1) + 1]
                      : cartItem
                  )
                );
              }}
            >
              +
            </button>
          </div>
        </div>
      ))}

      <h3 className="cart-popup-total">Total: ₹{total}</h3>

      <button
        className="whatsapp-order-btn"
        onClick={orderOnWhatsApp}
      >
        💬 Order on WhatsApp
      </button>
    </div>
  </div>
)}
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
                        key={index}
                      >

                        <span>
                          {item[0]} ×{" "}
                          {item[3] || 1}
                        </span>

                        <div className="quantity-controls">

                          {/* MINUS */}
                          <button
                            onClick={() => {

                              if (
                                (item[3] || 1) > 1
                              ) {

                                setCart(
                                  cart.map(
                                    (
                                      cartItem,
                                      i
                                    ) =>
                                      i === index
                                        ? [
                                            cartItem[0],
                                            cartItem[1],
                                            cartItem[2],
                                            (cartItem[3] ||
                                              1) - 1,
                                          ]
                                        : cartItem
                                  )
                                );

                              }

                            }}
                          >
                            −
                          </button>

                          <span>
                            {item[3] || 1}
                          </span>

                          {/* PLUS */}
                          <button
                            onClick={() => {

                              setCart(
                                cart.map(
                                  (
                                    cartItem,
                                    i
                                  ) =>
                                    i === index
                                      ? [
                                          cartItem[0],
                                          cartItem[1],
                                          cartItem[2],
                                          (cartItem[3] ||
                                            1) + 1,
                                        ]
                                      : cartItem
                                )
                              );

                            }}
                          >
                            +
                          </button>

                        </div>

                        <strong>
                          ₹
                          {item[1] *
                            (item[3] || 1)}
                        </strong>

                      </div>

                    ))}

                    {/* TOTAL */}
                    <div className="cart-total">

                      <span>
                        Total
                      </span>

                      <strong>
                        ₹{total}
                      </strong>

                    </div>

                    {/* WHATSAPP */}
                    <button
                      className="whatsapp-order-btn"
                      onClick={orderOnWhatsApp}
                    >
                      💬 Order on WhatsApp
                    </button>

                  </div>

                )}

              </section>

              {/* FOOTER */}
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
          }
        />

        {/* ADMIN PAGE */}
        <Route
          path="/admin"
          element={<Admin />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;