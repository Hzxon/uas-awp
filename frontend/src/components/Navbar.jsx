import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MiniCartPreview from './MiniCartPreview'; 

const Navbar = ({ cartCount, cartItems = [], isLoggedIn, onLogout, onScroll, activeSection, userName, openModal, onNavigating, userRole }) => {
    
    // State untuk mengontrol tampilan Mini Cart
    const [isCartHovered, setIsCartHovered] = useState(false);

      const isAdmin = userRole === "admin";  
      
    // Fungsi handler untuk navigasi internal (smooth scroll)
    const handleNavClick = (id) => {
        if (onNavigating) { 
            onNavigating(id);
            return;
        }

        if (onScroll) {
            onScroll(id);
        }
    };

    // Fungsi untuk mendapatkan kelas highlight dinamis
    const getNavClass = (id) => {
        const baseClass = "px-4 py-2 rounded-full text-sm font-semibold transition duration-150";
        if (id === activeSection && !onNavigating) {
            return `${baseClass} bg-white text-slate-900 shadow-sm border border-slate-200`;
        }
        return `${baseClass} text-slate-500 hover:text-slate-800`;
    };
    
    const CartIconContent = (
        <>
            <i className="fas fa-shopping-basket text-xl"></i> 
            {isLoggedIn && cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full animate-ping-once">
                    {cartCount}
                </span>
            )}
        </>
    );

    return (
        <header className="sticky top-0 z-50 bg-white/85 backdrop-blur border-b border-slate-100">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16 gap-4">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <button
                            onClick={() => handleNavClick('beranda')}
                            className="text-2xl font-extrabold text-slate-900 flex items-center gap-2"
                        >
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-green-400 text-white shadow-sm">
                                <i className="fas fa-water"></i>
                            </span>
                            <span className="text-2xl font-extrabold text-slate-900">WashFast</span>
                        </button>
                    </div>

                    {/* Navigasi Utama */}
                    <div className="hidden sm:flex items-center bg-slate-50 border border-slate-100 rounded-full px-2 py-1 shadow-inner">
                        <button onClick={() => handleNavClick('beranda')} className={getNavClass('beranda')}>Beranda</button>
                        <button onClick={() => handleNavClick('layanan-lengkap')} className={getNavClass('layanan-lengkap')}>Layanan</button>
                        <button onClick={() => handleNavClick('produk-lengkap')} className={getNavClass('produk-lengkap')}>Produk</button>
                    </div>

                    {/* Cart dan User Action (Conditional Rendering) */}
                    <div className="flex items-center space-x-4">
                        {isLoggedIn && isAdmin ? (
                            <Link
                                to="/admin"
                                className="text-sm px-4 py-2 rounded-full border border-slate-200 text-slate-800 hover:border-blue-400 hover:text-blue-600 transition font-semibold bg-white inline-flex items-center gap-2"
                            >
                                <span>Admin Panel</span>
                                <span className="text-[11px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                    Admin
                                </span>
                            </Link>
                        ) : (
                            <div
                                className="relative inline-block"
                                onMouseEnter={() => setIsCartHovered(true)}
                                onMouseLeave={() => setIsCartHovered(false)}
                            >
                                <Link to="/checkout/address" className="text-slate-600 hover:text-blue-600 relative p-2 rounded-full bg-white border border-slate-200 hover:border-blue-300 transition shadow-sm">
                                    {CartIconContent}
                                </Link>

                                {isCartHovered && (
                                    <MiniCartPreview
                                        cartCount={cartCount}
                                        items={cartItems}
                                        isLoggedIn={isLoggedIn}
                                        openLoginModal={openModal}
                                    />
                                )}
                            </div>
                        )}

                        {/* Status, Login/Keluar */}
                        {isLoggedIn ? (
                            <div className="flex items-center space-x-2">
                                <Link
                                    to="/orders/status"
                                    className="hidden sm:inline text-sm px-3 py-2 rounded-full border border-slate-200 text-slate-800 hover:border-blue-400 hover:text-blue-600 transition font-semibold bg-white"
                                >
                                    Status
                                </Link>
                                <span className="hidden sm:inline text-sm font-semibold text-gray-700">
                                    {userName ? userName.split(' ')[0] : 'User'}
                                </span>

                                <Link to="/profile" className="text-gray-500 hover:text-blue-600 p-2 transition duration-150">
                                    <i className="fas fa-user-circle text-2xl"></i>
                                </Link>
                                <button
                                    onClick={onLogout}
                                    className="text-sm bg-red-500 text-white py-1.5 px-4 rounded-full hover:bg-red-600 transition duration-150 font-semibold shadow-sm"
                                >
                                    Keluar
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => openModal('login')}
                                className="text-sm bg-slate-900 text-white py-1.5 px-4 rounded-full hover:bg-blue-600 transition duration-150 font-semibold shadow-sm"
                            >
                                Masuk
                            </button>
                        )}
                    </div>

                </div>
            </nav>
        </header>
    );
};

export default Navbar;
