import { useState } from "react";
import "./AdminLogin.css";

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");

  
  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!password.trim()) {
    alert("Please enter password.");
    return;
  }

  try {
    const response = await fetch(
      "https://the-shakes-reign.onrender.com/admin-login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Invalid password.");
      return;
    }

    onLogin();
  } catch (error) {
    console.error("Login error:", error);
    alert("Backend connection failed.");
  }
};
  return (
    <div className="admin-login-page">
      <div className="admin-login-box">
        <h1>The Shakes Reign</h1>

        <p>Admin Login</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
          />

          <button type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;