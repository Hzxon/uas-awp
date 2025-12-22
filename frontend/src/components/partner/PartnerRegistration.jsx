import React, { useState, useEffect } from 'react';
import { partnerApi } from '../../api';

const PartnerRegistration = ({ token, onSuccess, isLoggedIn, onRequireAuth }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [hasExistingProfile, setHasExistingProfile] = useState(false);
    const [existingProfileStatus, setExistingProfileStatus] = useState('');
    const [checkingProfile, setCheckingProfile] = useState(true);

    const [formData, setFormData] = useState({
        business_name: '',
        business_license: '',
        outlet_name: '',
        outlet_address: '',
        outlet_phone: '',
        outlet_description: '',
        bank_name: '',
        bank_account: '',
        bank_holder: '',
        lat: 0,
        lng: 0
    });

    // Check if user already has a partner profile
    useEffect(() => {
        const checkExistingProfile = async () => {
            if (!isLoggedIn || !token) {
                setCheckingProfile(false);
                return;
            }

            try {
                const result = await partnerApi.getProfile(token);
                if (result.profile) {
                    setHasExistingProfile(true);
                    setExistingProfileStatus(result.profile.status);
                }
            } catch (err) {
                // No profile exists - this is expected, allow registration
            } finally {
                setCheckingProfile(false);
            }
        };

        checkExistingProfile();
    }, [isLoggedIn, token]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.business_name || !formData.outlet_name || !formData.outlet_address) {
                setError('Nama bisnis, nama outlet, dan alamat wajib diisi');
                return;
            }
        }
        setError('');
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await partnerApi.register(token, formData);
            setSuccess(true);
            if (onSuccess) onSuccess();
        } catch (err) {
            setError(err.message || 'Gagal mendaftar sebagai partner');
        } finally {
            setLoading(false);
        }
    };

    // Loading state while checking profile
    if (checkingProfile && isLoggedIn) {
        return (
            <div className="max-w-2xl mx-auto p-8">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <i className="fas fa-spinner fa-spin text-4xl text-pink-500 mb-4"></i>
                    <p className="text-gray-600">Memeriksa profil partner...</p>
                </div>
            </div>
        );
    }

    // User already has a partner profile
    if (hasExistingProfile) {
        return (
            <div className="max-w-2xl mx-auto p-8">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                        <i className="fas fa-store text-4xl text-white"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Anda Sudah Terdaftar sebagai Mitra</h2>

                    {existingProfileStatus === 'pending' && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
                            <p className="text-yellow-700">
                                <i className="fas fa-clock mr-2"></i>
                                Status pendaftaran Anda: <strong>Menunggu Persetujuan</strong>
                            </p>
                            <p className="text-sm text-yellow-600 mt-2">
                                Tim kami sedang meninjau aplikasi Anda. Kami akan menghubungi Anda dalam 1-3 hari kerja.
                            </p>
                        </div>
                    )}

                    {existingProfileStatus === 'approved' && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                            <p className="text-green-700">
                                <i className="fas fa-check-circle mr-2"></i>
                                Status: <strong>Disetujui</strong>
                            </p>
                            <p className="text-sm text-green-600 mt-2">
                                Selamat! Anda sudah bisa mengelola outlet Anda.
                            </p>
                        </div>
                    )}

                    {existingProfileStatus === 'rejected' && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                            <p className="text-red-700">
                                <i className="fas fa-times-circle mr-2"></i>
                                Status: <strong>Ditolak</strong>
                            </p>
                            <p className="text-sm text-red-600 mt-2">
                                Mohon maaf, pendaftaran Anda ditolak. Silakan hubungi tim kami untuk informasi lebih lanjut.
                            </p>
                        </div>
                    )}

                    {existingProfileStatus === 'suspended' && (
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
                            <p className="text-gray-700">
                                <i className="fas fa-pause-circle mr-2"></i>
                                Status: <strong>Ditangguhkan</strong>
                            </p>
                            <p className="text-sm text-gray-600 mt-2">
                                Akun partner Anda sedang ditangguhkan. Silakan hubungi admin.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-4 justify-center">
                        {existingProfileStatus === 'approved' && (
                            <a href="/partner/dashboard" className="px-6 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition">
                                <i className="fas fa-tachometer-alt mr-2"></i>
                                Dashboard Partner
                            </a>
                        )}
                        <a href="/" className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition">
                            Kembali ke Beranda
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Show login prompt for guests
    if (!isLoggedIn) {
        return (
            <div className="max-w-2xl mx-auto p-8">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                        <i className="fas fa-store text-4xl text-white"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Daftar Sebagai Mitra</h2>
                    <p className="text-gray-600 mb-6">
                        Gabung dengan WashFast dan kembangkan bisnis laundry Anda! Nikmati kemudahan mengelola outlet dan menjangkau lebih banyak pelanggan.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-pink-50 rounded-xl p-4">
                            <i className="fas fa-chart-line text-2xl text-pink-500 mb-2"></i>
                            <p className="text-sm font-semibold text-gray-700">Jangkau Lebih Banyak</p>
                        </div>
                        <div className="bg-pink-50 rounded-xl p-4">
                            <i className="fas fa-mobile-alt text-2xl text-pink-500 mb-2"></i>
                            <p className="text-sm font-semibold text-gray-700">Panel Admin Mudah</p>
                        </div>
                        <div className="bg-pink-50 rounded-xl p-4">
                            <i className="fas fa-hand-holding-usd text-2xl text-pink-500 mb-2"></i>
                            <p className="text-sm font-semibold text-gray-700">Pembayaran Aman</p>
                        </div>
                    </div>

                    <button
                        onClick={() => onRequireAuth && onRequireAuth()}
                        className="px-8 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition"
                    >
                        <i className="fas fa-sign-in-alt mr-2"></i>
                        Login untuk Mendaftar
                    </button>
                    <p className="text-sm text-gray-500 mt-4">
                        Belum punya akun? Login akan membuka form registrasi.
                    </p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="max-w-2xl mx-auto p-8">
                <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                        <i className="fas fa-check text-4xl text-green-600"></i>
                    </div>
                    <h2 className="text-2xl font-bold text-green-800 mb-4">Pendaftaran Berhasil!</h2>
                    <p className="text-green-700 mb-6">
                        Terima kasih telah mendaftar sebagai partner WashFast. Tim kami akan meninjau aplikasi Anda dan menghubungi Anda dalam 1-3 hari kerja.
                    </p>
                    <a href="/" className="inline-block px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700">
                        Kembali ke Beranda
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Daftar Sebagai Partner</h1>
                    <p className="text-gray-600">Bergabung dengan WashFast dan kembangkan bisnis laundry Anda</p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center mb-8">
                    {[1, 2, 3].map((s) => (
                        <React.Fragment key={s}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= s ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-500'
                                }`}>
                                {s}
                            </div>
                            {s < 3 && <div className={`w-16 h-1 ${step > s ? 'bg-pink-500' : 'bg-gray-200'}`}></div>}
                        </React.Fragment>
                    ))}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
                        <i className="fas fa-exclamation-circle"></i>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Step 1: Business Info */}
                    {step === 1 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                <i className="fas fa-store mr-2 text-pink-500"></i>
                                Informasi Bisnis
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Bisnis / Brand *</label>
                                <input
                                    type="text"
                                    name="business_name"
                                    value={formData.business_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="Contoh: Laundry Express Sejahtera"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Outlet *</label>
                                <input
                                    type="text"
                                    name="outlet_name"
                                    value={formData.outlet_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="Nama yang akan tampil ke pelanggan"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Alamat Outlet *</label>
                                <textarea
                                    name="outlet_address"
                                    value={formData.outlet_address}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="Alamat lengkap outlet"
                                    rows={3}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">No. Telepon Outlet</label>
                                <input
                                    type="tel"
                                    name="outlet_phone"
                                    value={formData.outlet_phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="08xxxxxxxxxx"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi Outlet</label>
                                <textarea
                                    name="outlet_description"
                                    value={formData.outlet_description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="Ceritakan tentang layanan dan keunggulan outlet Anda"
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Documents */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                <i className="fas fa-file-alt mr-2 text-pink-500"></i>
                                Dokumen & Legalitas
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">No. Izin Usaha (Opsional)</label>
                                <input
                                    type="text"
                                    name="business_license"
                                    value={formData.business_license}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="NIB / SIUP / Izin lainnya"
                                />
                                <p className="text-sm text-gray-500 mt-1">Opsional, tapi akan mempercepat proses verifikasi</p>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <h4 className="font-semibold text-blue-800 mb-2">
                                    <i className="fas fa-info-circle mr-2"></i>
                                    Catatan
                                </h4>
                                <p className="text-sm text-blue-700">
                                    Anda dapat melengkapi dokumen legalitas nanti setelah pendaftaran disetujui. Untuk saat ini, Anda bisa melanjutkan tanpa mengisi nomor izin usaha.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Bank Info */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                <i className="fas fa-university mr-2 text-pink-500"></i>
                                Informasi Rekening Bank
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Info rekening bank diperlukan untuk pencairan hasil penjualan Anda.
                            </p>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Bank</label>
                                <select
                                    name="bank_name"
                                    value={formData.bank_name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                >
                                    <option value="">Pilih Bank</option>
                                    <option value="BCA">BCA</option>
                                    <option value="BNI">BNI</option>
                                    <option value="BRI">BRI</option>
                                    <option value="Mandiri">Mandiri</option>
                                    <option value="CIMB Niaga">CIMB Niaga</option>
                                    <option value="Permata">Permata</option>
                                    <option value="Danamon">Danamon</option>
                                    <option value="Other">Lainnya</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nomor Rekening</label>
                                <input
                                    type="text"
                                    name="bank_account"
                                    value={formData.bank_account}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="Nomor rekening"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nama Pemilik Rekening</label>
                                <input
                                    type="text"
                                    name="bank_holder"
                                    value={formData.bank_holder}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                    placeholder="Sesuai buku tabungan"
                                />
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <h4 className="font-semibold text-yellow-800 mb-2">
                                    <i className="fas fa-exclamation-triangle mr-2"></i>
                                    Perhatian
                                </h4>
                                <p className="text-sm text-yellow-700">
                                    Pastikan informasi rekening bank benar. Kesalahan data rekening dapat menyebabkan kegagalan pencairan dana.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                        {step > 1 ? (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
                            >
                                <i className="fas fa-arrow-left mr-2"></i>
                                Kembali
                            </button>
                        ) : (
                            <a
                                href="/"
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 flex items-center"
                            >
                                <i className="fas fa-home mr-2"></i>
                                Beranda
                            </a>
                        )}

                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="px-6 py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600"
                            >
                                Lanjutkan
                                <i className="fas fa-arrow-right ml-2"></i>
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 disabled:opacity-50"
                            >
                                {loading ? (
                                    <><i className="fas fa-spinner fa-spin mr-2"></i> Mendaftar...</>
                                ) : (
                                    <><i className="fas fa-check mr-2"></i> Daftar Sekarang</>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PartnerRegistration;
