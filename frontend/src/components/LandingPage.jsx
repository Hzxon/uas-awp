import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { layananApi, produkApi } from '../api';
import OutletSelector from './OutletSelector';

const heroFilters = [
  { label: "Lokasi penjemputan", placeholder: "Masukkan alamat", icon: "fa-location-dot" },
  { label: "Jadwal", placeholder: "Pilih tanggal", icon: "fa-calendar-days" },
  { label: "Jenis layanan", placeholder: "Cuci + setrika / Dry clean", icon: "fa-shirt" },
  { label: "Jumlah", placeholder: "Perkiraan kg", icon: "fa-scale-balanced" },
];

const perks = [
  { icon: "fa-truck-fast", title: "Antar jemput cepat", desc: "Kurir menjemput dalam 60 menit" },
  { icon: "fa-spray-can-sparkles", title: "Higienis & wangi", desc: "Standar hotel, deterjen premium" },
  { icon: "fa-clock", title: "Same day available", desc: "Selesai di hari yang sama untuk urgent" },
];

const HeroSection = ({ onScroll }) => (
  <section id="beranda" className="pt-6 pb-12">
    <div className="bg-white border border-slate-100 shadow-sm rounded-3xl p-6 md:p-10 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-10 h-60 w-60 bg-blue-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute -bottom-28 -left-10 h-60 w-60 bg-green-100 rounded-full blur-3xl opacity-50" />
      </div>
      <div className="grid md:grid-cols-2 gap-10 items-center relative">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <i className="fas fa-star text-amber-500" /> Laundry on-demand
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight">
            Laundry bersih, noda hilang, cepat beres.
          </h1>
          <p className="text-lg text-slate-600">
            Pilih layanan, atur jadwal jemput, dan nikmati pakaian rapi tanpa repot. Harga transparan, kurir terlatih, hasil wangi konsisten.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onScroll('layanan-lengkap')}
              className="px-5 py-3 rounded-full bg-slate-900 text-white font-semibold shadow-sm hover:bg-blue-700 transition"
            >
              Jadwalkan penjemputan
            </button>
            <button
              onClick={() => onScroll('produk-lengkap')}
              className="px-5 py-3 rounded-full bg-white border border-slate-200 text-slate-800 font-semibold hover:border-blue-300 transition"
            >
              Lihat kebutuhan laundry
            </button>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-2"><i className="fas fa-shield-halved text-green-500"></i> Garansi ulang gratis</div>
            <div className="flex items-center gap-2"><i className="fas fa-wallet text-blue-500"></i> Bayar aman & transparan</div>
            <div className="flex items-center gap-2"><i className="fas fa-heart text-rose-500"></i> 4.9/5 dari pelanggan</div>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-inner space-y-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-sm text-slate-500">Lanjutkan pencarian</p>
              <p className="font-semibold text-slate-900">Laundry rumahan • Kurir siap</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white border border-slate-100 shadow flex items-center justify-center">
              <i className="fas fa-route text-blue-500"></i>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {heroFilters.map((field) => (
              <div key={field.label} className="py-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-500">
                  <i className={`fas ${field.icon}`} />
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-wide text-slate-500">{field.label}</p>
                  <p className="text-sm font-semibold text-slate-900">{field.placeholder}</p>
                </div>
                <i className="fas fa-chevron-right text-slate-300"></i>
              </div>
            ))}
          </div>

          <button
            onClick={() => onScroll('layanan-lengkap')}
            className="w-full mt-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-full shadow-sm transition"
          >
            Mulai laundry
          </button>
        </div>
      </div>
    </div>
  </section>
);

