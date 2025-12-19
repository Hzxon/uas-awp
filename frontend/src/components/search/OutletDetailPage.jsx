import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { outletApi } from '../../api';
import Navbar from '../Navbar';
import Footer from '../Footer';
import ReviewList from '../reviews/ReviewList';

const OutletDetailPage = ({ isLoggedIn, onLogout, onAddToCart, cartCount, cartItems, userName, openModal, userRole, token }) => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [outlet, setOutlet] = useState(null);
    const [services, setServices] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [activeTab, setActiveTab] = useState('services');

    useEffect(() => {
        const fetchOutletDetail = async () => {
            try {
                const res = await fetch(`http://localhost:5001/api/outlets/${id}`);
                const data = await res.json();

                if (data.success) {
                    setOutlet(data.outlet);
                    setServices(data.services || []);
                    setReviews(data.reviews || []);
                }
            } catch (err) {
                console.error('Failed to fetch outlet:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOutletDetail();
    }, [id]);

    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating || 0);
        for (let i = 0; i < 5; i++) {
            stars.push(
                <i key={i} className={`fas fa-star ${i < fullStars ? 'text-yellow-400' : 'text-gray-300'}`}></i>
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i>
            </div>
        );
    }

    if (!outlet) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar cartCount={cartCount} isLoggedIn={isLoggedIn} onLogout={onLogout} userName={userName} openModal={openModal} userRole={userRole} />
                <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                    <i className="fas fa-store-slash text-6xl text-gray-300 mb-4"></i>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Outlet Tidak Ditemukan</h2>
                    <Link to="/search" className="text-pink-500 hover:underline">Kembali ke pencarian</Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar cartCount={cartCount} cartItems={cartItems} isLoggedIn={isLoggedIn} onLogout={onLogout} userName={userName} openModal={openModal} userRole={userRole} />

            {/* Hero Section */}
            <div className="bg-gradient-to-br from-pink-500 via-pink-400 to-rose-400 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <Link to="/search" className="inline-flex items-center text-white/80 hover:text-white mb-6">
                        <i className="fas fa-arrow-left mr-2"></i>
                        Kembali ke pencarian
                    </Link>

                    <div className="flex flex-col md:flex-row items-start gap-6">
                        <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur">
                            <i className="fas fa-store text-4xl text-white"></i>
                        </div>

                        <div className="flex-1">
                            <h1 className="text-3xl font-bold mb-2">{outlet.nama}</h1>
                            <p className="text-white/80 mb-4">
                                <i className="fas fa-map-marker-alt mr-2"></i>
                                {outlet.alamat}
                            </p>

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    {renderStars(outlet.avg_rating || outlet.rating_avg)}
                                    <span className="font-bold">{(outlet.avg_rating || outlet.rating_avg || 0).toFixed(1)}</span>
                                    <span className="text-white/70">({outlet.review_count || outlet.rating_count || 0} ulasan)</span>
                                </div>

                                {outlet.jam_operasional && (
                                    <div className="px-3 py-1 bg-white/20 rounded-full">
                                        <i className="fas fa-clock mr-2"></i>
                                        {outlet.jam_operasional}
                                    </div>
                                )}

                                {outlet.phone && (
                                    <a href={`tel:${outlet.phone}`} className="px-3 py-1 bg-white/20 rounded-full hover:bg-white/30">
                                        <i className="fas fa-phone mr-2"></i>
                                        {outlet.phone}
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Tabs */}
                <div className="flex gap-4 border-b border-gray-200 mb-8">
                    <button
                        onClick={() => setActiveTab('services')}
                        className={`pb-4 px-2 font-semibold border-b-2 transition-all ${activeTab === 'services'
                                ? 'border-pink-500 text-pink-500'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <i className="fas fa-tshirt mr-2"></i>
                        Layanan
                    </button>
                    <button
                        onClick={() => setActiveTab('reviews')}
                        className={`pb-4 px-2 font-semibold border-b-2 transition-all ${activeTab === 'reviews'
                                ? 'border-pink-500 text-pink-500'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <i className="fas fa-star mr-2"></i>
                        Ulasan
                    </button>
                    <button
                        onClick={() => setActiveTab('info')}
                        className={`pb-4 px-2 font-semibold border-b-2 transition-all ${activeTab === 'info'
                                ? 'border-pink-500 text-pink-500'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <i className="fas fa-info-circle mr-2"></i>
                        Info
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'services' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {services.length === 0 ? (
                            <p className="col-span-full text-center text-gray-500 py-12">Belum ada layanan tersedia</p>
                        ) : (
                            services.map((service) => (
                                <div key={service.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center">
                                            <i className="fas fa-tshirt text-pink-500"></i>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{service.nama}</h3>
                                            <p className="text-2xl font-bold text-pink-500">
                                                Rp {service.harga?.toLocaleString('id-ID')}<span className="text-sm text-gray-500">/kg</span>
                                            </p>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-4">{service.deskripsi || 'Layanan laundry profesional'}</p>

                                    <button
                                        onClick={() => onAddToCart && onAddToCart({
                                            id: service.id,
                                            name: service.nama,
                                            price: service.harga,
                                            type: 'Layanan',
                                            unit: 'kg'
                                        })}
                                        className="w-full py-3 bg-pink-500 text-white rounded-xl font-bold hover:bg-pink-600 transition-all"
                                    >
                                        <i className="fas fa-plus mr-2"></i>Tambah
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <ReviewList outletId={id} token={token} />
                )}

                {activeTab === 'info' && (
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">Informasi Outlet</h3>

                        <div className="space-y-4">
                            {outlet.description && (
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Tentang</h4>
                                    <p className="text-gray-600">{outlet.description}</p>
                                </div>
                            )}

                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Alamat</h4>
                                <p className="text-gray-600">{outlet.alamat}</p>
                            </div>

                            {outlet.jam_operasional && (
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Jam Operasional</h4>
                                    <p className="text-gray-600">{outlet.jam_operasional}</p>
                                </div>
                            )}

                            {outlet.phone && (
                                <div>
                                    <h4 className="font-semibold text-gray-700 mb-2">Telepon</h4>
                                    <p className="text-gray-600">{outlet.phone}</p>
                                </div>
                            )}

                            <div>
                                <h4 className="font-semibold text-gray-700 mb-2">Biaya Pengiriman</h4>
                                <p className="text-gray-600">
                                    Rp {(outlet.min_biaya || 0).toLocaleString('id-ID')} + Rp {(outlet.biaya_per_km || 0).toLocaleString('id-ID')}/km
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default OutletDetailPage;
