import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { orderApi, API_BASE_URL } from "../api";
import Navbar from "./Navbar";
import Footer from "./Footer";

const PaymentSuccess = ({ authToken, cartCount = 0, cartItems = [], userName = "", onLogout }) => {
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

  const statusFlow = [
    { key: "pickup_scheduled", label: "Pickup Dijadwalkan", icon: "fas fa-calendar-check" },
    { key: "picked_up", label: "Sudah Di-pickup", icon: "fas fa-truck-pickup" },
    { key: "washing", label: "Sedang Dicuci", icon: "fas fa-soap" },
    { key: "drying", label: "Pengeringan", icon: "fas fa-wind" },
    { key: "delivering", label: "Sedang Diantar", icon: "fas fa-shipping-fast" },
    { key: "delivered", label: "Selesai", icon: "fas fa-check-circle" },
  ];

  const timelineMap = timeline.reduce((acc, item) => {
    acc[item.status] = item;
    return acc;
  }, {});

  // Find current step index
  const currentStepIndex = statusFlow.findIndex(step => step.key === order?.status);

  if (loading) {
    return (
      <div className="checkout-address-page">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-slate-600">Memuat ringkasan pembayaran...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="checkout-address-page">
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="checkout-main-card p-8 text-center max-w-md">
            <div className="h-16 w-16 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-circle text-2xl"></i>
            </div>
            <p className="text-lg font-semibold text-slate-800 mb-2">Terjadi Kesalahan</p>
            <p className="text-sm text-slate-600 mb-6">{error}</p>
            <Link to="/" className="checkout-btn-next inline-flex">
              <i className="fas fa-home"></i>
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-address-page">
      <Navbar
        cartCount={cartCount}
        cartItems={cartItems}
        isLoggedIn={Boolean(authToken)}
        userName={userName}
        onLogout={onLogout}
      />

      <div className="checkout-address-container max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="checkout-main-card mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-400 p-6 text-white text-center">
            <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 animate-bounce">
              <i className="fas fa-check text-4xl text-white"></i>
            </div>
            <h1 className="text-2xl font-bold mb-1">Pembayaran Berhasil!</h1>
            <p className="text-green-50">Order #{order?.id} telah dikonfirmasi</p>
            <p className="text-lg font-bold mt-2">Rp {Number(order?.total_pembayaran || 0).toLocaleString("id-ID")}</p>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="checkout-main-card p-5 mb-6">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <i className="fas fa-tasks text-teal-500"></i>
            Status Pesanan
          </h2>

          {/* Visual Timeline */}
          <div className="relative">
            {statusFlow.map((step, index) => {
              const log = timelineMap[step.key];
              const isDone = Boolean(log);
              const isCurrent = step.key === order?.status || (order?.status === "paid" && index === 0);
              const isPending = !isDone && !isCurrent;

              return (
                <div key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
                  {/* Connector Line */}
                  {index < statusFlow.length - 1 && (
                    <div
                      className={`absolute left-6 top-12 w-0.5 h-full -ml-px ${isDone ? "bg-green-400" : "bg-slate-200"
                        }`}
                    ></div>
                  )}

                  {/* Status Icon */}
                  <div
                    className={`relative z-10 h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isDone
                      ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-200"
                      : isCurrent
                        ? "bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-200 animate-pulse"
                        : "bg-slate-100 text-slate-400 border-2 border-slate-200"
                      }`}
                  >
                    <i className={`${step.icon} ${isDone || isCurrent ? "text-lg" : "text-base"}`}></i>
                  </div>

                  {/* Status Content */}
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3
                        className={`font-semibold ${isDone ? "text-green-700" : isCurrent ? "text-orange-600" : "text-slate-400"
                          }`}
                      >
                        {step.label}
                      </h3>
                      {isDone && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-600">
                          Selesai
                        </span>
                      )}
                      {isCurrent && !isDone && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-600">
                          Saat Ini
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${isDone ? "text-slate-600" : "text-slate-400"}`}>
                      {log?.created_at
                        ? new Date(log.created_at).toLocaleString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                        : isPending
                          ? "Menunggu proses sebelumnya"
                          : "Segera diproses"}
                    </p>
                    {log?.note && (
                      <p className="text-xs text-slate-500 mt-1 italic">
                        <i className="fas fa-sticky-note mr-1"></i>
                        {log.note}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {timeline.length === 0 && (
            <div className="text-center py-8 bg-slate-50 rounded-xl mt-4">
              <i className="fas fa-clock text-4xl text-slate-300 mb-3"></i>
              <p className="text-slate-500">Pesanan Anda sedang diproses</p>
              <p className="text-sm text-slate-400 mt-1">Timeline akan diperbarui secara otomatis</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDownloadInvoice}
            className="checkout-btn-next flex-1 justify-center"
          >
            <i className="fas fa-file-pdf"></i>
            Unduh Invoice (PDF)
          </button>
          <Link
            to="/orders/status"
            className="checkout-btn-back flex-1 justify-center flex items-center gap-2"
          >
            <i className="fas fa-list-alt"></i>
            Lihat Semua Pesanan
          </Link>
          <Link
            to="/"
            className="checkout-btn-back flex-1 justify-center flex items-center gap-2"
          >
            <i className="fas fa-home"></i>
            Kembali ke Beranda
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default PaymentSuccess;
