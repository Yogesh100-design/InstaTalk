import axios from "axios";

const API = axios.create({
  baseURL: "https://instatalk-tyq7.onrender.com/api",
});

export const setToken = (token) => {
  API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
};

export default API;
