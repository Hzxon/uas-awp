import React, { useState, useEffect } from 'react';
import { adminPartnerApi } from '../../api';

const AdminPartnerApproval = ({ token, userRole }) => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [processingId, setProcessingId] = useState(null);

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const res = await adminPartnerApi.list(token, statusFilter === 'all' ? null : statusFilter);
            setPartners(res.partners || []);
        } catch (err) {
            console.error('Failed to fetch partners:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPartners();
    }, [token, statusFilter]);

    const handleApprove = async (id) => {
        setProcessingId(id);
        try {
            await adminPartnerApi.approve(token, id);
            fetchPartners();
        } catch (err) {
            alert(err.message || 'Gagal menyetujui partner');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (id) => {
        const reason = prompt('Alasan penolakan (opsional):');
        setProcessingId(id);
        try {
            await adminPartnerApi.reject(token, id, reason || '');
            fetchPartners();
        } catch (err) {
            alert(err.message || 'Gagal menolak partner');
        } finally {
            setProcessingId(null);
        }
    };

    const handleSuspend = async (id) => {
        if (!confirm('Yakin ingin menangguhkan partner ini?')) return;
        setProcessingId(id);
        try {
            await adminPartnerApi.suspend(token, id);
            fetchPartners();
        } catch (err) {
            alert(err.message || 'Gagal menangguhkan partner');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReactivate = async (id) => {
        setProcessingId(id);
        try {
            await adminPartnerApi.reactivate(token, id);
            fetchPartners();
        } catch (err) {
            alert(err.message || 'Gagal mengaktifkan kembali partner');
        } finally {
            setProcessingId(null);
        }
    };

    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-700',
        approved: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
        suspended: 'bg-gray-100 text-gray-700',
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Persetujuan Partner</h2>
                    <p className="text-gray-600">Kelola aplikasi partner laundry</p>
                </div>
                <div className="flex gap-2">
                    {['pending', 'approved', 'rejected', 'suspended', 'all'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium text-sm capitalize ${statusFilter === status
                                ? 'bg-pink-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {status === 'all' ? 'Semua' : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Partner List */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i>
                </div>
            ) : partners.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-gray-200">
                    <i className="fas fa-store text-6xl text-gray-300 mb-4"></i>
                    <p className="text-gray-500">Tidak ada partner dengan status ini</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {partners.map((partner) => (
                        <div key={partner.id} className="bg-white rounded-xl border border-gray-200 p-5">
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                                        <i className="fas fa-store text-pink-500"></i>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">{partner.business_name}</h3>
                                        <p className="text-sm text-gray-600">{partner.user_name} • {partner.user_email}</p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            <i className="fas fa-calendar mr-1"></i>
                                            Daftar: {formatDate(partner.created_at)}
                                        </p>
                                        {partner.outlet_name && (
                                            <p className="text-sm text-gray-500">
                                                <i className="fas fa-map-marker-alt mr-1"></i>
                                                {partner.outlet_name} - {partner.outlet_address}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right">
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusColors[partner.status]}`}>
                                        {partner.status?.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Action Buttons - Only for SuperAdmin */}
                            {userRole === 'superadmin' && (
                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                    {partner.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(partner.id)}
                                                disabled={processingId === partner.id}
                                                className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium text-sm hover:bg-green-600 disabled:opacity-50"
                                            >
                                                {processingId === partner.id ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-check mr-1"></i>Setujui</>}
                                            </button>
                                            <button
                                                onClick={() => handleReject(partner.id)}
                                                disabled={processingId === partner.id}
                                                className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium text-sm hover:bg-red-600 disabled:opacity-50"
                                            >
                                                <i className="fas fa-times mr-1"></i>Tolak
                                            </button>
                                        </>
                                    )}
                                    {partner.status === 'approved' && (
                                        <button
                                            onClick={() => handleSuspend(partner.id)}
                                            disabled={processingId === partner.id}
                                            className="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium text-sm hover:bg-yellow-600 disabled:opacity-50"
                                        >
                                            <i className="fas fa-pause mr-1"></i>Tangguhkan
                                        </button>
                                    )}
                                    {partner.status === 'suspended' && (
                                        <button
                                            onClick={() => handleReactivate(partner.id)}
                                            disabled={processingId === partner.id}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 disabled:opacity-50"
                                        >
                                            <i className="fas fa-play mr-1"></i>Aktifkan Kembali
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminPartnerApproval;
