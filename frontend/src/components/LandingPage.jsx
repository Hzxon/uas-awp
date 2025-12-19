import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { layananApi, produkApi } from '../api';
import OutletSelector from './OutletSelector';

const perks = [
  { icon: "fa-truck-fast", title: "Antar jemput cepat", desc: "Kurir menjemput dalam 60 menit" },
  { icon: "fa-spray-can-sparkles", title: "Higienis & wangi", desc: "Standar hotel, deterjen premium" },
  { icon: "fa-clock", title: "Same day available", desc: "Selesai di hari yang sama untuk urgent" },
];

const HeroSection = ({ onScroll }) => (
  <section id="beranda" className="hero-section">
    <div className="hero-container">
      {/* Left Content - Big Bold Text */}
      <div className="hero-content">
        <h1 className="hero-title">
          No.1<br />
          Laundry<br />
          Express di<br />
          Indonesia
        </h1>
        <button
          onClick={() => onScroll('layanan-lengkap')}
          className="hero-cta"
        >
          Laundry Now
        </button>
      </div>

      {/* Right - Illustration with floating badges */}
      <div className="hero-illustration">
        {/* Main illustration - washing machine area */}
        <div className="hero-image-wrapper">
          <div className="washing-machine">
            <div className="machine-body">
              <div className="machine-door">
                <div className="door-ring"></div>
              </div>
            </div>
            <div className="machine-base"></div>
          </div>

          {/* Laundry basket */}
          <div className="laundry-basket">
            <i className="fas fa-basket-shopping text-4xl text-amber-600"></i>
          </div>
        </div>

        {/* Floating animated badges */}
        <div className="floating-badge badge-1">
          <div className="badge-icon">
            <i className="fas fa-truck-fast"></i>
          </div>
          <div className="badge-text">
            <span className="badge-title">Pickup dalam 30</span>
            <span className="badge-subtitle">menit</span>
          </div>
        </div>

        <div className="floating-badge badge-2">
          <div className="badge-icon">
            <i className="fas fa-tag"></i>
          </div>
          <div className="badge-text">
            <span className="badge-title">Harga Mulai Dari</span>
            <span className="badge-subtitle">IDR 8.000</span>
          </div>
        </div>

        <div className="floating-badge badge-3">
          <div className="badge-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="badge-text">
            <span className="badge-title">Express 3 Jam</span>
            <span className="badge-subtitle">Selesai</span>
          </div>
        </div>

        {/* Music notes decoration */}
        <div className="music-notes">
          <span className="note note-1">♪</span>
          <span className="note note-2">♫</span>
          <span className="note note-3">♪</span>
        </div>
      </div>
    </div>
  </section>
);

