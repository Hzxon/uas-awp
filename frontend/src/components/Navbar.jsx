import React from 'react';
import { Link } from 'react-router-dom';

// Menerima onNavigating (hanya ada di CartPage)
const Navbar = ({ cartCount, isLoggedIn, onLogout, onScroll, activeSection, userName, openModal, onNavigating }) => {
    
    // Fungsi handler untuk navigasi internal (smooth scroll)
    const handleNavClick = (id) => {
        // Jika onNavigating ada (berarti kita di CartPage), panggil onNavigating dulu
        if (onNavigating) { 
            onNavigating(id); // <-- Memicu modal konfirmasi keluar
            return;
        }

        // Jika tidak ada (berarti kita di LandingPage), lakukan scroll normal
        if (onScroll) {
            onScroll(id);
        }
    };

    // Fungsi untuk mendapatkan kelas highlight dinamis (hanya aktif di LandingPage)
    const getNavClass = (id) => {
        const baseClass = "border-b-2 px-3 py-2 font-medium bg-transparent border-0 focus:outline-none transition duration-150";
        // Di CartPage, kita tidak tahu activeSection, jadi highlightnya nonaktif
        if (id === activeSection && !onNavigating) { 
            return `${baseClass} border-blue-500 text-blue-600`;
        } else {
            return `${baseClass} border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700`;
        }
    };
    
    return (
        <header className="bg-white shadow-lg sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        {/* Logo selalu mengarah ke beranda dan memicu konfirmasi jika di CartPage */}
                        <button onClick={() => handleNavClick('beranda')} className="text-2xl font-extrabold text-blue-600">
                             Wash<span className="text-green-500">Fast</span>
                        </button>
                    </div>

                    {/* Navigasi Utama */}
                    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                        <button onClick={() => handleNavClick('beranda')} className={getNavClass('beranda')}>Beranda</button>
                        <button onClick={() => handleNavClick('layanan-lengkap')} className={getNavClass('layanan-lengkap')}>Layanan</button>
                        <button onClick={() => handleNavClick('produk-lengkap')} className={getNavClass('produk-lengkap')}>Produk</button>
                    </div>

                    {/* Cart dan User Action (Conditional Rendering) */}
                    <div className="flex items-center space-x-4">
                        <Link to="/cart" className="text-gray-500 hover:text-blue-600 relative p-2 transition duration-150">
                            {/* Ikon Keranjang */}
                            <i className="fas fa-shopping-basket text-xl"></i> 
                            {isLoggedIn && cartCount > 0 && (
                                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-ping-once">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                        
                        {/* Tombol Login/Keluar */}
                        {isLoggedIn ? (
                           <div className="flex items-center space-x-2">
                                <span className="hidden sm:inline text-sm font-semibold text-gray-700">
                                    Halo, {userName.split(' ')[0]}! 
                                </span>
                                
                                <Link to="/profile" className="text-gray-500 hover:text-blue-600 p-2 transition duration-150">
                                    <i className="fas fa-user-circle text-2xl"></i>
                                </Link>
                                <button onClick={onLogout} className="ml-2 text-sm bg-red-500 text-white py-1 px-3 rounded-lg hover:bg-red-600 transition duration-150 font-medium">Keluar</button>
                            </div>
                        ) : (
                            <button onClick={() => openModal('login')} className="ml-4 text-sm bg-blue-600 text-white py-1 px-3 rounded-lg hover:bg-blue-700 transition duration-150 font-medium">
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
