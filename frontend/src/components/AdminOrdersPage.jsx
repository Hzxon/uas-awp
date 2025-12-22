import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { orderApi } from "../api";

const formatRupiah = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
const formatTanggal = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTanggalShort = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
};

const badgeClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("paid") || s.includes("lunas") || s.includes("selesai") || s.includes("done"))
    return "bg-emerald-100 text-emerald-700";
  if (s.includes("pending") || s.includes("proses") || s.includes("processing"))
    return "bg-amber-100 text-amber-700";
  if (s.includes("cancel") || s.includes("gagal") || s.includes("failed"))
    return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
};

const AdminOrdersPage = ({ authToken, userName, userRole }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [outletFilter, setOutletFilter] = useState("Semua");
  const [dateFilter, setDateFilter] = useState("30");

  const fetchOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg("");
      const { orders: list } = await orderApi.adminList(authToken);
      setOrders(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Gagal memuat history transaksi:", err);
      setErrorMsg("Gagal memuat history transaksi.");
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    if (authToken) fetchOrders();
  }, [authToken, fetchOrders]);

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = Date.now();
    const windowMs = Number(dateFilter) ? Number(dateFilter) * 24 * 60 * 60 * 1000 : null;
    return orders.filter((o) => {
      const matchesStatus =
        statusFilter === "Semua" ||
        (o.status || "").toLowerCase().includes(statusFilter.toLowerCase()) ||
        (o.payment_status || "").toLowerCase().includes(statusFilter.toLowerCase());
      if (!matchesStatus) return false;
      const matchesOutlet =
        outletFilter === "Semua" ||
        (o.outlet_nama || "").toLowerCase().includes(outletFilter.toLowerCase());
      if (!matchesOutlet) return false;
      if (windowMs && o.tanggal) {
        const ts = new Date(o.tanggal).getTime();
        if (!Number.isNaN(ts) && now - ts > windowMs) return false;
      }
      if (!q) return true;
      const text = `${o.id} ${o.user_nama || ""} ${o.outlet_nama || ""} ${o.payment_status || ""} ${o.status || ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [orders, search, statusFilter, outletFilter, dateFilter]);

  const outletOptions = useMemo(() => {
    const set = new Set();
    orders.forEach((o) => {
      if (o.outlet_nama) set.add(o.outlet_nama);
    });
    return Array.from(set);
  }, [orders]);

  // Summary stats
  const stats = useMemo(() => {
    const totalOrders = filteredOrders.length;
    const totalRevenue = filteredOrders.reduce((sum, o) => sum + Number(o.total_pembayaran || 0), 0);
    const paidOrders = filteredOrders.filter(o =>
      (o.payment_status || "").toLowerCase().includes("paid")
    ).length;
    return { totalOrders, totalRevenue, paidOrders };
  }, [filteredOrders]);

  // Download CSV function
  const downloadCSV = () => {
    const headers = ["ID", "Tanggal", "Customer", "Outlet", "Total", "Status Pembayaran"];
    const rows = filteredOrders.map(o => [
      o.id,
      formatTanggal(o.tanggal),
      o.user_nama || "-",
      o.outlet_nama || "-",
      o.total_pembayaran || 0,
      o.payment_status || "-"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `rekap-transaksi-${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, #e0f7fa 0%, #fffde7 50%, #ffecb3 100%)' }}>
      {/* Hero Banner with Stats */}
      <div className="bg-gradient-to-r from-teal-500 via-cyan-500 to-teal-400 pt-5 pb-6">
        <div className="mx-auto max-w-6xl px-4">
          {/* Header Row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/admin")}
                className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center text-white hover:bg-white/30 transition"
              >
                <i className="fas fa-arrow-left"></i>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white">Rekap Transaksi</h1>
                <p className="text-white/80 text-sm">
                  {userRole === "superadmin" ? "Semua Outlet" : `Login: ${userName}`}
                </p>
              </div>
            </div>
            <button
              onClick={downloadCSV}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-teal-600 font-semibold text-sm shadow-lg hover:shadow-xl transition-all"
            >
              <i className="fas fa-download"></i>
              Download Rekap
            </button>
          </div>

          {/* Stats Cards - inside banner */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white/95 backdrop-blur p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30">
                  <i className="fas fa-receipt text-lg"></i>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.totalOrders}</p>
                  <p className="text-sm text-slate-500">Total Order</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-white/95 backdrop-blur p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                  <i className="fas fa-check-circle text-lg"></i>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">{stats.paidOrders}</p>
                  <p className="text-sm text-slate-500">Lunas</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-white/95 backdrop-blur p-5 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                  <i className="fas fa-money-bill-wave text-lg"></i>
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900">{formatRupiah(stats.totalRevenue)}</p>
                  <p className="text-sm text-slate-500">Total Revenue</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-5">

        {/* Filters */}
        <div className="rounded-2xl bg-white/80 backdrop-blur border border-slate-200/50 p-4 shadow-lg">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari order ID, customer, outlet..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
              />
            </div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
            >
              <option value="7">7 Hari Terakhir</option>
              <option value="30">30 Hari Terakhir</option>
              <option value="90">90 Hari Terakhir</option>
              <option value="0">Semua Waktu</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
            >
              <option value="Semua">Semua Status</option>
              <option value="paid">Lunas</option>
              <option value="pending">Pending</option>
              <option value="failed">Gagal</option>
            </select>
            {outletOptions.length > 1 && (
              <select
                value={outletFilter}
                onChange={(e) => setOutletFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition"
              >
                <option value="Semua">Semua Outlet</option>
                {outletOptions.map((name) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="rounded-2xl bg-white/80 backdrop-blur border border-slate-200/50 shadow-lg overflow-hidden">
          {errorMsg && (
            <div className="px-4 py-3 bg-red-50 border-b border-red-100 text-sm text-red-700">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {errorMsg}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Order</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Customer</th>
                  <th className="text-left px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Outlet</th>
                  <th className="text-right px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="text-center px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-right px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Tanggal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, idx) => (
                    <tr key={idx}>
                      <td className="px-5 py-4"><div className="h-5 w-16 animate-pulse rounded bg-slate-200" /></td>
                      <td className="px-5 py-4"><div className="h-5 w-24 animate-pulse rounded bg-slate-200" /></td>
                      <td className="px-5 py-4"><div className="h-5 w-20 animate-pulse rounded bg-slate-200" /></td>
                      <td className="px-5 py-4"><div className="h-5 w-20 animate-pulse rounded bg-slate-200 ml-auto" /></td>
                      <td className="px-5 py-4"><div className="h-6 w-16 animate-pulse rounded-full bg-slate-200 mx-auto" /></td>
                      <td className="px-5 py-4"><div className="h-5 w-16 animate-pulse rounded bg-slate-200 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <i className="fas fa-inbox text-4xl text-slate-300"></i>
                        <p className="text-slate-500">Tidak ada transaksi ditemukan</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-900">#{order.id}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-slate-700">{order.user_nama || "-"}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-slate-600 text-sm">{order.outlet_nama || "-"}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="font-semibold text-slate-900">
                          {formatRupiah(order.total_pembayaran)}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${badgeClass(order.payment_status)}`}>
                          {order.payment_status || "-"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm text-slate-600">{formatTanggalShort(order.tanggal)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer with count */}
          {!isLoading && filteredOrders.length > 0 && (
            <div className="px-5 py-3 bg-slate-50/50 border-t border-slate-100 text-sm text-slate-500">
              Menampilkan {filteredOrders.length} transaksi
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminOrdersPage;
