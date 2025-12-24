import api from "../lib/api";

export async function login(email, password) {
  await api.get("/sanctum/csrf-cookie");
  const response = await api.post("/api/v1/auth/login", { email, password });
  return response.data;
}

export async function me() {
  const response = await api.get("/api/v1/auth/me");
  return response.data;
}

export async function logout() {
  await api.post("/api/v1/auth/logout");
}
