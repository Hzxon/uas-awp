import React, { useState, useEffect } from 'react';
import { adminPartnerApi } from '../../api';

const AdminPartnerApproval = ({ token, userRole }) => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('pending');
    const [processingId, setProcessingId] = useState(null);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({ show: false, action: null, id: null, title: '', message: '' });

    // Create Partner Modal State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [adminUsers, setAdminUsers] = useState([]);
    const [createForm, setCreateForm] = useState({
        nama: '',
        email: '',
        password: '',
        business_name: '',
        business_license: '',
        outlet_name: '',
        outlet_address: '',
        outlet_phone: '',
        outlet_description: '',
        owner_id: '',
        bank_name: '',
        bank_account: '',
        bank_holder: ''
    });

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

    // Fetch admin users when modal opens
    useEffect(() => {
        const fetchAdminUsers = async () => {
            if (showCreateModal && userRole === 'superadmin') {
                try {
                    const res = await adminPartnerApi.listAdmins(token);
                    setAdminUsers(res.admins || []);
                } catch (err) {
                    console.error('Failed to fetch admin users:', err);
                }
            }
        };
        fetchAdminUsers();
    }, [showCreateModal, token, userRole]);

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
        setConfirmModal({
            show: true,
            action: 'reject',
            id: id,
            title: 'Tolak Partner',
            message: 'Yakin ingin menolak partner ini? Tindakan ini tidak dapat dibatalkan.'
        });
    };

    const handleSuspend = async (id) => {
        setConfirmModal({
            show: true,
            action: 'suspend',
            id: id,
            title: 'Tangguhkan Partner',
            message: 'Yakin ingin menangguhkan partner ini? Partner tidak akan bisa menerima pesanan baru.'
        });
    };

    const executeSuspend = async (id) => {
        setProcessingId(id);
        try {
            await adminPartnerApi.suspend(token, id);
            fetchPartners();
        } catch (err) {
            console.error('Suspend error:', err);
            alert(err.message || 'Gagal menangguhkan partner');
        } finally {
            setProcessingId(null);
        }
    };

    const handleConfirmAction = async () => {
        const { action, id } = confirmModal;
        setConfirmModal({ show: false, action: null, id: null, title: '', message: '' });

        if (action === 'suspend') {
            await executeSuspend(id);
        } else if (action === 'reject') {
            await executeReject(id);
        }
    };

    const executeReject = async (id) => {
        setProcessingId(id);
        try {
            await adminPartnerApi.reject(token, id, '');
            fetchPartners();
        } catch (err) {
            alert(err.message || 'Gagal menolak partner');
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

    // Create Partner Handlers
    const handleCreateFormChange = (e) => {
        const { name, value } = e.target;
        setCreateForm(prev => ({ ...prev, [name]: value }));
    };

    const handleCreatePartner = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await adminPartnerApi.create(token, createForm);
            alert('Partner berhasil dibuat!');
            setShowCreateModal(false);
            setCreateForm({
                nama: '',
                email: '',
                password: '',
                business_name: '',
                business_license: '',
                outlet_name: '',
                outlet_address: '',
                outlet_phone: '',
                outlet_description: '',
                owner_id: '',
                bank_name: '',
                bank_account: '',
                bank_holder: ''
            });
            setStatusFilter('approved');
            fetchPartners();
        } catch (err) {
            alert(err.message || 'Gagal membuat partner');
        } finally {
            setIsCreating(false);
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
                    {/* Create Partner Button - Only for SuperAdmin */}
                    {userRole === 'superadmin' && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium text-sm hover:bg-green-600 flex items-center gap-2"
                        >
                            <i className="fas fa-plus"></i>
                            Tambah Partner
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
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

            {/* Create Partner Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-gray-900">Tambah Partner Baru</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <i className="fas fa-times text-xl"></i>
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleCreatePartner} className="p-6 space-y-6">
                            {/* User Info Section */}
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <i className="fas fa-user text-purple-500"></i>
                                    Informasi Akun
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap *</label>
                                        <input
                                            type="text"
                                            name="nama"
                                            value={createForm.nama}
                                            onChange={handleCreateFormChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Nama pemilik partner"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={createForm.email}
                                            onChange={handleCreateFormChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="email@partner.com"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={createForm.password}
                                            onChange={handleCreateFormChange}
                                            required
                                            minLength={6}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Minimal 6 karakter"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Business Info Section */}
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <i className="fas fa-briefcase text-pink-500"></i>
                                    Informasi Bisnis
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bisnis *</label>
                                        <input
                                            type="text"
                                            name="business_name"
                                            value={createForm.business_name}
                                            onChange={handleCreateFormChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Nama bisnis laundry"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">No. Izin Usaha</label>
                                        <input
                                            type="text"
                                            name="business_license"
                                            value={createForm.business_license}
                                            onChange={handleCreateFormChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Opsional"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Outlet Info Section */}
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <i className="fas fa-store text-cyan-500"></i>
                                    Informasi Outlet
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Outlet *</label>
                                        <input
                                            type="text"
                                            name="outlet_name"
                                            value={createForm.outlet_name}
                                            onChange={handleCreateFormChange}
                                            required
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Nama outlet laundry"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon Outlet</label>
                                        <input
                                            type="tel"
                                            name="outlet_phone"
                                            value={createForm.outlet_phone}
                                            onChange={handleCreateFormChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="08xxxxxxxxxx"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Outlet *</label>
                                        <textarea
                                            name="outlet_address"
                                            value={createForm.outlet_address}
                                            onChange={handleCreateFormChange}
                                            required
                                            rows={2}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Alamat lengkap outlet"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Outlet</label>
                                        <textarea
                                            name="outlet_description"
                                            value={createForm.outlet_description}
                                            onChange={handleCreateFormChange}
                                            rows={2}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Deskripsi layanan outlet (opsional)"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            <i className="fas fa-user-shield text-indigo-500 mr-1"></i>
                                            Admin Pemilik Outlet
                                        </label>
                                        <select
                                            name="owner_id"
                                            value={createForm.owner_id}
                                            onChange={handleCreateFormChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        >
                                            <option value="">-- Pilih Admin (opsional) --</option>
                                            {adminUsers.map(admin => (
                                                <option key={admin.id} value={admin.id}>
                                                    {admin.nama} ({admin.email}) - {admin.role}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Admin yang dipilih akan dapat mengelola outlet ini dari panel mereka.</p>
                                    </div>
                                </div>
                            </div>

                            {/* Bank Info Section */}
                            <div>
                                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                    <i className="fas fa-university text-green-500"></i>
                                    Informasi Bank (Opsional)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bank</label>
                                        <input
                                            type="text"
                                            name="bank_name"
                                            value={createForm.bank_name}
                                            onChange={handleCreateFormChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="BCA, Mandiri, dll"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">No. Rekening</label>
                                        <input
                                            type="text"
                                            name="bank_account"
                                            value={createForm.bank_account}
                                            onChange={handleCreateFormChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Nomor rekening"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemilik Rekening</label>
                                        <input
                                            type="text"
                                            name="bank_holder"
                                            value={createForm.bank_holder}
                                            onChange={handleCreateFormChange}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            placeholder="Nama sesuai rekening"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isCreating}
                                    className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isCreating ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-check"></i>
                                            Buat Partner
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${confirmModal.action === 'reject' ? 'bg-red-100' : 'bg-yellow-100'
                                    }`}>
                                    <i className={`fas ${confirmModal.action === 'reject' ? 'fa-times text-red-500' : 'fa-pause text-yellow-500'
                                        } text-xl`}></i>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{confirmModal.title}</h3>
                            </div>
                            <p className="text-gray-600 mb-6">{confirmModal.message}</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmModal({ show: false, action: null, id: null, title: '', message: '' })}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleConfirmAction}
                                    className={`flex-1 px-4 py-3 text-white rounded-lg font-medium ${confirmModal.action === 'reject'
                                            ? 'bg-red-500 hover:bg-red-600'
                                            : 'bg-yellow-500 hover:bg-yellow-600'
                                        }`}
                                >
                                    Ya, Lanjutkan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPartnerApproval;

