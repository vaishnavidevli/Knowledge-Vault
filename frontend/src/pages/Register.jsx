import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0a0a0f",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
    position: "relative",
    overflow: "hidden",
  },
  orb1: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
    bottom: "-100px",
    left: "-100px",
    pointerEvents: "none",
  },
  orb2: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
    top: "-80px",
    right: "-80px",
    pointerEvents: "none",
  },
  card: {
    background: "#111118",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "2.5rem",
    width: "100%",
    maxWidth: "420px",
    position: "relative",
    zIndex: 1,
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "2rem",
  },
  logoIcon: {
    width: "36px",
    height: "36px",
    background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px",
  },
  logoText: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: "1.1rem",
    color: "#f0eeff",
    letterSpacing: "-0.02em",
  },
  heading: {
    fontFamily: "'Syne', sans-serif",
    fontWeight: 700,
    fontSize: "1.75rem",
    color: "#f0eeff",
    marginBottom: "0.4rem",
    letterSpacing: "-0.03em",
  },
  subheading: {
    fontSize: "0.9rem",
    color: "#8b8ba0",
    marginBottom: "2rem",
  },
  formGroup: {
    marginBottom: "1.2rem",
  },
  label: {
    display: "block",
    fontSize: "0.8rem",
    fontWeight: "500",
    color: "#8b8ba0",
    marginBottom: "0.5rem",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    background: "#16161f",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "10px",
    color: "#f0eeff",
    fontSize: "0.95rem",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "'DM Sans', sans-serif",
  },
  button: {
    width: "100%",
    padding: "0.85rem",
    background: "linear-gradient(135deg, #8b5cf6, #6366f1)",
    border: "none",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "0.95rem",
    fontWeight: "600",
    fontFamily: "'Syne', sans-serif",
    cursor: "pointer",
    marginTop: "0.5rem",
    letterSpacing: "0.01em",
    transition: "opacity 0.2s",
  },
  errorBox: {
    background: "rgba(248,113,113,0.1)",
    border: "1px solid rgba(248,113,113,0.3)",
    borderRadius: "10px",
    padding: "0.75rem 1rem",
    color: "#f87171",
    fontSize: "0.85rem",
    marginBottom: "1.2rem",
  },
  successBox: {
    background: "rgba(52,211,153,0.1)",
    border: "1px solid rgba(52,211,153,0.3)",
    borderRadius: "10px",
    padding: "0.75rem 1rem",
    color: "#34d399",
    fontSize: "0.85rem",
    marginBottom: "1.2rem",
  },
  footer: {
    textAlign: "center",
    marginTop: "1.5rem",
    fontSize: "0.875rem",
    color: "#8b8ba0",
  },
  hint: {
    fontSize: "0.78rem",
    color: "#4a4a60",
    marginTop: "0.4rem",
  },
};

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("/api/auth/register", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify({ name: res.data.name, email: res.data.email }),
      );
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.card}>
        <div style={styles.logoArea}>
          <div style={styles.logoIcon}>🧠</div>
          <span style={styles.logoText}>Knowledge Vault</span>
        </div>

        <h1 style={styles.heading}>Create account</h1>
        <p style={styles.subheading}>
          Start building your personal knowledge system
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type="text"
              name="name"
              placeholder="Miso"
              value={form.name}
              onChange={handleChange}
              required
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(139,92,246,0.6)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.08)")
              }
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(139,92,246,0.6)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.08)")
              }
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              onFocus={(e) =>
                (e.target.style.borderColor = "rgba(139,92,246,0.6)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "rgba(255,255,255,0.08)")
              }
            />
            <p style={styles.hint}>Minimum 6 characters</p>
          </div>

          <button
            type="submit"
            style={{
              ...styles.button,
              ...(loading ? { opacity: 0.7, cursor: "not-allowed" } : {}),
            }}
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account →"}
          </button>
        </form>

        <div style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#a78bfa", fontWeight: "500" }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