const ValueProps = () => (
  <section className="value-props-section">
    <div className="value-props-container">
      <div className="value-props-header">
        <h2 className="value-props-title">Kenapa Pilih <span>WashFast</span>?</h2>
      </div>

      <div className="value-props-grid">
        {perks.map((perk, index) => (
          <div
            key={perk.title}
            className="value-card"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="value-card-icon">
              <i className={`fas ${perk.icon}`}></i>
              <div className="icon-ring"></div>
            </div>
            <h3 className="value-card-title">{perk.title}</h3>
            <p className="value-card-desc">{perk.desc}</p>
            <div className="value-card-number">{String(index + 1).padStart(2, '0')}</div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const LandingPage = ({
  isLoggedIn, onLogout, onAddToCart, cartCount, cartItems, userName, openModal, userRole, selectedOutlet, setSelectedOutlet
}) => {
  const [activeSection, setActiveSection] = useState('beranda');

  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);

  // Slider states
  const [serviceSlide, setServiceSlide] = useState(0);
  const [productSlide, setProductSlide] = useState(0);
  const serviceSliderRef = useRef(null);
  const productSliderRef = useRef(null);

  // Items per view based on screen size
  const itemsPerView = 4;

  // Auto-slide for services
  useEffect(() => {
    if (services.length <= itemsPerView) return;
    const maxSlide = Math.ceil(services.length / itemsPerView) - 1;
    const interval = setInterval(() => {
      setServiceSlide(prev => prev >= maxSlide ? 0 : prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [services.length]);

  // Auto-slide for products
  useEffect(() => {
    if (products.length <= itemsPerView) return;
    const maxSlide = Math.ceil(products.length / itemsPerView) - 1;
    const interval = setInterval(() => {
      setProductSlide(prev => prev >= maxSlide ? 0 : prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [products.length]);

  const navigateSlider = useCallback((type, direction) => {
    const items = type === 'service' ? services : products;
    const setSlide = type === 'service' ? setServiceSlide : setProductSlide;
    const maxSlide = Math.ceil(items.length / itemsPerView) - 1;

    setSlide(prev => {
      if (direction === 'next') return prev >= maxSlide ? 0 : prev + 1;
      return prev <= 0 ? maxSlide : prev - 1;
    });
  }, [services, products]);

  // FUNGSI INTI UNTUK SCROLL: Dipanggil oleh Navbar
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      setActiveSection(id);
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const layananRes = await layananApi.list();
        setServices(Array.isArray(layananRes) ? layananRes : []);
      } catch (err) {
        console.error("❌ Gagal mengambil layanan:", err);
        setServices([]);
      }

      try {
        const produkRes = await produkApi.list();
        setProducts(Array.isArray(produkRes) ? produkRes : []);
      } catch (err) {
        console.error("❌ Gagal mengambil produk:", err);
        setProducts([]);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const sections = ['beranda', 'layanan-lengkap', 'produk-lengkap'];

    const observerOptions = {
      root: null,
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

  const getServiceIcon = (name) => {
    if (!name) return "fa-shirt";
    const lower = name.toLowerCase();
    if (lower.includes("cuci kering")) return "fa-droplet";
    if (lower.includes("cuci + setrika") || (lower.includes("cuci") && lower.includes("setrika"))) {
      return "fa-shirt";
    }
    if (lower.includes("setrika saja")) return "fa-fire";
    if (lower.includes("dry cleaning")) return "fa-spray-can-sparkles";
    if (lower.includes("selimut") || lower.includes("bedcover")) return "fa-bed";
    return "fa-washer";
  };

  const getProductIcon = (name) => {
    if (!name) return "fa-box";
    const lower = name.toLowerCase();
    if (lower.includes("pewangi")) return "fa-wind";
    if (lower.includes("plastik")) return "fa-bag-shopping";
    if (lower.includes("hanger")) return "fa-shirt-tank-top";
    if (lower.includes("laundry net") || lower.includes("jaring")) return "fa-basket-shopping";
    if (lower.includes("stain") || lower.includes("noda")) return "fa-sparkles";
    return "fa-box";
  };

  const topServices = useMemo(() => services.slice(0, 11), [services]);
  const topProducts = useMemo(() => products.slice(0, 11), [products]);

  const renderServiceCard = (svc) => (
    <div
      key={svc.id}
      className="group bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
      onClick={() =>
        onAddToCart({
          id: svc.id,
          name: svc.nama,
          price: svc.harga,
          type: 'Layanan',
          unit: 'kg',
        })
      }
    >
      {/* Icon */}
      <div className="w-20 h-20 mb-4 flex items-center justify-center">
        <i className={`fas ${getServiceIcon(svc.nama)} text-5xl text-primary-500`}></i>
      </div>

      {/* Name */}
      <h3 className="font-bold text-primary-600 text-sm leading-tight">{svc.nama}</h3>

      {/* Price badge */}
      <p className="text-xs text-gray-500 mt-2">Rp {svc.harga.toLocaleString('id-ID')}/kg</p>

      {/* Hover overlay with add button */}
      <div className="absolute inset-0 bg-primary-500/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <i className="fas fa-plus-circle text-4xl text-white mb-2"></i>
        <span className="text-white font-bold text-sm">Tambah Layanan</span>
      </div>
    </div>
  );

  const renderProductCard = (prod) => (
    <div
      key={prod.id}
      className="group bg-white rounded-2xl shadow-md border border-gray-100 p-6 flex flex-col items-center text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer relative overflow-hidden"
      onClick={() =>
        onAddToCart({
          id: prod.id,
          name: prod.nama,
          price: prod.harga,
          type: 'Produk',
          unit: 'pcs',
        })
      }
    >
      {/* Icon */}
      <div className="w-20 h-20 mb-4 flex items-center justify-center">
        <i className={`fas ${getProductIcon(prod.nama)} text-5xl text-purple-500`}></i>
      </div>

      {/* Name */}
      <h3 className="font-bold text-purple-600 text-sm leading-tight">{prod.nama}</h3>

      {/* Price badge */}
      <p className="text-xs text-gray-500 mt-2">Rp {prod.harga.toLocaleString('id-ID')}/pcs</p>

      {/* Hover overlay with add button */}
      <div className="absolute inset-0 bg-purple-500/90 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <i className="fas fa-cart-plus text-4xl text-white mb-2"></i>
        <span className="text-white font-bold text-sm">Tambah Produk</span>
      </div>
    </div>
  );

  return (
    <div className="bg-transparent min-h-screen">
      <Navbar
        cartCount={cartCount}
        cartItems={cartItems}
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
        onScroll={scrollToSection}
        activeSection={activeSection}
        userName={userName}
        openModal={openModal}
        userRole={userRole}
      />

      <main className="main-content">
        <HeroSection onScroll={scrollToSection} />

        {/* Simple Outlet Section */}
        <section className="outlet-section">
          <div className="outlet-section-inner">
            <OutletSelector selectedOutlet={selectedOutlet} onSelect={setSelectedOutlet} />
          </div>
        </section>

        <ValueProps />

        {/* LAYANAN - Slider */}
        <section id="layanan-lengkap" className="slider-section">
          <div className="slider-header">
            <div>
              <h2 className="slider-title text-teal">Layanan WashFast</h2>
            </div>
            <div className="slider-nav">
              <button className="slider-arrow" onClick={() => navigateSlider('service', 'prev')}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="slider-arrow" onClick={() => navigateSlider('service', 'next')}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          {topServices.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Memuat layanan terbaik...</p>
          ) : (
            <div className="slider-wrapper">
              <div
                className="slider-track"
                ref={serviceSliderRef}
                style={{ transform: `translateX(-${serviceSlide * 100}%)` }}
              >
                {topServices.map(renderServiceCard)}
              </div>

              {/* Dots indicator */}
              <div className="slider-dots">
                {Array.from({ length: Math.ceil(topServices.length / itemsPerView) }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`slider-dot ${idx === serviceSlide ? 'active' : ''}`}
                    onClick={() => setServiceSlide(idx)}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* PRODUK - Slider */}
        <section id="produk-lengkap" className="slider-section purple">
          <div className="slider-header">
            <div>
              <h2 className="slider-title text-purple">Produk Penunjang</h2>
            </div>
            <div className="slider-nav">
              <button className="slider-arrow purple" onClick={() => navigateSlider('product', 'prev')}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="slider-arrow purple" onClick={() => navigateSlider('product', 'next')}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Memuat produk pilihan...</p>
          ) : (
            <div className="slider-wrapper">
              <div
                className="slider-track"
                ref={productSliderRef}
                style={{ transform: `translateX(-${productSlide * 100}%)` }}
              >
                {topProducts.map(renderProductCard)}
              </div>

              {/* Dots indicator */}
              <div className="slider-dots">
                {Array.from({ length: Math.ceil(topProducts.length / itemsPerView) }).map((_, idx) => (
                  <button
                    key={idx}
                    className={`slider-dot purple ${idx === productSlide ? 'active' : ''}`}
                    onClick={() => setProductSlide(idx)}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
