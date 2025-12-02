import React, { useState, useEffect } from 'react';
import Navbar from './Navbar';
import FeaturedProducts from './FeaturedProducts';
import FeaturedServices from './FeaturedServices';
import Footer from './Footer';

const HeroSection = () => (
    <section id="beranda" className="mb-16">
        {/* Konten Hero Section tetap sama */}
        <div className="bg-blue-600 rounded-2xl p-8 lg:p-16 text-white shadow-xl flex flex-col lg:flex-row items-center justify-between">
            <div>
                <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">Cucian Bersih Maksimal, Tanpa Repot! 🧺</h1>
                <p className="text-lg mb-6">Nikmati Diskon 20% untuk pelanggan baru. Layanan Antar-Jemput Gratis!</p>
                <a href="#layanan-lengkap" className="inline-block bg-green-400 text-blue-900 font-bold py-3 px-8 rounded-full hover:bg-green-300 transition duration-300 transform hover:scale-105">
                    Pesan Sekarang
                </a>
            </div>
            <div className="mt-8 lg:mt-0 lg:w-1/3">
                 {/* ... (Konten visual/image placeholder) ... */}
            </div>
        </div>
    </section>
);

// Menerima prop BARU: initialScrollTarget
const LandingPage = ({ 
    isLoggedIn, onLogout, onAddToCart, cartCount, userName, openModal, 
    initialScrollTarget // <--- PROPS BARU DARI App.jsx
}) => {
    const [activeSection, setActiveSection] = useState('beranda');

    // FUNGSI INTI UNTUK SCROLL: Dipanggil oleh Navbar
    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            setActiveSection(id);
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // LOGIKA PERBAIKAN 1: Logika IntersectionObserver (tetap sama)
    useEffect(() => {
        const sections = ['beranda', 'layanan-lengkap', 'produk-lengkap'];
        
        const observerOptions = {
            root: null,
            // Mengatur rootMargin agar observer mendeteksi section yang sedang dilihat
            rootMargin: '0px 0px -50% 0px', 
            threshold: 0.1,
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveSection(entry.target.id);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        sections.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, []);


    // LOGIKA PERBAIKAN 2: Scroll Otomatis & Penyesuaian Active Section saat Navigasi Balik
    useEffect(() => {
        if (initialScrollTarget) {
            // Panggil fungsi scroll untuk memindahkan halaman
            scrollToSection(initialScrollTarget);
            // Secara eksplisit atur active section saat navigasi dari CartPage
            // Walaupun scrollToSection sudah mengaturnya, ini memastikan state langsung benar.
            setActiveSection(initialScrollTarget);
        }
    }, [initialScrollTarget]); // Efek hanya berjalan saat initialScrollTarget berubah


    return (
        <div className="bg-blue-50 min-h-screen"> 
            <Navbar 
                cartCount={cartCount} 
                isLoggedIn={isLoggedIn} 
                onLogout={onLogout}
                onScroll={scrollToSection} // <--- PROPS SMOOTH SCROLL DITERUSKAN DENGAN BENAR
                activeSection={activeSection} // <--- STATE ACTIVE SECTION YANG DIPERBAIKI
                userName={userName}
                openModal={openModal}
            />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <HeroSection />
                
                <FeaturedServices onAddToCart={onAddToCart} />
                
                {/* 1. Layanan Lengkap (Target Scroll) */}
                <section id="layanan-lengkap" className="pt-16 mb-16">
                    <h2 className="text-3xl font-bold text-gray-800 mb-8">🧺 Semua Layanan Kami</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-blue-500">
                            <h3 className="text-xl font-bold mb-2">Cuci Kiloan Reguler</h3>
                            <p className="text-gray-600">Cuci, setrika, lipat. Selesai dalam 3 hari.</p>
                            <p className="text-2xl font-bold text-green-600 mt-3">Rp 8.000/kg</p>
                            <button className="mt-4 text-blue-600 font-medium hover:text-blue-800" 
                                    onClick={() => onAddToCart({id: 'svc-reg', name: 'Cuci Kiloan Reguler', price: 8000, type: 'Layanan'})}>
                                + Keranjang
                            </button>
                        </div>
                        {/* ... Layanan lainnya ... */}
                    </div>
                </section>
                
                {/* 2. Produk Lengkap (Target Scroll) */}
                <section id="produk-lengkap" className="pt-16 mb-16">
                    {/* Placeholder untuk konten produk lengkap */}
                    <FeaturedProducts onAddToCart={onAddToCart} isFullSection={true} /> 
                </section>
                
            </main>
            
            <Footer />
        </div>
    );
};

export default LandingPage;