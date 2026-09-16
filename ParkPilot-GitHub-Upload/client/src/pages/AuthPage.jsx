import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export const AuthPage = () => {
  const navigate = useNavigate();
  const { authenticate, loading } = useAuth();
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const onChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      await authenticate(mode, form);
      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  return (
    <section className="auth-page page-width">
      <div className="hero-card auth-highlight">
        <p className="eyebrow">Secure access</p>
        <h1>Login and start booking slots with a clean, focused dashboard.</h1>
        <p>
          Admin access is always available with <strong>admin@gmail.com</strong> and password{" "}
          <strong>loml</strong>. User access is available with <strong>user@gmail.com</strong> and password{" "}
          <strong>user123</strong>.
        </p>
      </div>

      <form className="auth-card" onSubmit={onSubmit}>
        <div className="toggle-row">
          <button
            type="button"
            className={mode === "login" ? "tab-btn active" : "tab-btn"}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "signup" ? "tab-btn active" : "tab-btn"}
            onClick={() => setMode("signup")}
          >
            Signup
          </button>
        </div>

        {mode === "signup" && (
          <label>
            Full name
            <input name="name" placeholder="Aarav Mehta" value={form.name} onChange={onChange} />
          </label>
        )}

        <label>
          Email
          <input
            name="email"
            type="email"
            placeholder="name@example.com"
            value={form.email}
            onChange={onChange}
          />
        </label>

        <label>
          Password
          <input
            name="password"
            type="password"
            placeholder="Enter password"
            value={form.password}
            onChange={onChange}
          />
        </label>

        {error && <div className="alert error">{error}</div>}
        <button type="submit" className="primary-btn full-width" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
        </button>
      </form>
    </section>
  );
};
