import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

    const isAdmin = userRole === "admin";

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
        <header className={`navbar ${isVisible ? 'navbar-visible' : 'navbar-hidden'}`}>
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

                {/* Navigasi Utama */}
                <div className="navbar-menu">
                    <button onClick={() => handleNavClick('beranda')} className={getNavClass('beranda')}>Beranda</button>
                    <button onClick={() => handleNavClick('layanan-lengkap')} className={getNavClass('layanan-lengkap')}>Layanan</button>
                    <button onClick={() => handleNavClick('produk-lengkap')} className={getNavClass('produk-lengkap')}>Produk</button>
                    <Link to="/search" className="nav-link">Cari Outlet</Link>
                    <Link to="/orders/status" className="nav-link">Status</Link>
                </div>

                {/* Right Side Actions */}
                <div className="navbar-actions">
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
    );
};

export default Navbar;
