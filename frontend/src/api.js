import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3002",
  withCredentials: true, 
});

API.interceptors.response.use(
  (r) => r,
  (err) => {
    console.error("[API ERROR]", err?.response?.data || err.message);
    return Promise.reject(err);
  }
);

export default API;