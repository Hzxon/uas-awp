import React from 'react';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gray-800 text-white py-10 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-gray-700 pb-8 mb-8">
                    {/* Kolom 1: Logo & Slogan */}
                    <div>
                        <h3 className="text-2xl font-extrabold text-blue-400 mb-3">
                            Wash<span className="text-green-400">Fast</span>
                        </h3>
                        <p className="text-sm text-gray-400">
                            Solusi Laundry Cepat, Bersih, dan Wangi.
                        </p>
                    </div>

                    {/* Kolom 2: Navigasi Cepat */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Informasi</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#beranda" className="text-gray-400 hover:text-white transition duration-150">Beranda</a></li>
                            <li><a href="#layanan-lengkap" className="text-gray-400 hover:text-white transition duration-150">Semua Layanan</a></li>
                            <li><a href="#produk-lengkap" className="text-gray-400 hover:text-white transition duration-150">Katalog Produk</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition duration-150">Tentang Kami</a></li>
                        </ul>
                    </div>

                    {/* Kolom 3: Bantuan */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Bantuan</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="text-gray-400 hover:text-white transition duration-150">FAQ</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition duration-150">Kontak Kami</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition duration-150">Kebijakan Privasi</a></li>
                            <li><a href="#" className="text-gray-400 hover:text-white transition duration-150">Syarat & Ketentuan</a></li>
                        </ul>
                    </div>

                    {/* Kolom 4: Hubungi Kami */}
                    <div>
                        <h4 className="text-lg font-semibold mb-4 text-white">Ikuti Kami</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-blue-500 transition duration-150"><i className="fab fa-facebook-f text-xl"></i></a>
                            <a href="#" className="text-gray-400 hover:text-pink-500 transition duration-150"><i className="fab fa-instagram text-xl"></i></a>
                            <a href="#" className="text-gray-400 hover:text-green-500 transition duration-150"><i className="fab fa-whatsapp text-xl"></i></a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="text-center text-sm text-gray-500">
                    <p>&copy; {currentYear} WashFast Laundry. Semua Hak Dilindungi.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;