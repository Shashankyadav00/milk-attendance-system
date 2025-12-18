import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach userId ONLY for non-auth APIs
api.interceptors.request.use((config) => {
  const userId = localStorage.getItem("userId");

  if (
    userId &&
    userId !== "null" &&
    userId !== "undefined" &&
    !config.url.includes("/api/auth")
  ) {
    config.params = config.params || {};
    config.params.userId = userId;
  }

  return config;
});


export default api;
