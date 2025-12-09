import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-slate-200 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-green-400 text-white shadow-sm">
                                <i className="fas fa-water"></i>
                            </span>
                            <h3 className="text-2xl font-extrabold text-slate-900">
                                Wash<span className="text-blue-600">Fast</span>
                            </h3>
                        </div>
                        <p className="text-sm text-slate-600">
                            Laundry on-demand yang cepat, higienis, dan wangi konsisten.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">Navigasi</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li><a href="#beranda" className="hover:text-blue-600 transition">Beranda</a></li>
                            <li><a href="#layanan-lengkap" className="hover:text-blue-600 transition">Semua Layanan</a></li>
                            <li><a href="#produk-lengkap" className="hover:text-blue-600 transition">Katalog Produk</a></li>
                            <li><a href="#beranda" className="hover:text-blue-600 transition">Tentang Kami</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">Bantuan</h4>
                        <ul className="space-y-2 text-sm text-slate-600">
                            <li><a href="#" className="hover:text-blue-600 transition">FAQ</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition">Kontak</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition">Kebijakan Privasi</a></li>
                            <li><a href="#" className="hover:text-blue-600 transition">Syarat & Ketentuan</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-3">Ikuti Kami</h4>
                        <div className="flex space-x-4 text-slate-500">
                            <a href="#" className="hover:text-blue-600 transition"><i className="fab fa-facebook-f text-xl"></i></a>
                            <a href="#" className="hover:text-rose-500 transition"><i className="fab fa-instagram text-xl"></i></a>
                            <a href="#" className="hover:text-green-500 transition"><i className="fab fa-whatsapp text-xl"></i></a>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between text-sm text-slate-500 border-t border-slate-200 pt-4">
                    <p>&copy; {currentYear} WashFast Laundry. Semua hak dilindungi.</p>
                    <div className="flex gap-4 mt-3 md:mt-0">
                        <a href="#" className="hover:text-blue-600 transition">Privasi</a>
                        <a href="#" className="hover:text-blue-600 transition">Ketentuan</a>
                        <a href="#" className="hover:text-blue-600 transition">Pusat Bantuan</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
