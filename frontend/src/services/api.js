// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:8000",
});

// POST
export const createUser = (data) => API.post("/users/create/", data);

// GET (list all users)
export const getUsers = () => API.get("/users/list/");  // <-- fix here

// GET (one user by ID)
export const getUserById = (id) => API.get(`/users/${id}/`);
