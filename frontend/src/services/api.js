import axios from "axios";

const API_URL = "http://127.0.0.1:8000";

export function getEntries() {
  return axios.get(`${API_URL}/entries`);
}

export function createEntry(payload) {
  return axios.post(`${API_URL}/entry`, payload);
}

export function updateEntry(id, payload) {
  return axios.put(`${API_URL}/entry/${id}`, payload);
}

// const API = axios.create({
//   baseURL: "http://127.0.0.1:8000"
// });

// export const getEntries = () => API.get("/entries");
// export const createEntry = (data) => API.post("/entry", data);
