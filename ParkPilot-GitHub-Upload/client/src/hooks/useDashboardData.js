import { useEffect, useState } from "react";
import { apiClient } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";

export const useDashboardData = () => {
  const { token, user } = useAuth();
  const [state, setState] = useState({
    loading: true,
    error: "",
    services: [],
    bookings: [],
    users: [],
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    const load = async () => {
      setState((current) => ({ ...current, loading: true, error: "" }));

      try {
        const servicePromise = apiClient.get("/services");

        const bookingPromise =
          user.role === "user"
            ? apiClient.get("/bookings/my", token)
            : apiClient.get("/bookings/all", token);

        const [services, bookings, users] = await Promise.all([
          servicePromise,
          bookingPromise,
          user.role === "admin" ? apiClient.get("/users", token) : Promise.resolve([]),
        ]);

        setState({
          loading: false,
          error: "",
          services,
          bookings,
          users,
        });
      } catch (error) {
        setState((current) => ({
          ...current,
          loading: false,
          error: error.message || "Unable to load dashboard data.",
        }));
      }
    };

    load();
  }, [token, user]);

  return [state, setState];
};
