import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;

    if (!response || response.status !== 401 || config._retry) {
      return Promise.reject(error);
    }

    // Refresh endpoint itself failed — session is no longer valid
    if (config.url?.includes("/auth/refresh")) {
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push(() => {
          config._retry = true;
          axiosInstance(config).then(resolve).catch(reject);
        });
      });
    }

    isRefreshing = true;
    config._retry = true;

    try {
      await axiosInstance.post("/auth/refresh");
      pendingRequests.forEach((retry) => retry());
      pendingRequests = [];
      return axiosInstance(config);
    } catch (refreshError) {
      pendingRequests = [];
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default axiosInstance;
