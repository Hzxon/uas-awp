import React, { useState, useEffect } from 'react';

const AdminAnalytics = ({ token }) => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [activities, setActivities] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch overview
                const overviewRes = await fetch('http://localhost:5001/api/admin/analytics/overview', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const overviewData = await overviewRes.json();
                if (overviewData.success) {
                    setStats(overviewData.stats);
                }

                // Fetch activities
                const activitiesRes = await fetch('http://localhost:5001/api/admin/analytics/activities', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const activitiesData = await activitiesRes.json();
                if (activitiesData.success) {
                    setActivities(activitiesData.activities);
                }
            } catch (err) {
                console.error('Failed to fetch analytics:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    const formatCurrency = (value) => {
        return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-pink-500 to-rose-400 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <i className="fas fa-users text-2xl opacity-80"></i>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Total</span>
                    </div>
                    <p className="text-3xl font-bold">{stats?.users || 0}</p>
                    <p className="text-sm opacity-80">Pengguna</p>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <i className="fas fa-store text-2xl opacity-80"></i>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">{stats?.pendingPartners || 0} pending</span>
                    </div>
                    <p className="text-3xl font-bold">{stats?.partners || 0}</p>
                    <p className="text-sm opacity-80">Partner Aktif</p>
                </div>

                <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <i className="fas fa-shopping-bag text-2xl opacity-80"></i>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Hari ini: {stats?.todayOrders || 0}</span>
                    </div>
                    <p className="text-3xl font-bold">{stats?.totalOrders || 0}</p>
                    <p className="text-sm opacity-80">Total Pesanan</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between mb-2">
                        <i className="fas fa-money-bill-wave text-2xl opacity-80"></i>
                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Hari ini</span>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(stats?.todayRevenue)}</p>
                    <p className="text-sm opacity-80">Revenue Hari Ini</p>
                </div>
            </div>

            {/* Total Revenue Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Total Revenue</h3>
                    <span className="text-3xl font-bold text-green-600">{formatCurrency(stats?.totalRevenue)}</span>
                </div>

                {/* Monthly Chart Placeholder */}
                {stats?.monthlyRevenue && stats.monthlyRevenue.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 mb-4">Revenue 6 Bulan Terakhir</p>
                        <div className="flex items-end gap-2 h-32">
                            {stats.monthlyRevenue.map((month, idx) => {
                                const maxRevenue = Math.max(...stats.monthlyRevenue.map(m => m.revenue));
                                const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
                                return (
                                    <div key={idx} className="flex-1 flex flex-col items-center">
                                        <div
                                            className="w-full bg-gradient-to-t from-pink-500 to-pink-400 rounded-t"
                                            style={{ height: `${Math.max(height, 5)}%` }}
                                        ></div>
                                        <p className="text-xs text-gray-500 mt-2">{month.month?.split('-')[1]}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Outlets */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">
                        <i className="fas fa-trophy text-yellow-500 mr-2"></i>
                        Top Outlet
                    </h3>
                    {stats?.topOutlets?.length > 0 ? (
                        <div className="space-y-3">
                            {stats.topOutlets.map((outlet, idx) => (
                                <div key={outlet.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-500 text-white' :
                                                idx === 1 ? 'bg-gray-300 text-gray-700' :
                                                    idx === 2 ? 'bg-orange-400 text-white' :
                                                        'bg-gray-100 text-gray-600'
                                            }`}>{idx + 1}</span>
                                        <span className="font-medium text-gray-900">{outlet.nama}</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">{outlet.order_count} orders</p>
                                        <p className="text-xs text-gray-500">{formatCurrency(outlet.total_revenue)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">Belum ada data outlet</p>
                    )}
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-bold text-gray-900 mb-4">
                        <i className="fas fa-clock text-blue-500 mr-2"></i>
                        Pesanan Terbaru
                    </h3>
                    {activities?.recentOrders?.length > 0 ? (
                        <div className="space-y-3">
                            {activities.recentOrders.slice(0, 5).map((order) => (
                                <div key={order.id} className="flex items-center justify-between text-sm">
                                    <div>
                                        <p className="font-medium text-gray-900">#{order.id} - {order.customer_name || 'Customer'}</p>
                                        <p className="text-xs text-gray-500">{formatDate(order.tanggal)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">{formatCurrency(order.total_pembayaran)}</p>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{order.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-4">Belum ada pesanan</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
