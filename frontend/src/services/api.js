import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  // localStorage.setItem("token", res.data.token);
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

API.interceptors.response.use(
  // (response) => response,
  (response) => {
    // ⭐ If backend sent a refreshed token, store it
    if (response.data && response.data.token) {
      localStorage.setItem("token", response.data.token);
    }
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // token expired or invalid
      localStorage.removeItem("token");
      window.location.href = "/login?expired=true"; // redirect to login with query param
    }
    return Promise.reject(error);
  }
);

export function loginUser(credentials) {
  return API.post("/auth/login", credentials);
}

export function signupUser(data) {
  return API.post("/auth/signup", data);
}

export function getEntries() {
  return API.get("/entries");
}

export function createEntry(payload) {
  return API.post("/entry", payload);
}

export function updateEntry(id, payload) {
  return API.put(`/entry/${id}`, payload);
}

export function deleteEntry(id) {
  return API.delete(`/entry/${id}`);
}

// const API = axios.create({
//   baseURL: "http://127.0.0.1:8000"
// });

// export const getEntries = () => API.get("/entries");
// export const createEntry = (data) => API.post("/entry", data);
