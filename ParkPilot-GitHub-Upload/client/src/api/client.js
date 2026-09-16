const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const parseJson = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
};

export const apiClient = {
  get: async (path, token) => {
    const response = await fetch(`${API_URL}${path}`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });
    return parseJson(response);
  },
  post: async (path, body, token) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      body: JSON.stringify(body),
    });
    return parseJson(response);
  },
  put: async (path, body, token) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    return parseJson(response);
  },
  patch: async (path, body, token) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    return parseJson(response);
  },
  delete: async (path, token) => {
    const response = await fetch(`${API_URL}${path}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return parseJson(response);
  },
};
