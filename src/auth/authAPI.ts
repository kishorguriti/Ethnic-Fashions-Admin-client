import axios from "axios";

const API = axios.create({
  baseURL: "https://your-api.com", // replace later
});

export const loginAPI = (data: { email: string; password: string }) =>
  API.post("/login", data);