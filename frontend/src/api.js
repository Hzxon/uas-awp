const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const request = async (path, { method = "GET", body, token } = {}) => {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || "Permintaan gagal diproses");
  }

  return data;
};

export const authApi = {
  signup: (nama, email, password) =>
    request("/auth/signup", { method: "POST", body: { nama, email, password } }),
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),
  me: (token) => request("/auth/me", { token }),
};

export const orderApi = {
  create: (token, payload) => request("/orders", { method: "POST", body: payload, token }),
  list: (token) => request("/orders", { token }),
};

export { API_BASE_URL };
