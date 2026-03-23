import axios from "axios";
import { API_ROOT } from "./apiConfig";

export const api = axios.create({
  baseURL: API_ROOT,
  headers: {
    "Content-Type": "application/json",
  },
});

export const unwrap = (data) =>
  Array.isArray(data?.$values) ? data.$values : data;

export default api;