const ValueProps = () => (
  <section className="py-6">
    <div className="grid md:grid-cols-3 gap-4">
      {perks.map((perk) => (
        <div key={perk.title} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex gap-3 items-start">
          <div className="h-12 w-12 rounded-xl bg-slate-900 text-white flex items-center justify-center text-lg shadow-sm">
            <i className={`fas ${perk.icon}`}></i>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900">{perk.title}</h3>
            <p className="text-sm text-slate-600">{perk.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const LandingPage = ({
  isLoggedIn, onLogout, onAddToCart, cartCount, cartItems, userName, openModal, userRole, selectedOutlet, setSelectedOutlet
}) => {
  const [activeSection, setActiveSection] = useState('beranda');

  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);

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

const getServiceEmoji = (name) => {
    if (!name) return "🧺";
    const lower = name.toLowerCase();
    if (lower.includes("cuci kering")) return "🧺";
    if (lower.includes("cuci + setrika") || (lower.includes("cuci") && lower.includes("setrika"))) {
      return "👕";
    }
    if (lower.includes("setrika saja")) return "🧼";
    if (lower.includes("dry cleaning")) return "💧";
    if (lower.includes("selimut") || lower.includes("bedcover")) return "🛏️";
    return "🧽";
  };

  const getProductEmoji = (name) => {
    if (!name) return "📦";
    const lower = name.toLowerCase();
    if (lower.includes("pewangi")) return "🌸";
    if (lower.includes("plastik")) return "🛍️";
    if (lower.includes("hanger")) return "🧥";
    if (lower.includes("laundry net") || lower.includes("jaring")) return "🧺";
    if (lower.includes("stain") || lower.includes("noda")) return "✨";
    return "📦";
  };

  const topServices = useMemo(() => services.slice(0, 8), [services]);
  const topProducts = useMemo(() => products.slice(0, 8), [products]);

  const renderServiceCard = (svc) => (
    <div
      key={svc.id}
      className="min-w-[240px] max-w-[320px] bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition hover:-translate-y-1 overflow-hidden flex flex-col"
    >
      {svc.image && (
        <div className="h-36 w-full bg-slate-100">
          <img src={svc.image} alt={svc.nama} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getServiceEmoji(svc.nama)}</span>
            <h3 className="font-semibold text-slate-900">{svc.nama}</h3>
          </div>
          <button className="text-slate-300 hover:text-rose-400 transition">
            <i className="far fa-heart"></i>
          </button>
        </div>
        <p className="text-sm text-slate-600">
          {svc.deskripsi || "Layanan laundry profesional untuk kebutuhan harian Anda."}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            <p className="text-2xl font-bold text-slate-900">Rp {svc.harga.toLocaleString('id-ID')}</p>
            <p className="text-xs text-slate-500">per kg</p>
          </div>
          <button
            className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
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
            Pilih
          </button>
        </div>
      </div>
    </div>
  );

const renderProductCard = (prod) => (
    <div
      key={prod.id}
      className="min-w-[240px] max-w-[320px] bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition hover:-translate-y-1 overflow-hidden flex flex-col"
    >
      {prod.image && (
        <div className="h-36 w-full bg-slate-100">
          <img src={prod.image} alt={prod.nama} className="h-full w-full object-cover" />
        </div>
      )}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{getProductEmoji(prod.nama)}</span>
            <h3 className="font-semibold text-slate-900">{prod.nama}</h3>
          </div>
          <button className="text-slate-300 hover:text-rose-400 transition">
            <i className="far fa-heart"></i>
          </button>
        </div>
        <p className="text-sm text-slate-600">
          {prod.deskripsi || "Pelengkap wangi & proteksi pakaian Anda."}
        </p>
        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            <p className="text-2xl font-bold text-slate-900">Rp {prod.harga.toLocaleString('id-ID')}</p>
            <p className="text-xs text-slate-500">per pcs</p>
          </div>
          <button
            className="px-4 py-2 rounded-full bg-slate-900 text-white text-sm font-semibold hover:bg-blue-700 transition shadow-sm"
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
            Tambah
          </button>
        </div>
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HeroSection onScroll={scrollToSection} />
        <OutletSelector selectedOutlet={selectedOutlet} onSelect={setSelectedOutlet} />
        <ValueProps />

        {/* LAYANAN */}
        <section id="layanan-lengkap" className="pt-12 pb-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Pilihan utama</p>
              <h2 className="text-2xl font-bold text-slate-900">Layanan favorit pelanggan</h2>
            </div>
            <button
              onClick={() => scrollToSection('layanan-lengkap')}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Lihat semua
            </button>
          </div>

          {topServices.length === 0 ? (
            <p className="text-slate-500">Memuat layanan terbaik...</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
              {topServices.map(renderServiceCard)}
            </div>
          )}
        </section>

        {/* PRODUK */}
        <section id="produk-lengkap" className="pt-6 pb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Tambahan wangi</p>
              <h2 className="text-2xl font-bold text-slate-900">Produk penunjang laundry</h2>
            </div>
            <button
              onClick={() => scrollToSection('produk-lengkap')}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Lihat semua
            </button>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-slate-500">Memuat produk pilihan...</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
              {topProducts.map(renderProductCard)}
            </div>
          )}
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
