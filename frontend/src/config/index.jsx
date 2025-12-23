import axios from "axios";

export const BASE_URL = "https://linkedin-3-4ms6.onrender.com"

export const clientServer = axios.create({
  baseURL: BASE_URL,
});
