import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderApi, reviewApi } from "../api";
import ReviewForm from "./reviews/ReviewForm";
import Navbar from "./Navbar";
import Footer from "./Footer";

const statusFlow = [
  "pickup_scheduled",
  "picked_up",
  "washing",
  "drying",
  "delivering",
  "delivered",
];

const statusIcons = {
  pickup_scheduled: "fa-calendar-check",
  picked_up: "fa-truck-pickup",
  washing: "fa-soap",
  drying: "fa-wind",
  delivering: "fa-truck",
  delivered: "fa-check-circle",
};

const statusLabel = (s) => {
  switch (s) {
    case "pickup_scheduled":
      return "Pickup";
    case "picked_up":
      return "Di-pickup";
    case "washing":
      return "Dicuci";
    case "drying":
      return "Kering";
    case "delivering":
      return "Diantar";
    case "delivered":
      return "Selesai";
    case "paid":
      return "Dibayar";
    default:
      return s || "-";
  }
};

const OrderStatusPage = ({ authToken, cartCount = 0, cartItems = [], userName = "", onLogout }) => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [timelineMap, setTimelineMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("Semua");
  const [reviewingOrderId, setReviewingOrderId] = useState(null);
  const [reviewableOrders, setReviewableOrders] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderApi.list(authToken);
        const list = Array.isArray(data.orders) ? data.orders : [];
        setOrders(list);

        const latest = list.slice(0, 5);
        const timelines = {};
        const reviewable = {};

        for (const ord of latest) {
          try {
            const tl = await orderApi.timeline(authToken, ord.id);
            timelines[ord.id] = Array.isArray(tl.logs) ? tl.logs : [];
          } catch (_) {
            timelines[ord.id] = [];
          }

          if (ord.status === "delivered" || ord.status === "completed") {
            try {
              const canReview = await reviewApi.canReview(authToken, ord.id);
              reviewable[ord.id] = canReview.canReview;
            } catch (_) {
              reviewable[ord.id] = false;
            }
          }
        }
        setTimelineMap(timelines);
        setReviewableOrders(reviewable);
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

  const handleReviewSuccess = (orderId) => {
    setReviewingOrderId(null);
    setReviewableOrders(prev => ({ ...prev, [orderId]: false }));
  };

  const getCurrentStepIndex = (status) => {
    const idx = statusFlow.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="checkout-address-page" style={{ paddingTop: '2rem' }}>
      <div className="checkout-address-container" style={{ paddingTop: '0' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Riwayat & Status Order</h1>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm px-4 py-2 text-sm text-slate-700 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
            >
              <option value="Semua">Semua status</option>
              <option value="paid">Dibayar</option>
              <option value="pickup">Pickup</option>
              <option value="washing">Washing</option>
              <option value="delivering">Delivering</option>
              <option value="delivered">Delivered</option>
            </select>
            <button
              onClick={() => navigate("/")}
              className="checkout-btn-back"
            >
              <i className="fas fa-home"></i>
              Beranda
            </button>
          </div>
        </div>

        {loading && (
          <div className="checkout-main-card p-12 text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-slate-500">Memuat pesanan...</p>
          </div>
        )}

        {error && (
          <div className="checkout-validation-message mb-4">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="checkout-main-card p-12 text-center">
            <i className="fas fa-box-open text-6xl text-slate-300 mb-4"></i>
            <p className="text-slate-500">Belum ada pesanan atau tidak ada yang cocok dengan filter.</p>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-4">
          {!loading &&
            filtered.map((order) => {
              const logs = timelineMap[order.id] || [];
              const logMap = logs.reduce((acc, item) => {
                acc[item.status] = item;
                return acc;
              }, {});
              const currentIndex = getCurrentStepIndex(order.status);
              const isCompleted = order.status === "delivered" || order.status === "completed";
              const canReview = reviewableOrders[order.id];

              return (
                <div key={order.id} className="checkout-main-card overflow-hidden">
                  {/* Order Header - Compact */}
                  <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-200">
                        <i className="fas fa-receipt text-lg"></i>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Order #{order.id}</p>
                        <p className="text-sm text-slate-500">
                          {order.tanggal ? new Date(order.tanggal).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          }) : "-"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-800">
                        Rp {Number(order.total_pembayaran || 0).toLocaleString("id-ID")}
                      </p>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${order.status === "delivered" || order.status === "completed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "paid"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-orange-100 text-orange-700"
                        }`}>
                        {statusLabel(order.status)}
                      </span>
                    </div>
                  </div>

                  {/* Mini Timeline - Horizontal Steps */}
                  <div className="p-5 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      {statusFlow.map((step, index) => {
                        const isDone = index <= currentIndex;
                        const isCurrent = index === currentIndex;

                        return (
                          <React.Fragment key={step}>
                            {/* Step Circle */}
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-all ${isDone
                                  ? "bg-gradient-to-br from-teal-400 to-teal-500 text-white shadow-md"
                                  : "bg-white border-2 border-slate-200 text-slate-400"
                                  } ${isCurrent ? "ring-2 ring-teal-200 ring-offset-2" : ""}`}
                              >
                                <i className={`fas ${statusIcons[step]}`}></i>
                              </div>
                              <span className={`text-[10px] mt-1.5 font-medium ${isDone ? "text-slate-700" : "text-slate-400"}`}>
                                {statusLabel(step)}
                              </span>
                            </div>

                            {/* Connector Line */}
                            {index < statusFlow.length - 1 && (
                              <div className={`flex-1 h-0.5 mx-1 rounded-full ${index < currentIndex ? "bg-teal-400" : "bg-slate-200"
                                }`}></div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>

                  {/* Review Button */}
                  {isCompleted && canReview && !reviewingOrderId && (
                    <div className="p-4 border-t border-slate-100">
                      <button
                        onClick={() => setReviewingOrderId(order.id)}
                        className="w-full py-2.5 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl font-semibold hover:from-yellow-500 hover:to-orange-500 transition-all shadow-md"
                      >
                        <i className="fas fa-star mr-2"></i>
                        Beri Ulasan
                      </button>
                    </div>
                  )}

                  {/* Review Form */}
                  {reviewingOrderId === order.id && (
                    <div className="p-4 border-t border-slate-100">
                      <ReviewForm
                        token={authToken}
                        orderId={order.id}
                        onSuccess={() => handleReviewSuccess(order.id)}
                        onCancel={() => setReviewingOrderId(null)}
                      />
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderStatusPage;
