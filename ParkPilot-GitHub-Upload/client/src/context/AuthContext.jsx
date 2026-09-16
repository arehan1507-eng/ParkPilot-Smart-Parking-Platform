import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiClient } from "../api/client.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("servicehub_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("servicehub_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token || user) {
      return;
    }

    apiClient
      .get("/auth/me", token)
      .then((profile) => {
        setUser(profile);
        localStorage.setItem("servicehub_user", JSON.stringify(profile));
      })
      .catch(() => {
        localStorage.removeItem("servicehub_token");
        localStorage.removeItem("servicehub_user");
        setToken(null);
        setUser(null);
      });
  }, [token, user]);

  const authenticate = async (mode, payload) => {
    setLoading(true);
    try {
      const data = await apiClient.post(`/auth/${mode}`, payload);
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("servicehub_token", data.token);
      localStorage.setItem("servicehub_user", JSON.stringify(data.user));
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("servicehub_token");
    localStorage.removeItem("servicehub_user");
  };

  const syncUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem("servicehub_user", JSON.stringify(nextUser));
  };

  const value = useMemo(
    () => ({
      token,
      user,
      loading,
      authenticate,
      logout,
      syncUser,
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
