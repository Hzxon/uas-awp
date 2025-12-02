import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar'; 
import Footer from './Footer'; 

const CartPage = ({ cartItems, onUpdateQuantity, isLoggedIn, userName, onLogout, cartCount }) => {
    
    // Gunakan data cartItems dari App.jsx
    const currentCart = cartItems; 

    // Hitung Subtotal dan Total
    const { subtotal, totalItems } = useMemo(() => {
        const total = currentCart.reduce((sum, item) => sum + (item.qty * item.price), 0);
        const count = currentCart.reduce((sum, item) => sum + item.qty, 0);
        return { subtotal: total, totalItems: count };
    }, [currentCart]);

    const deliveryFee = 15000;
    const finalTotal = subtotal > 100000 ? subtotal : subtotal + deliveryFee;

    const handleCheckout = () => {
        if (currentCart.length === 0) {
            alert("Keranjang masih kosong!");
            return;
        }
        alert(`Checkout diproses! Total Pembayaran: Rp ${finalTotal.toLocaleString('id-ID')}. Terima kasih!`);
        // Logika checkout yang sebenarnya akan terjadi di sini
    };

    return (
        <div className="bg-blue-50 min-h-screen">
            {/* Navbar tetap ada di sini */}
            <Navbar 
                cartCount={cartCount} 
                isLoggedIn={isLoggedIn} 
                userName={userName}
                onLogout={onLogout}
                // Karena ini bukan landing page, kita tidak perlu onScroll/activeSection
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-8 flex items-center">
                    <i className="fas fa-shopping-basket text-blue-600 mr-4"></i> Keranjang Belanja Anda
                </h1>

                {currentCart.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-lg">
                        <i className="fas fa-box-open text-6xl text-gray-400 mb-4"></i>
                        <p className="text-xl text-gray-600 mb-4">Keranjang Anda masih kosong.</p>
                        <Link to="/" className="text-blue-600 font-semibold hover:text-blue-800 transition duration-150">
                            &larr; Lanjut Berbelanja
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Kolom Kiri: Detail Item */}
                        <div className="lg:col-span-2 space-y-4">
                            {currentCart.map((item) => (
                                <div key={item.id} className="flex items-center bg-white p-4 rounded-xl shadow-md justify-between">
                                    <div className="flex items-center space-x-4 w-1/2">
                                        <i className={`text-3xl ${item.type === 'Layanan' ? 'fas fa-tshirt text-blue-500' : 'fas fa-box text-green-500'}`}></i>
                                        <div>
                                            <h2 className="font-semibold text-gray-800">{item.name}</h2>
                                            <p className="text-sm text-gray-500">Rp {item.price.toLocaleString('id-ID')} / {item.unit}</p>
                                        </div>
                                    </div>

                                    {/* Kuantitas Controls */}
                                    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                        <button 
                                            onClick={() => onUpdateQuantity(item.id, -1)}
                                            className="bg-gray-100 hover:bg-red-100 text-red-500 px-3 py-1 text-xl transition duration-150">
                                            -
                                        </button>
                                        <span className="px-3 py-1 font-medium text-gray-800">{item.qty}</span>
                                        <button 
                                            onClick={() => onUpdateQuantity(item.id, 1)}
                                            className="bg-gray-100 hover:bg-green-100 text-green-500 px-3 py-1 text-xl transition duration-150">
                                            +
                                        </button>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <span className="text-lg font-bold text-blue-700 w-24 text-right">
                                            Rp {(item.qty * item.price).toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Kolom Kanan: Ringkasan Pembayaran */}
                        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-fit sticky top-20">
                           {/* ... (Ringkasan Pembayaran tetap sama) */}
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Ringkasan Pesanan</h2>
                            <div className="space-y-3 text-gray-600">
                                <div className="flex justify-between">
                                    <span>Subtotal ({totalItems} item)</span>
                                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Biaya Pengiriman</span>
                                    <span className={subtotal > 100000 ? "text-green-600" : ""}>
                                        {subtotal > 100000 ? "Gratis" : `Rp ${deliveryFee.toLocaleString('id-ID')}`}
                                    </span>
                                </div>
                                <div className="pt-4 border-t border-gray-200 flex justify-between font-bold text-xl text-gray-800">
                                    <span>Total Pembayaran</span>
                                    <span>Rp {finalTotal.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                            <button 
                                onClick={handleCheckout} 
                                className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200 shadow-md transform hover:scale-[1.01]">
                                Proses Pembayaran
                            </button>
                            <Link to="/" className="w-full mt-3 inline-block text-center text-blue-600 hover:text-blue-800 font-medium">
                                &larr; Lanjut Belanja
                            </Link>
                        </div>
                    </div>
                )}
            </div>
            
            <Footer />
        </div>
    );
};

export default CartPage;