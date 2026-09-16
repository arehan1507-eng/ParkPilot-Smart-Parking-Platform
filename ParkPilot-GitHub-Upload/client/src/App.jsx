import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { AuthPage } from "./pages/AuthPage.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const hideNavbar = location.pathname.startsWith("/dashboard");

  return (
    <div className="app-shell">
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}
