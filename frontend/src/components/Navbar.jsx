import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MiniCartPreview from './MiniCartPreview';

const Navbar = ({ cartCount, cartItems = [], isLoggedIn, onLogout, onScroll, activeSection, userName, openModal, onNavigating, userRole }) => {

    // State untuk mengontrol tampilan Mini Cart
    const [isCartHovered, setIsCartHovered] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark';
    });

    // State untuk hide/show navbar saat scroll
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // State untuk mobile menu
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isAdmin = userRole === "admin" || userRole === "superadmin";
    const navigate = useNavigate();
    const location = useLocation();

    // Effect untuk menerapkan dark mode
    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    // Effect untuk hide/show navbar saat scroll
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show navbar when at top of page
            if (currentScrollY < 50) {
                setIsVisible(true);
            }
            // Hide when scrolling down, show when scrolling up
            else if (currentScrollY > lastScrollY) {
                setIsVisible(false); // Scrolling down
            } else {
                setIsVisible(true); // Scrolling up
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // Fungsi handler untuk navigasi internal (smooth scroll)
    const handleNavClick = (id) => {
        if (onNavigating) {
            onNavigating(id);
            return;
        }

        if (onScroll) {
            onScroll(id);
        } else {
            // If not on main page, navigate to home with hash
            if (location.pathname !== '/') {
                navigate(`/#${id}`);
            } else {
                // If on main page but no onScroll, try to scroll directly
                const element = document.getElementById(id);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                }
            }
        }
    };

    // Fungsi untuk mendapatkan kelas highlight dinamis
    const getNavClass = (id) => {
        const baseClass = "nav-link";
        if (id === activeSection && !onNavigating) {
            return `${baseClass} nav-link-active`;
        }
        return baseClass;
    };

    const CartIconContent = (
        <>
            <i className="fas fa-shopping-basket"></i>
            {isLoggedIn && cartCount > 0 && (
                <span className="cart-badge">
                    {cartCount}
                </span>
            )}
        </>
    );

    return (
        <>
            {/* Floating Hamburger Button - Mobile Only */}
            <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="fixed top-4 left-4 z-[60] md:hidden w-12 h-12 bg-white rounded-xl shadow-lg border border-slate-200 flex items-center justify-center text-slate-700 hover:bg-slate-50"
                aria-label="Toggle menu"
            >
                <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
            </button>

            {/* Desktop Navbar - Hidden on Mobile */}
            <header className={`navbar hidden md:block ${isVisible ? 'navbar-visible' : 'navbar-hidden'}`}>
                <nav className="navbar-container">
                    {/* Logo */}
                    <div className="navbar-logo">
                        <button
                            onClick={() => handleNavClick('beranda')}
                            className="logo-link"
                        >
                            <img src="/logo.png" alt="WashFast Logo" className="logo-image" />
                            <span className="logo-text">WashFast</span>
                        </button>
                    </div>

                    {/* Hamburger Menu - Mobile Only */}
                    <button
                        className="mobile-menu-btn md:hidden"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'} text-xl`}></i>
                    </button>

                    {/* Navigasi Utama - Desktop */}
                    <div className="navbar-menu">
                        <button onClick={() => handleNavClick('beranda')} className={getNavClass('beranda')}>Beranda</button>
                        <button onClick={() => handleNavClick('layanan-lengkap')} className={getNavClass('layanan-lengkap')}>Layanan</button>
                        <button onClick={() => handleNavClick('produk-lengkap')} className={getNavClass('produk-lengkap')}>Produk</button>
                        <Link to="/search" className="nav-link">Cari Outlet</Link>
                        {isLoggedIn && !isAdmin && <Link to="/orders/status" className="nav-link">Status</Link>}
                        {!isAdmin && <Link to="/partner/register" className="nav-link">Mitra</Link>}
                    </div>

                    {/* Right Side Actions - Hidden on Mobile */}
                    <div className="navbar-actions hidden md:flex">
                        {/* Cart - show for non-admin logged in users */}
                        {isLoggedIn && !isAdmin && (
                            <div
                                className="cart-wrapper"
                                onMouseEnter={() => setIsCartHovered(true)}
                                onMouseLeave={() => setIsCartHovered(false)}
                            >
                                <Link to="/checkout/address" className="icon-btn">
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

                        {/* Admin Panel Link */}
                        {isLoggedIn && isAdmin && (
                            <Link to="/admin" className="admin-btn">
                                <i className="fas fa-cog"></i>
                                <span>Admin Panel</span>
                            </Link>
                        )}

                        {/* Theme Toggle */}
                        <button
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="icon-btn theme-toggle"
                            aria-label="Toggle theme"
                        >
                            {isDarkMode ? (
                                <i className="fas fa-sun"></i>
                            ) : (
                                <i className="fas fa-moon"></i>
                            )}
                        </button>

                        {/* Login/User Section */}
                        {isLoggedIn ? (
                            <div className="user-section">
                                <Link to="/profile" className="user-info">
                                    <i className="fas fa-user-circle"></i>
                                    <span className="user-name">{userName ? userName.split(' ')[0] : 'User'}</span>
                                </Link>
                                <button
                                    onClick={onLogout}
                                    className="logout-btn"
                                >
                                    <i className="fas fa-sign-out-alt"></i>
                                    <span>Keluar</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => openModal('login')}
                                className="login-btn"
                            >
                                <i className="fas fa-sign-in-alt"></i>
                                <span>Login</span>
                            </button>
                        )}
                    </div>
                </nav>
            </header>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[70] md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`
                fixed left-0 top-0 h-screen w-72 bg-gradient-to-b from-cyan-50/95 via-white/95 to-amber-50/95 backdrop-blur-lg z-[80] p-4
                transform transition-transform duration-300 ease-in-out md:hidden
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Close Button */}
                <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-300"
                >
                    <i className="fas fa-times"></i>
                </button>

                {/* User Info / Logo Section */}
                <div className="mt-10 mb-6">
                    {isLoggedIn ? (
                        <div className="rounded-2xl bg-white/60 backdrop-blur-sm border border-white/50 p-4 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-white text-lg font-bold shadow-lg">
                                    {(userName || "U").charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-slate-800">{userName || "User"}</p>
                                    <p className="text-xs text-slate-500">Selamat datang!</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <img src="/logo.png" alt="WashFast" className="w-10 h-10" />
                            <span className="text-lg font-bold text-slate-800">WashFast</span>
                        </div>
                    )}
                </div>

                {/* Navigation Menu */}
                <p className="text-xs uppercase tracking-wider text-slate-500 mb-3 px-2">Menu</p>
                <nav className="space-y-2 mb-6">
                    <button
                        onClick={() => { handleNavClick('beranda'); setIsMobileMenuOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white/60 transition-all"
                    >
                        <i className="fas fa-home text-cyan-500 w-5"></i>
                        Beranda
                    </button>
                    <button
                        onClick={() => { handleNavClick('layanan-lengkap'); setIsMobileMenuOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white/60 transition-all"
                    >
                        <i className="fas fa-concierge-bell text-purple-500 w-5"></i>
                        Layanan
                    </button>
                    <button
                        onClick={() => { handleNavClick('produk-lengkap'); setIsMobileMenuOpen(false); }}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white/60 transition-all"
                    >
                        <i className="fas fa-box text-emerald-500 w-5"></i>
                        Produk
                    </button>
                    <Link
                        to="/search"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white/60 transition-all"
                    >
                        <i className="fas fa-search text-orange-500 w-5"></i>
                        Cari Outlet
                    </Link>
                    {isLoggedIn && !isAdmin && (
                        <Link
                            to="/orders/status"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white/60 transition-all"
                        >
                            <i className="fas fa-clipboard-list text-blue-500 w-5"></i>
                            Status Pesanan
                        </Link>
                    )}
                    {!isAdmin && (
                        <Link
                            to="/partner/register"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white/60 transition-all"
                        >
                            <i className="fas fa-handshake text-pink-500 w-5"></i>
                            Daftar Mitra
                        </Link>
                    )}
                </nav>

                {/* Bottom Actions */}
                <div className="absolute bottom-4 left-4 right-4 space-y-2 border-t border-slate-200 pt-4">
                    {isLoggedIn && !isAdmin && (
                        <Link
                            to="/checkout/address"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white/60 transition-all"
                        >
                            <i className="fas fa-shopping-cart text-cyan-500 w-5"></i>
                            Keranjang
                            {cartCount > 0 && (
                                <span className="ml-auto bg-pink-500 text-white text-xs px-2 py-0.5 rounded-full">{cartCount}</span>
                            )}
                        </Link>
                    )}
                    {isLoggedIn && isAdmin && (
                        <Link
                            to="/admin"
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white/60 transition-all"
                        >
                            <i className="fas fa-cog text-purple-500 w-5"></i>
                            Admin Panel
                        </Link>
                    )}
                    {isLoggedIn ? (
                        <button
                            onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
                        >
                            <i className="fas fa-sign-out-alt w-5"></i>
                            Keluar
                        </button>
                    ) : (
                        <button
                            onClick={() => { openModal('login'); setIsMobileMenuOpen(false); }}
                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:opacity-90 transition-all"
                        >
                            <i className="fas fa-sign-in-alt w-5"></i>
                            Login / Daftar
                        </button>
                    )}
                </div>
            </aside>
        </>
    );
};

export default Navbar;
