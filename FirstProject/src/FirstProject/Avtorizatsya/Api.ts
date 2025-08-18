import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://globus-nukus.uz/api";

const instance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let queue: Function[] = [];

const processQueue = (error: any, token: string | null = null) => {
  queue.forEach((cb) => cb(error, token));
  queue = [];
};

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push((error: any, token: string) => {
            if (error) return reject(error);
            original.headers.Authorization = `Bearer ${token}`;
            resolve(axios(original));
          });
        });
      }
      original._retry = true;
      isRefreshing = true;
      const refresh = localStorage.getItem("refresh_token");
      return axios
        .post(`${BASE_URL}/token/refresh`, { refresh })
        .then((r) => {
          const { access, refresh: newRefresh } = r.data;
          localStorage.setItem("token", access);
          localStorage.setItem("refresh_token", newRefresh);
          processQueue(null, access);
          original.headers.Authorization = `Bearer ${access}`;
          return axios(original);
        })
        .catch((e) => {
          processQueue(e, null);
          localStorage.removeItem("token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
          return Promise.reject(e);
        })
        .finally(() => {
          isRefreshing = false;
        });
    }
    return Promise.reject(err);
  }
);

export default instance;