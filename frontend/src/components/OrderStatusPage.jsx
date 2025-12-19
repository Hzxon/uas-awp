import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { orderApi, reviewApi } from "../api";
import ReviewForm from "./reviews/ReviewForm";

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
  const [reviewingOrderId, setReviewingOrderId] = useState(null);
  const [reviewableOrders, setReviewableOrders] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderApi.list(authToken);
        const list = Array.isArray(data.orders) ? data.orders : [];
        setOrders(list);

        // Prefetch timelines for up to 5 latest orders
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

          // Check if order can be reviewed (completed)
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
    return statusFlow.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Status pesanan</p>
            <h1 className="text-2xl font-bold text-gray-900">Riwayat & Timeline</h1>
            <p className="text-sm text-gray-600">Lacak status pickup, proses, hingga pengantaran.</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-800 focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
            >
              <option value="Semua">Semua status</option>
              <option value="pickup">Pickup</option>
              <option value="washing">Washing</option>
              <option value="delivering">Delivering</option>
              <option value="delivered">Delivered</option>
            </select>
            <button
              onClick={() => navigate("/")}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Beranda
            </button>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <i className="fas fa-spinner fa-spin text-4xl text-pink-500 mb-4"></i>
            <p className="text-gray-500">Memuat pesanan...</p>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center">
            <i className="fas fa-box-open text-6xl text-gray-300 mb-4"></i>
            <p className="text-gray-500">Belum ada pesanan atau tidak ada yang cocok dengan filter.</p>
          </div>
        )}

        {/* Orders List */}
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
              <div key={order.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-pink-500 to-rose-400 p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-80">Order #{order.id}</p>
                      <h3 className="text-xl font-bold">
                        {order.status ? statusLabel(order.status) : "Menunggu diproses"}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        Rp {Number(order.total_pembayaran || 0).toLocaleString("id-ID")}
                      </p>
                      <p className="text-sm opacity-80">
                        {order.tanggal ? new Date(order.tanggal).toLocaleDateString("id-ID") : "-"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Visual Timeline */}
                <div className="p-6">
                  <div className="relative">
                    {/* Progress Line */}
                    <div className="absolute top-5 left-5 right-5 h-1 bg-gray-200 rounded-full">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full transition-all duration-500"
                        style={{ width: `${(currentIndex / (statusFlow.length - 1)) * 100}%` }}
                      ></div>
                    </div>

                    {/* Status Steps */}
                    <div className="flex justify-between relative z-10">
                      {statusFlow.map((step, index) => {
                        const log = logMap[step];
                        const isDone = index <= currentIndex;
                        const isCurrent = index === currentIndex;

                        return (
                          <div key={step} className="flex flex-col items-center" style={{ width: '80px' }}>
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isDone
                                  ? 'bg-gradient-to-br from-pink-500 to-rose-400 text-white shadow-lg'
                                  : 'bg-gray-200 text-gray-400'
                                } ${isCurrent ? 'ring-4 ring-pink-200 scale-110' : ''}`}
                            >
                              <i className={`fas ${statusIcons[step]}`}></i>
                            </div>
                            <p className={`text-xs mt-2 text-center font-medium ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>
                              {statusLabel(step)}
                            </p>
                            {log?.created_at && (
                              <p className="text-[10px] text-gray-400 text-center mt-1">
                                {new Date(log.created_at).toLocaleDateString("id-ID")}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Timeline Log Details */}
                  {logs.length > 0 && (
                    <div className="mt-8 border-t border-gray-100 pt-4">
                      <p className="text-sm font-semibold text-gray-700 mb-3">
                        <i className="fas fa-history mr-2 text-pink-500"></i>
                        Detail Timeline
                      </p>
                      <div className="space-y-2">
                        {logs.map((log, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-sm">
                            <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                            <span className="font-medium text-gray-700">{statusLabel(log.status)}</span>
                            <span className="text-gray-400">•</span>
                            <span className="text-gray-500">
                              {new Date(log.created_at).toLocaleString("id-ID")}
                            </span>
                            {log.note && <span className="text-gray-400 italic">- {log.note}</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review Button */}
                  {isCompleted && canReview && !reviewingOrderId && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setReviewingOrderId(order.id)}
                        className="w-full py-3 bg-yellow-500 text-white rounded-xl font-bold hover:bg-yellow-600 transition-all"
                      >
                        <i className="fas fa-star mr-2"></i>
                        Beri Ulasan
                      </button>
                    </div>
                  )}

                  {/* Review Form Modal */}
                  {reviewingOrderId === order.id && (
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <ReviewForm
                        token={authToken}
                        orderId={order.id}
                        onSuccess={() => handleReviewSuccess(order.id)}
                        onCancel={() => setReviewingOrderId(null)}
                      />
                    </div>
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
