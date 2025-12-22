import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../Navbar';
import Footer from '../Footer';

const SearchPage = (props) => {
    const {
        isLoggedIn = false,
        onLogout = () => { },
        cartCount = 0,
        cartItems = [],
        userName = '',
        openModal = () => { },
        userRole = ''
    } = props || {};

    const [searchParams, setSearchParams] = useSearchParams();
    const [outlets, setOutlets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState(searchParams?.get('q') || '');
    const [minRating, setMinRating] = useState(searchParams?.get('rating') || '');
    const [sortBy, setSortBy] = useState(searchParams?.get('sort') || '');
    const [isDarkMode, setIsDarkMode] = useState(() =>
        document.documentElement.classList.contains('dark')
    );

    // Listen for dark mode changes
    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        const fetchOutlets = async () => {
            try {
                const params = new URLSearchParams();
                if (query) params.set('q', query);
                if (minRating) params.set('min_rating', minRating);
                if (sortBy) params.set('sort_by', sortBy);

                const queryString = params.toString();
                const res = await fetch(`http://localhost:5001/api/outlets/search${queryString ? `?${queryString}` : ''}`);
                const data = await res.json();

                if (data.success) {
                    setOutlets(data.outlets || []);
                }
            } catch (err) {
                console.error('Search failed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOutlets();
    }, [query, minRating, sortBy]);

    const handleSearch = (e) => {
        e.preventDefault();
        const newParams = {};
        if (query) newParams.q = query;
        if (minRating) newParams.rating = minRating;
        if (sortBy) newParams.sort = sortBy;
        setSearchParams(newParams);
    };

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating || 0);
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                    <i key={i} className={`fas fa-star text-sm ${i <= fullStars ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen flex flex-col" style={{
            background: isDarkMode
                ? 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)'
                : 'linear-gradient(180deg, #e0f7fa 0%, #fffde7 40%, #fff59d 70%, #ffe082 100%)'
        }}>
            <Navbar
                cartCount={cartCount}
                cartItems={cartItems}
                isLoggedIn={isLoggedIn}
                onLogout={onLogout}
                userName={userName}
                openModal={openModal}
                userRole={userRole}
            />

            {/* Main content with padding-top to avoid navbar overlap */}
            <main className="flex-1 pt-24 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold mb-4" style={{ color: isDarkMode ? '#ffffff' : '#111827' }}>Cari Laundry Terdekat</h1>

                        <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
                            <div className="flex-1 min-w-[280px]">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="w-full px-5 py-4 pl-12 border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent shadow-sm"
                                        style={{
                                            backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                            borderColor: isDarkMode ? '#475569' : '#e5e7eb',
                                            color: isDarkMode ? '#ffffff' : '#111827'
                                        }}
                                        placeholder="Cari nama laundry atau lokasi..."
                                    />
                                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                </div>
                            </div>

                            <select
                                value={minRating}
                                onChange={(e) => setMinRating(e.target.value)}
                                className="px-4 py-4 border rounded-xl focus:ring-2 focus:ring-pink-500 shadow-sm"
                                style={{
                                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                    borderColor: isDarkMode ? '#475569' : '#e5e7eb',
                                    color: isDarkMode ? '#ffffff' : '#111827'
                                }}
                            >
                                <option value="">Semua Rating</option>
                                <option value="4">⭐ 4+ ke atas</option>
                                <option value="3">⭐ 3+ ke atas</option>
                            </select>

                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-4 border rounded-xl focus:ring-2 focus:ring-pink-500 shadow-sm"
                                style={{
                                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                                    borderColor: isDarkMode ? '#475569' : '#e5e7eb',
                                    color: isDarkMode ? '#ffffff' : '#111827'
                                }}
                            >
                                <option value="">Urutkan</option>
                                <option value="rating">Rating Tertinggi</option>
                                <option value="name">Nama A-Z</option>
                                <option value="newest">Terbaru</option>
                            </select>

                            <button
                                type="submit"
                                className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/30 transition-all"
                            >
                                <i className="fas fa-search mr-2"></i>Cari
                            </button>
                        </form>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i>
                        </div>
                    ) : outlets.length === 0 ? (
                        <div className="text-center py-20">
                            <i className="fas fa-store-slash text-6xl text-gray-300 mb-4"></i>
                            <p className="text-gray-600 text-lg">Tidak ada laundry ditemukan</p>
                            <p className="text-gray-500">Coba gunakan kata kunci lain</p>
                        </div>
                    ) : (
                        <div>
                            <p className="mb-6" style={{ color: isDarkMode ? '#d1d5db' : '#4b5563' }}>{outlets.length} laundry ditemukan</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {outlets.map((outlet) => (
                                    <Link
                                        key={outlet.id}
                                        to={`/outlet/${outlet.id}`}
                                        className="rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100"
                                        style={{ backgroundColor: '#ffffff' }}
                                    >
                                        <div className="h-32 bg-gradient-to-br from-pink-500 to-rose-400 flex items-center justify-center">
                                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
                                                <i className="fas fa-store text-3xl text-white"></i>
                                            </div>
                                        </div>

                                        <div className="p-5">
                                            <h3 className="font-bold text-lg mb-2" style={{ color: '#111827' }}>{outlet.nama}</h3>
                                            <p className="text-sm mb-3 line-clamp-2" style={{ color: '#6b7280' }}>
                                                <i className="fas fa-map-marker-alt mr-2 text-pink-500"></i>
                                                {outlet.alamat}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-1">
                                                    {renderStars(outlet.rating_avg)}
                                                    <span className="ml-2 text-sm" style={{ color: '#4b5563' }}>
                                                        {Number(outlet.rating_avg || 0).toFixed(1)} ({outlet.rating_count || 0})
                                                    </span>
                                                </div>
                                            </div>

                                            {outlet.jam_operasional && (
                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                    <p className="text-xs" style={{ color: '#6b7280' }}>
                                                        <i className="fas fa-clock mr-1"></i>
                                                        {outlet.jam_operasional}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default SearchPage;

