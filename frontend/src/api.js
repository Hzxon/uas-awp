const DEFAULT_API_BASE_URL = "http://localhost:5001/api";
const API_BASE_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_BASE_URL).replace(/\/$/, "");

const request = async (path, { method = "GET", token, body } = {}) => {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
    credentials: "include", // ⬅️ TAMBAHKAN INI (agar match dengan backend cors)
    body: body ? JSON.stringify(body) : undefined,
  };

  const bases = [API_BASE_URL, DEFAULT_API_BASE_URL].filter(
    (base, idx, arr) => base && arr.indexOf(base) === idx
  );

  let lastErr;
  for (const base of bases) {
    try {
      const response = await fetch(`${base}${path}`, options);
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "Permintaan gagal diproses");
      }

      // If the first base URL is down (e.g., wrong port), fall back to the default one.
      if (base !== API_BASE_URL) {
        console.warn(`Primary API ${API_BASE_URL} unreachable, fallback to ${base}`);
      }
      return data;
    } catch (err) {
      const isNetworkError = err instanceof TypeError || err?.message?.includes("Failed to fetch");
      if (!isNetworkError || base === DEFAULT_API_BASE_URL) {
        throw err;
      }
      lastErr = err;
    }
  }

  throw lastErr || new Error("Tidak dapat terhubung ke server API");
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
  getById: (id) => request(`/outlets/${id}`),
};

// Partner API - for laundry partners
export const partnerApi = {
  register: (token, data) => request("/partner/register", { method: "POST", token, body: data }),
  getProfile: (token) => request("/partner/profile", { token }),
  updateProfile: (token, data) => request("/partner/profile", { method: "PUT", token, body: data }),
  getDashboard: (token) => request("/partner/dashboard", { token }),
  getOrders: (token, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/partner/orders${queryString ? `?${queryString}` : ''}`, { token });
  },
  updateOrderStatus: (token, orderId, status, note = "") =>
    request(`/partner/orders/${orderId}/status`, { method: "PUT", token, body: { status, note } }),
};

// Admin Partner API - for managing partner applications
export const adminPartnerApi = {
  list: (token, status = null) => {
    const queryString = status ? `?status=${status}` : '';
    return request(`/admin/partners${queryString}`, { token });
  },
  get: (token, id) => request(`/admin/partners/${id}`, { token }),
  approve: (token, id) => request(`/admin/partners/${id}/approve`, { method: "POST", token }),
  reject: (token, id, reason = "") =>
    request(`/admin/partners/${id}/reject`, { method: "POST", token, body: { reason } }),
  suspend: (token, id) => request(`/admin/partners/${id}/suspend`, { method: "POST", token }),
  reactivate: (token, id) => request(`/admin/partners/${id}/reactivate`, { method: "POST", token }),
};

// Review API
export const reviewApi = {
  create: (token, data) => request("/reviews", { method: "POST", token, body: data }),
  getOutletReviews: (outletId, params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return request(`/reviews/outlet/${outletId}${queryString ? `?${queryString}` : ''}`);
  },
  getMyReviews: (token) => request("/reviews/my", { token }),
  canReview: (token, orderId) => request(`/reviews/can-review/${orderId}`, { token }),
  reply: (token, reviewId, reply) =>
    request(`/reviews/${reviewId}/reply`, { method: "POST", token, body: { reply } }),
};

export { API_BASE_URL };

