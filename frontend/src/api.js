const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// 🔴 TAMBAHKAN 3 BARIS INI UNTUK DEBUGGING 🔴
console.log("--- DEBUG START ---");
console.log("1. Nilai dari .env:", import.meta.env.VITE_API_URL);
console.log("2. API_BASE_URL yang dipakai:", API_BASE_URL);
console.log("--- DEBUG END ---");

const request = async (path, { method = "GET", token, body } = {}) => {
  // Tambahkan log ini juga di dalam request
  console.log(`3. Requesting ke URL: ${API_BASE_URL}${path}`);
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  console.log("Body Subtotal: ", body);
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
};

// panggil layananApi.create(token, data) untuk buat data baru ke database. oper dulu ke backend, biar backend yang handle controllersnya
export const layananApi = {
  list: () => request("/masters/layanan", { method: "GET" }),
  create: (token, data) => request("/masters/layanan", { method: "POST", token, body: data }),

};

export const produkApi = {
  list: () => request("/masters/produk", { method: "GET" }),
};

export { API_BASE_URL };

