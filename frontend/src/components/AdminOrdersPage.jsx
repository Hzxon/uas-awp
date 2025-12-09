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

const statusList = ["Semua", "pending", "proses", "selesai", "cancel", "paid", "failed"];

const badgeClass = (status) => {
  const s = (status || "").toLowerCase();
  if (s.includes("paid") || s.includes("lunas") || s.includes("selesai"))
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (s.includes("pending") || s.includes("proses"))
    return "bg-amber-50 text-amber-700 border-amber-200";
  if (s.includes("cancel") || s.includes("gagal") || s.includes("failed"))
    return "bg-red-50 text-red-700 border-red-200";
  return "bg-slate-50 text-slate-700 border-slate-200";
};

const AdminOrdersPage = ({ authToken, userName }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [paymentFilter, setPaymentFilter] = useState("Semua");
  const [outletFilter, setOutletFilter] = useState("Semua");
  const [dateFilter, setDateFilter] = useState("30"); // days window

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
        (o.status || "").toLowerCase().includes(statusFilter) ||
        (o.payment_status || "").toLowerCase().includes(statusFilter);
      if (!matchesStatus) return false;
      const matchesPayment =
        paymentFilter === "Semua" ||
        (o.payment_status || "").toLowerCase().includes(paymentFilter.toLowerCase()) ||
        (o.payment_method || "").toLowerCase().includes(paymentFilter.toLowerCase());
      if (!matchesPayment) return false;
      const matchesOutlet =
        outletFilter === "Semua" ||
        (o.outlet_nama || "").toLowerCase().includes(outletFilter.toLowerCase());
      if (!matchesOutlet) return false;
      if (windowMs && o.tanggal) {
        const ts = new Date(o.tanggal).getTime();
        if (!Number.isNaN(ts) && now - ts > windowMs) return false;
      }
      if (!q) return true;
      const text = `${o.id} ${o.user_nama || ""} ${o.nama_penerima || ""} ${o.alamat || ""} ${
        o.payment_status || ""
      } ${o.status || ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [orders, search, statusFilter, paymentFilter, outletFilter, dateFilter]);

  const outletOptions = useMemo(() => {
    const set = new Set();
    orders.forEach((o) => {
      if (o.outlet_nama) set.add(o.outlet_nama);
    });
    return Array.from(set);
  }, [orders]);

  const chartData = useMemo(() => {
    const buckets = {};
    filteredOrders.forEach((o) => {
      const d = o.tanggal ? new Date(o.tanggal) : null;
      if (!d || Number.isNaN(d.getTime())) return;
      const key = d.toISOString().slice(0, 10);
      if (!buckets[key]) buckets[key] = { total: 0, count: 0, paid: 0, failed: 0 };
      const totalPembayaran = Number(o.total_pembayaran || o.totalPembayaran || 0);
      buckets[key].total += totalPembayaran;
      buckets[key].count += 1;
      const pay = (o.payment_status || "").toLowerCase();
      if (pay.includes("paid") || pay.includes("settled") || pay.includes("lunas")) buckets[key].paid += 1;
      if (pay.includes("fail") || pay.includes("cancel")) buckets[key].failed += 1;
    });
    return Object.entries(buckets)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, val]) => ({
        date,
        total: val.total,
        count: val.count,
        paid: val.paid,
        failed: val.failed,
      }));
  }, [filteredOrders]);

  const maxTotal = useMemo(
    () => (chartData.length ? Math.max(...chartData.map((d) => d.total || 0)) : 0),
    [chartData]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-sky-500 to-emerald-400 text-sm font-semibold text-white shadow-md shadow-blue-500/20">
              WF
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Admin panel</p>
              <h1 className="text-lg font-bold text-slate-900">History transaksi</h1>
              <p className="text-xs text-slate-600">Login sebagai {userName || "Admin"}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="h-2 w-2 rounded-full bg-slate-500" />
              Kembali ke panel
            </button>
            <button
              onClick={fetchOrders}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Refresh data
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Filter & pencarian</p>
              <h2 className="text-xl font-bold text-slate-900">Cari transaksi</h2>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari ID, nama user, penerima, alamat, status..."
                className="w-64 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring focus:ring-blue-200"
              />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring focus:ring-blue-200"
              >
                <option value="7">7 hari</option>
                <option value="30">30 hari</option>
                <option value="90">90 hari</option>
                <option value="0">Semua waktu</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring focus:ring-blue-200"
              >
                {statusList.map((item) => (
                  <option key={item} value={item}>
                    {item === "Semua" ? "Semua status" : item}
                  </option>
                ))}
              </select>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring focus:ring-blue-200"
              >
                <option value="Semua">Semua pembayaran</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="fail">Failed</option>
                <option value="cod">COD</option>
                <option value="transfer">Transfer</option>
              </select>
              <select
                value={outletFilter}
                onChange={(e) => setOutletFilter(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring focus:ring-blue-200"
              >
                <option value="Semua">Semua outlet</option>
                {outletOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Grafik</p>
              <h2 className="text-xl font-bold text-slate-900">Tren transaksi</h2>
              <p className="text-sm text-slate-600">Jumlah order & total pembayaran per hari.</p>
            </div>
          </div>
          <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-md">
            {chartData.length === 0 ? (
              <div className="text-center text-sm text-slate-500 py-6">Tidak ada data dalam rentang ini.</div>
            ) : (
              <div className="space-y-3">
                {chartData.map((row) => (
                  <div key={row.date} className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-semibold text-slate-800">{row.date}</span>
                      <span>{formatRupiah(row.total)}</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-emerald-400"
                        style={{ width: maxTotal ? `${Math.max(4, (row.total / maxTotal) * 100)}%` : "4%" }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Order {row.count}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Paid {row.paid}</span>
                      <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700">Failed {row.failed}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur">
          {errorMsg && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMsg}
            </div>
          )}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-900">
                <thead className="sticky top-0 z-10 bg-slate-100 text-left">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Order</th>
                    <th className="px-4 py-3 font-semibold">User</th>
                    <th className="px-4 py-3 font-semibold">Pembayaran</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: 5 }).map((_, idx) => (
                        <tr key={idx} className="border-t border-slate-200">
                          <td className="px-4 py-3">
                            <div className="h-4 w-20 animate-pulse rounded bg-slate-200" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
                          </td>
                          <td className="px-4 py-3">
                            <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
                          </td>
                        </tr>
                      ))
                    : filteredOrders.map((order) => (
                        <tr key={order.id} className="border-t border-slate-200 hover:bg-slate-50">
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">#{order.id}</div>
                            <div className="text-xs text-slate-500">
                              Total {formatRupiah(order.total_pembayaran || order.totalPembayaran)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-800">{order.user_nama || "User"}</div>
                            <div className="text-xs text-slate-500">
                              {order.nama_penerima || order.alamat ? `${order.nama_penerima || "-"} - ${order.alamat || "-"}` : "Alamat tidak tersedia"}
                            </div>
                            {order.outlet_nama && (
                              <div className="text-[11px] text-slate-500">Outlet: {order.outlet_nama}</div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-semibold text-slate-900">
                              {formatRupiah(order.total_pembayaran || order.totalPembayaran)}
                            </div>
                            <div className="text-xs text-slate-500">
                              Fee {formatRupiah(order.delivery_fee || 0)} - Pajak {formatRupiah(order.tax_amount || 0)}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="inline-flex items-center gap-2">
                              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass(order.status)}`}>
                                {order.status || "Status?"}
                              </span>
                              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClass(order.payment_status)}`}>
                                {order.payment_status || "Pembayaran?"}
                              </span>
                              {order.payment_method && (
                                <span className="rounded-full border px-2.5 py-1 text-xs font-semibold bg-slate-50 text-slate-700 border-slate-200">
                                  {order.payment_method}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{formatTanggal(order.tanggal || order.createdAt)}</td>
                        </tr>
                      ))}
                  {!isLoading && filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                        Tidak ada transaksi yang cocok dengan filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminOrdersPage;
