import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderApi } from "../api";

const statusFlow = [
  "pickup_scheduled",
  "picked_up",
  "washing",
  "drying",
  "delivering",
  "delivered",
];

const statusLabel = (s) => {
  switch (s) {
    case "pickup_scheduled":
      return "Pickup dijadwalkan";
    case "picked_up":
      return "Sudah di-pickup";
    case "washing":
      return "Sedang dicuci";
    case "drying":
      return "Pengeringan";
    case "delivering":
      return "Sedang diantar";
    case "delivered":
      return "Selesai";
    default:
      return s || "-";
  }
};

const OrderStatusPage = ({ authToken }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [timelineMap, setTimelineMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderApi.list(authToken);
        const list = Array.isArray(data.orders) ? data.orders : [];
        setOrders(list);
        // Prefetch timelines for up to 5 latest orders
        const latest = list.slice(0, 5);
        const timelines = {};
        for (const ord of latest) {
          try {
            const tl = await orderApi.timeline(authToken, ord.id);
            timelines[ord.id] = Array.isArray(tl.logs) ? tl.logs : [];
          } catch (_) {
            timelines[ord.id] = [];
          }
        }
        setTimelineMap(timelines);
      } catch (err) {
        setError("Gagal memuat daftar pesanan");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [authToken]);

  const filtered = useMemo(() => {
    if (statusFilter === "Semua") return orders;
    const target = statusFilter.toLowerCase();
    return orders.filter((o) => (o.status || "").toLowerCase().includes(target));
  }, [orders, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Status pesanan</p>
            <h1 className="text-2xl font-bold text-slate-900">Riwayat & timeline</h1>
            <p className="text-sm text-slate-600">Lihat status pickup, proses, hingga antar.</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-slate-400 focus:bg-white focus:ring focus:ring-blue-200"
            >
              <option value="Semua">Semua status</option>
              <option value="pickup">Pickup</option>
              <option value="washing">Washing</option>
              <option value="delivering">Delivering</option>
              <option value="delivered">Delivered</option>
            </select>
            <button
              onClick={() => navigate("/")}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Kembali ke beranda
            </button>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Memuat pesanan...</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-sm text-slate-500">
            Belum ada pesanan atau tidak ada yang cocok dengan filter.
          </div>
        )}

        {!loading &&
          filtered.map((order) => {
            const logs = timelineMap[order.id] || [];
            const logMap = logs.reduce((acc, item) => {
              acc[item.status] = item;
              return acc;
            }, {});
            return (
              <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Order #{order.id}</p>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {order.status ? statusLabel(order.status) : "Status tidak tersedia"}
                    </h3>
                    <p className="text-sm text-slate-600">
                      Total Rp {Number(order.total_pembayaran || 0).toLocaleString("id-ID")} -{" "}
                      {order.tanggal ? new Date(order.tanggal).toLocaleString("id-ID") : "-"}
                    </p>
                  </div>
                  <div className="text-xs text-slate-500">
                    Metode: {order.payment_method || "-"} <br />
                    Pembayaran: {order.payment_status || "-"}
                  </div>
                </div>
                <div className="space-y-3">
                  {statusFlow.map((step) => {
                    const log = logMap[step];
                    const isDone = Boolean(log);
                    return (
                      <div key={step} className="flex items-start gap-3">
                        <div
                          className={`h-8 w-8 rounded-full border flex items-center justify-center ${
                            isDone ? "bg-emerald-100 border-emerald-200 text-emerald-700" : "bg-slate-100 border-slate-200 text-slate-400"
                          }`}
                        >
                          {isDone ? "Y" : "-"}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-slate-900">{statusLabel(step)}</p>
                          <p className="text-xs text-slate-500">
                            {log?.created_at ? new Date(log.created_at).toLocaleString("id-ID") : "Menunggu diproses"}
                          </p>
                          {log?.note && <p className="text-xs text-slate-600">Catatan: {log.note}</p>}
                        </div>
                      </div>
                    );
                  })}
                  {logs.length === 0 && (
                    <p className="text-sm text-slate-500">Timeline belum tersedia untuk pesanan ini.</p>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default OrderStatusPage;
