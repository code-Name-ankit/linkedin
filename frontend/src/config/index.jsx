import axios from "axios";

export const BASE_URL = "https://8i4ksfm0yh.execute-api.eu-north-1.amazonaws.com/default/mern-backend"

export const clientServer = axios.create({
  baseURL: BASE_URL,
});
