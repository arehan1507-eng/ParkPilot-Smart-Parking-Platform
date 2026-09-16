import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="brand-mark">P</span>
        <div>
          <strong>ParkPilot</strong>
          <span>Parking Management</span>
        </div>
      </Link>

      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        {user && <NavLink to="/dashboard">Dashboard</NavLink>}
        <button type="button" className="ghost-btn" onClick={toggleTheme}>
          {theme === "dark" ? "Light mode" : "Dark mode"}
        </button>
        {user ? (
          <button type="button" className="primary-btn" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <Link to="/auth" className="primary-btn">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
};
