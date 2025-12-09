import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { orderApi, API_BASE_URL } from "../api";

const PaymentSuccess = ({ authToken }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const orderId = query.get("orderId");

  const [order, setOrder] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!orderId) {
      navigate("/");
      return;
    }
    const fetchOrder = async () => {
      try {
        const data = await orderApi.get(authToken, orderId);
        setOrder(data.order);
        const tl = await orderApi.timeline(authToken, orderId);
        setTimeline(Array.isArray(tl.logs) ? tl.logs : []);
      } catch (err) {
        setError(err.message || "Gagal memuat data pembayaran");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [authToken, orderId, navigate]);

  const handleDownloadInvoice = async () => {
    try {
      const url = `${API_BASE_URL}/payments/invoice/${orderId}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) throw new Error("Gagal mengunduh invoice");
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setError(err.message || "Gagal mengunduh invoice");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-700">
        Memuat ringkasan pembayaran...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-red-600">
        <p className="mb-4 font-semibold">Terjadi kesalahan</p>
        <p className="text-sm text-slate-600">{error}</p>
        <Link to="/" className="mt-6 text-blue-600 font-semibold">
          Kembali ke beranda
        </Link>
      </div>
    );
  }

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

  const timelineMap = timeline.reduce((acc, item) => {
    acc[item.status] = item;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-2xl w-full p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-green-600 font-semibold">Pembayaran berhasil</p>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">Order #{order?.id}</h1>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
            <i className="fas fa-check text-xl"></i>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm text-slate-700">
            <span>Status</span>
            <span className="font-semibold text-green-600">{statusLabel(order?.status)}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-700">
            <span>Total</span>
            <span className="font-semibold">Rp {Number(order?.total_pembayaran || 0).toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between text-sm text-slate-700">
            <span>Tanggal</span>
            <span className="font-medium">
              {order?.tanggal ? new Date(order.tanggal).toLocaleString("id-ID") : "-"}
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800 mb-3">Status order</p>
          <div className="space-y-3">
            {statusFlow.map((step) => {
              const log = timelineMap[step];
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
                      {log?.created_at
                        ? new Date(log.created_at).toLocaleString("id-ID")
                        : "Menunggu diproses"}
                    </p>
                    {log?.note && <p className="text-xs text-slate-600">Catatan: {log.note}</p>}
                  </div>
                </div>
              );
            })}
            {timeline.length === 0 && (
              <p className="text-sm text-slate-500">Timeline belum tersedia.</p>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-800 mb-2">Alamat penjemputan</p>
          <div className="border border-slate-200 rounded-xl p-3 text-sm text-slate-700 bg-slate-50">
            <p className="font-semibold">{order?.nama_penerima || "-"}</p>
            <p>{order?.alamat || "-"}</p>
            {order?.phone && <p className="text-slate-500">Telp: {order.phone}</p>}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDownloadInvoice}
            className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-sm"
          >
            Unduh Invoice (PDF)
          </button>
          <Link
            to="/orders/status"
            className="flex-1 text-center bg-white border border-slate-200 py-3 rounded-xl font-semibold text-slate-800 hover:border-blue-300 transition"
          >
            Lihat status
          </Link>
          <Link
            to="/"
            className="flex-1 text-center bg-white border border-slate-200 py-3 rounded-xl font-semibold text-slate-800 hover:border-blue-300 transition"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
