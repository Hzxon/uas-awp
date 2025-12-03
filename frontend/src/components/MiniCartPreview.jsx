import React from 'react';
import { Link } from 'react-router-dom';

// Data Dummy Keranjang (Ganti dengan data keranjang Anda yang sebenarnya)
const dummyCartItems = [
    { id: 'item1', name: 'Laundry Coin Cepat', unit: 'kg', price: 12000, quantity: 2.5 },
    { id: 'item2', name: 'Pencucian Handuk Eksklusif', unit: 'kg', price: 15000, quantity: 1 },
];

/**
 * Komponen Mini Cart Preview.
 * Menampilkan ringkasan keranjang atau pesan login/kosong berdasarkan state.
 */
const MiniCartPreview = ({ items = dummyCartItems, cartCount = 3, isLoggedIn, openLoginModal }) => {
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = 0; 
    let content;

    // --- SKENARIO 1: BELUM LOGIN ---
    if (!isLoggedIn) {
        content = (
            <div className="text-center p-6 space-y-4">
                <i className="fas fa-lock text-blue-600 text-4xl"></i>
                <h4 className="font-bold text-lg text-gray-800">Ups, Keranjang Terkunci!</h4>
                <p className="text-gray-600 text-sm">
                    Silakan masuk atau daftar untuk menyimpan pesanan Anda.
                </p>
                <button 
                    onClick={() => openLoginModal('login')}
                    className="inline-block bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition duration-150 shadow-md w-full"
                >
                    Masuk Sekarang
                </button>
            </div>
        );
    } 
    // --- SKENARIO 2: SUDAH LOGIN, KERANJANG KOSONG ---
    else if (items.length === 0) {
        content = (
            <div className="text-center p-6 space-y-4">
                <i className="fas fa-basket-shopping text-green-500 text-4xl"></i>
                <h4 className="font-bold text-lg text-gray-800">Keranjang masih kosong, nih!</h4>
                <p className="text-gray-600 text-sm">
                    Yuk, pilih layanan atau produk andalan WashFast!
                </p>
                <Link to="/layanan" className="inline-block border border-green-500 text-green-600 py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-50 transition duration-150 w-full">
                    Mulai Pesan
                </Link>
            </div>
        );
    } 
    // --- SKENARIO 3: SUDAH LOGIN, ADA ITEM ---
    else {
        content = (
            <>
                {/* Daftar Item */}
                <div className="p-4 space-y-3 max-h-60 overflow-y-auto pr-2 border-b border-gray-200">
                    {items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                            <div className="flex-grow pr-2">
                                <p className="font-medium text-gray-700 truncate">{item.name}</p>
                                <p className="text-xs text-gray-500">
                                    {item.quantity} {item.unit} x Rp {item.price.toLocaleString('id-ID')}
                                </p>
                            </div>
                            <span className="font-semibold text-gray-800">
                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Total dan Tombol Aksi */}
                <div className="p-4 space-y-1 text-sm">
                    <div className="flex justify-between font-medium text-gray-700">
                        <span>Subtotal:</span>
                        <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-green-600 pt-2 border-t mt-2">
                        <span>Total:</span>
                        <span>Rp {(subtotal + shippingFee).toLocaleString('id-ID')}</span>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t flex space-x-2">
                    {/* Link ini HANYA ke CartPage */}
                    <Link to="/cart" className="flex-1 text-center py-2 text-sm rounded-lg border border-green-500 text-green-600 hover:bg-green-50 transition duration-150">
                        Lihat Keranjang
                    </Link>
                    {/* Link ini MENGIRIM STATE untuk membuka modal */}
                    <Link 
                        to="/cart" 
                        state={{ openCheckout: true }} 
                        className="flex-1 text-center py-2 text-sm rounded-lg bg-green-500 text-white hover:bg-green-600 transition duration-150"
                    >
                        Checkout
                    </Link>
                </div>
            </>
        );
    }

    return (
        <div 
            className="absolute right-0 w-80 max-w-sm bg-white rounded-xl shadow-2xl border border-gray-100 z-[1000] 
                       transform origin-top-right transition duration-300 ease-out"
            style={{ 
                right: '0', 
                top: '100%', 
            }}
        >
            {isLoggedIn && (
                <h4 className="text-lg font-bold text-gray-800 p-4 pb-2 border-b border-gray-200">
                    🛒 Keranjang Belanja ({cartCount} Item)
                </h4>
            )}
            {content}
        </div>
    );
};

export default MiniCartPreview;