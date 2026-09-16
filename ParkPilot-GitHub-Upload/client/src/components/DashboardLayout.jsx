import { useAuth } from "../context/AuthContext.jsx";

const linksByRole = {
  user: ["Book Slot", "My Bookings"],
  operator: ["Bookings"],
  admin: ["Overview", "Users", "Bookings"],
};

export const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  const links = linksByRole[user?.role] || [];

  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <div className="sidebar-card">
          <p className="eyebrow">Signed in as</p>
          <h3>{user?.name}</h3>
          <span className="role-badge">{user?.role}</span>
        </div>
        <nav className="sidebar-nav">
          {links.map((label) => (
            <button key={label} type="button" className="sidebar-link">
              {label}
            </button>
          ))}
        </nav>
      </aside>
      <section className="dashboard-content">{children}</section>
    </main>
  );
};
