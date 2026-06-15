import "../style/login.css";
import logo from "../assets/logo.png";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("/api/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ name: res.data.name, email: res.data.email })
      );
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        {/* LEFT SIDE */}
        <div className="left-panel">
          <img src={logo} alt="logo" className="logo" />
          <h1>Knowledge Vault</h1>
          <p>Organize. Connect. Understand.</p>
        </div>

        {/* RIGHT SIDE */}
        <div className="right-panel">

          <h2>Welcome Back</h2>

          {error && <div className="error-box">{error}</div>}

          <form onSubmit={handleSubmit}>

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </form>

          <p className="signup">
            Don’t have an account? <Link to="/register">Sign up</Link>
          </p>

        </div>
      </div>
    </div>
  );
}