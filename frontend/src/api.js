const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const request = async (path, { method = "GET", token, body } = {}) => {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    credentials: "include", // ⬅️ TAMBAHKAN INI (agar match dengan backend cors)
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
  create: (token, payload) => request("/orders", { method: "POST", token, body: payload }),
  list: (token) => request("/orders", { token }),
  adminList: (token) => request("/orders/admin/all", { token }),
  timeline: (token, id) => request(`/status/${id}`, { token }),
  get: (token, id) => request(`/orders/${id}`, { token }),
};

export const addressApi = {
  list: (token) => request("/addresses", { token }),
  create: (token, data) => request("/addresses", { method: "POST", token, body: data }),
  update: (token, id, data) => request(`/addresses/${id}`, { method: "PUT", token, body: data }),
  remove: (token, id) => request(`/addresses/${id}`, { method: "DELETE", token }),
};

export const paymentApi = {
  createMock: (token, orderId) => request("/payments/mock", { method: "POST", token, body: { orderId } }),
  confirmMock: (token, paymentToken, paymentMethod) =>
    request("/payments/mock/confirm", { method: "POST", token, body: { paymentToken, paymentMethod } }),
  downloadInvoice: (token, orderId) => request(`/payments/invoice/${orderId}`, { token }),
};

export const layananApi = {
  list: (token) => request("/masters/layanan", { method: "GET", token }),
  create: (token, data) =>
    request("/masters/layanan", { method: "POST", token, body: data }),
  update: (token, id, data) =>
    request(`/masters/layanan/${id}`, { method: "PUT", token, body: data }),
  remove: (token, id) => request(`/masters/layanan/${id}`, { method: "DELETE", token }),
};

export const produkApi = {
  list: (token) => request("/masters/produk", { method: "GET", token }),
  create: (token, data) =>
    request("/masters/produk", { method: "POST", token, body: data }),
  update: (token, id, data) =>
    request(`/masters/produk/${id}`, { method: "PUT", token, body: data }),
  remove: (token, id) => request(`/masters/produk/${id}`, { method: "DELETE", token }),
};

export const outletApi = {
  list: () => request("/outlets"),
  adminList: (token) => request("/outlets/admin/all", { token }),
  create: (token, data) => request("/outlets", { method: "POST", token, body: data }),
  update: (token, id, data) => request(`/outlets/${id}`, { method: "PUT", token, body: data }),
  remove: (token, id) => request(`/outlets/${id}`, { method: "DELETE", token }),
};

export { API_BASE_URL };
