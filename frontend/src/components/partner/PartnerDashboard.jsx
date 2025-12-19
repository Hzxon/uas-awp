import React, { useState, useEffect } from 'react';
import { partnerApi } from '../../api';
import { Link } from 'react-router-dom';

const PartnerDashboard = ({ token }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dashboard, setDashboard] = useState(null);
    const [profile, setProfile] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [dashboardRes, profileRes] = await Promise.all([
                    partnerApi.getDashboard(token),
                    partnerApi.getProfile(token)
                ]);
                setDashboard(dashboardRes);
                setProfile(profileRes.profile);
            } catch (err) {
                setError(err.message || 'Gagal memuat data dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <i className="fas fa-spinner fa-spin text-4xl text-pink-500 mb-4"></i>
                    <p className="text-gray-600">Memuat dashboard...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                    <i className="fas fa-exclamation-circle text-4xl text-red-500 mb-4"></i>
                    <p className="text-red-700">{error}</p>
                </div>
            </div>
        );
    }

    // Pending approval state
    if (dashboard?.status === 'pending') {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-clock text-4xl text-yellow-600"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-yellow-800 mb-4">Menunggu Persetujuan</h2>
                    <p className="text-yellow-700 mb-6">
                        Aplikasi partner Anda sedang dalam proses review. Tim kami akan menghubungi Anda dalam 1-3 hari kerja.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-200 rounded-full text-yellow-800 font-medium">
                        <i className="fas fa-hourglass-half"></i>
                        Status: Pending Review
                    </div>
                </div>
            </div>
        );
    }

    // Rejected or suspended
    if (dashboard?.status === 'rejected' || dashboard?.status === 'suspended') {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-times text-4xl text-red-600"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-red-800 mb-4">
                        {dashboard.status === 'rejected' ? 'Aplikasi Ditolak' : 'Akun Dinonaktifkan'}
                    </h2>
                    <p className="text-red-700 mb-6">
                        {dashboard.status === 'rejected'
                            ? 'Maaf, aplikasi partner Anda tidak disetujui. Hubungi support untuk informasi lebih lanjut.'
                            : 'Akun partner Anda telah dinonaktifkan. Hubungi support untuk informasi lebih lanjut.'}
                    </p>
                </div>
            </div>
        );
    }

    const stats = dashboard?.stats || {};

    return (
        <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard Partner</h1>
                    <p className="text-gray-600">Selamat datang, {profile?.outlet_name || 'Partner'}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-full font-medium">
                        <i className="fas fa-check-circle"></i>
                        Aktif
                    </span>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                            <i className="fas fa-shopping-bag text-xl text-pink-600"></i>
                        </div>
                        <span className="text-sm text-gray-500">Hari ini</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.today?.orders || 0}</p>
                    <p className="text-sm text-gray-600">Pesanan</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <i className="fas fa-money-bill-wave text-xl text-green-600"></i>
                        </div>
                        <span className="text-sm text-gray-500">Hari ini</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">
                        Rp {(stats.today?.revenue || 0).toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-gray-600">Pendapatan</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            <i className="fas fa-clock text-xl text-orange-600"></i>
                        </div>
                        <span className="text-sm text-gray-500">Menunggu</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stats.pending_orders || 0}</p>
                    <p className="text-sm text-gray-600">Perlu Diproses</p>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                            <i className="fas fa-star text-xl text-yellow-600"></i>
                        </div>
                        <span className="text-sm text-gray-500">{stats.rating_count || 0} ulasan</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{(stats.rating || 0).toFixed(1)}</p>
                    <p className="text-sm text-gray-600">Rating</p>
                </div>
            </div>

            {/* Monthly Stats */}
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl p-6 mb-8 text-white">
                <h3 className="text-lg font-semibold mb-4 opacity-90">Statistik Bulan Ini</h3>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <p className="text-4xl font-bold">{stats.monthly?.orders || 0}</p>
                        <p className="text-sm opacity-80">Total Pesanan</p>
                    </div>
                    <div>
                        <p className="text-4xl font-bold">Rp {(stats.monthly?.revenue || 0).toLocaleString('id-ID')}</p>
                        <p className="text-sm opacity-80">Total Pendapatan</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to="/partner/orders" className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <i className="fas fa-list-alt text-2xl text-blue-600"></i>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Kelola Pesanan</h4>
                            <p className="text-sm text-gray-600">Lihat dan proses pesanan masuk</p>
                        </div>
                    </div>
                </Link>

                <Link to="/partner/settings" className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <i className="fas fa-cog text-2xl text-purple-600"></i>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Pengaturan</h4>
                            <p className="text-sm text-gray-600">Edit profil dan layanan</p>
                        </div>
                    </div>
                </Link>

                <Link to="/partner/reviews" className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <i className="fas fa-comments text-2xl text-yellow-600"></i>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900">Ulasan</h4>
                            <p className="text-sm text-gray-600">Lihat dan balas ulasan pelanggan</p>
                        </div>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default PartnerDashboard;
