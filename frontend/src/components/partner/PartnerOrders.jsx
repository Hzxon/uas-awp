import React, { useState, useEffect } from 'react';
import { partnerApi } from '../../api';

const PartnerOrders = ({ token }) => {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState({});
    const [statusFilter, setStatusFilter] = useState('');
    const [updatingOrder, setUpdatingOrder] = useState(null);

    const statusOptions = [
        { value: '', label: 'Semua Status' },
        { value: 'pending', label: 'Menunggu' },
        { value: 'confirmed', label: 'Dikonfirmasi' },
        { value: 'processing', label: 'Diproses' },
        { value: 'washing', label: 'Dicuci' },
        { value: 'drying', label: 'Dikeringkan' },
        { value: 'ironing', label: 'Disetrika' },
        { value: 'ready', label: 'Siap Antar' },
        { value: 'delivering', label: 'Diantar' },
        { value: 'completed', label: 'Selesai' },
    ];

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        confirmed: 'bg-blue-100 text-blue-700',
        processing: 'bg-indigo-100 text-indigo-700',
        washing: 'bg-cyan-100 text-cyan-700',
        drying: 'bg-orange-100 text-orange-700',
        ironing: 'bg-purple-100 text-purple-700',
        ready: 'bg-green-100 text-green-700',
        delivering: 'bg-teal-100 text-teal-700',
        completed: 'bg-gray-100 text-gray-700',
        cancelled: 'bg-red-100 text-red-700',
    };

    const fetchOrders = async (page = 1) => {
        setLoading(true);
        try {
            const params = { page, limit: 10 };
            if (statusFilter) params.status = statusFilter;

            const res = await partnerApi.getOrders(token, params);
            setOrders(res.orders || []);
            setPagination(res.pagination || {});
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [token, statusFilter]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        setUpdatingOrder(orderId);
        try {
            await partnerApi.updateOrderStatus(token, orderId, newStatus);
            // Refresh orders
            fetchOrders(pagination.page);
        } catch (err) {
            alert(err.message || 'Gagal memperbarui status');
        } finally {
            setUpdatingOrder(null);
        }
    };

    const getNextStatus = (currentStatus) => {
        const flow = ['pending', 'confirmed', 'processing', 'washing', 'drying', 'ironing', 'ready', 'delivering', 'completed'];
        const currentIndex = flow.indexOf(currentStatus);
        if (currentIndex >= 0 && currentIndex < flow.length - 1) {
            return flow[currentIndex + 1];
        }
        return null;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Kelola Pesanan</h1>
                    <p className="text-gray-600">Proses dan update status pesanan pelanggan</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-4 mb-6 flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Filter Status:</label>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500"
                >
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
                <button
                    onClick={() => fetchOrders(1)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                    <i className="fas fa-sync-alt mr-2"></i>Refresh
                </button>
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i>
                </div>
            ) : orders.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                    <i className="fas fa-inbox text-6xl text-gray-300 mb-4"></i>
                    <p className="text-gray-600">Tidak ada pesanan ditemukan</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => {
                        const nextStatus = getNextStatus(order.status);
                        const isUpdating = updatingOrder === order.id;

                        return (
                            <div key={order.id} className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-bold text-gray-900">Order #{order.id}</span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                                                {order.status?.toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            <i className="fas fa-user mr-2"></i>
                                            {order.customer_name || 'Customer'} • {order.customer_email}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            <i className="fas fa-clock mr-2"></i>
                                            {formatDate(order.created_at)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-gray-900">
                                            Rp {(order.total || 0).toLocaleString('id-ID')}
                                        </p>
                                        <p className="text-sm text-gray-500">{order.items?.length || 0} item</p>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-2">Item Pesanan:</p>
                                    <div className="space-y-1">
                                        {order.items?.map((item, idx) => (
                                            <div key={idx} className="flex justify-between text-sm">
                                                <span>{item.nama} x{item.qty}</span>
                                                <span className="text-gray-600">Rp {(item.subtotal || 0).toLocaleString('id-ID')}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                {order.delivery_address && (
                                    <div className="text-sm text-gray-600 mb-4">
                                        <i className="fas fa-map-marker-alt mr-2 text-pink-500"></i>
                                        {order.delivery_address}
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {nextStatus && order.status !== 'completed' && order.status !== 'cancelled' && (
                                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                                        <button
                                            onClick={() => handleStatusUpdate(order.id, nextStatus)}
                                            disabled={isUpdating}
                                            className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 disabled:opacity-50"
                                        >
                                            {isUpdating ? (
                                                <><i className="fas fa-spinner fa-spin mr-2"></i>Memproses...</>
                                            ) : (
                                                <><i className="fas fa-arrow-right mr-2"></i>Update ke: {nextStatus.toUpperCase()}</>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => fetchOrders(page)}
                            className={`w-10 h-10 rounded-lg font-semibold ${page === pagination.page
                                    ? 'bg-pink-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PartnerOrders;
