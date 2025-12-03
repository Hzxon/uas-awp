import React, { useMemo, useState, useEffect } from 'react'; // FIX: Tambah useEffect
import { Link, useNavigate, useLocation } from 'react-router-dom'; // FIX: Tambah useLocation
import Navbar from './Navbar'; 
import Footer from './Footer'; 
import CheckoutModal from './CheckoutModal';
import ExitConfirmationModal from './ExitConfirmationModal';
import { orderApi } from '../api';

const CartPage = ({ cartItems, onUpdateQuantity, isLoggedIn, userName, onLogout, cartCount, authToken, onOrderPlaced }) => {
    
    const navigate = useNavigate();
    const location = useLocation(); // FIX: Gunakan useLocation
    
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [isExitModalOpen, setIsExitModalOpen] = useState(false);
    const [targetSection, setTargetSection] = useState(null);

    // 🌟 EFEK BARU: Membuka Modal Checkout Otomatis dari Navigasi 🌟
    useEffect(() => {
        // Cek apakah state 'openCheckout' ada
        if (location.state?.openCheckout) {
            handleOpenCheckout();
            
            // Hapus state agar modal tidak muncul lagi setelah navigasi
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]); 
    
    const handleNavAttempt = (id) => {
        setTargetSection(id);
        setIsExitModalOpen(true);
    };

    const handleConfirmExit = () => {
        setIsExitModalOpen(false);
        navigate('/', { state: { targetId: targetSection } }); 
    };

    const { subtotal, totalItems } = useMemo(() => {
        const total = cartItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
        const count = cartItems.reduce((sum, item) => sum + item.qty, 0);
        return { subtotal: total, totalItems: count };
    }, [cartItems]);

    const deliveryFee = 15000;
    const taxRate = 0.1;
    const deliveryFeeValue = subtotal > 100000 ? 0 : deliveryFee;
    const taxAmount = Math.round(subtotal * taxRate);
    const finalTotal = subtotal + deliveryFeeValue + taxAmount;

    const handleOpenCheckout = () => {
        if (cartItems.length === 0) {
            alert("Keranjang masih kosong!");
            return;
        }
        if (!isLoggedIn) {
            alert("Silakan login dahulu untuk melanjutkan pembayaran.");
            return;
        }
        setIsCheckoutModalOpen(true);
    };

    // --- BAGIAN UTAMA YANG DIPERBAIKI ---
    const handleConfirmOrder = async () => {
        if (!authToken) {
            alert("Sesi login berakhir, silakan login kembali.");
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. TRANSFORMASI DATA (MAPPING CERDAS)
            const formattedItems = cartItems.map((item) => {
                // Deteksi tipe item: Apakah 'Layanan' atau 'Produk'?
                // Default ke 'Layanan' jika properti type tidak ada untuk keamanan
                const isLayanan = !item.type || item.type === 'Layanan';

                return {
                    // Jika Layanan: isi layanan_id, kosongkan produk_id
                    // Jika Produk: kosongkan layanan_id, isi produk_id
                    layanan_id: isLayanan ? item.id : null,
                    produk_id: !isLayanan ? (item.productId || item.id) : null,
                    
                    qty: parseInt(item.qty),
                    harga_satuan: parseInt(item.price),
                    subtotal: parseInt(item.price) * parseInt(item.qty)
                };
            });

            // 2. SIAPKAN PAYLOAD LENGKAP
            const payload = {
                items: formattedItems,
                total: parseInt(finalTotal), // Pastikan integer
                deliveryFee: deliveryFeeValue,
                taxRate,
            };
            
            console.log("🔥 Payload Fixed:", JSON.stringify(payload, null, 2));

            // 3. KIRIM KE API
            await orderApi.create(authToken, payload);
            
            alert(`Pesanan Rp ${finalTotal.toLocaleString('id-ID')} berhasil dibuat. Terima kasih, ${userName || 'pelanggan'}!`);
            setIsCheckoutModalOpen(false);
            if (onOrderPlaced) onOrderPlaced();
            navigate('/');
        } catch (err) {
            console.error("Order Error:", err);
            // Tampilkan pesan error spesifik dari backend jika ada
            alert(err.message || "Gagal memproses pesanan. Cek koneksi atau coba lagi.");
        } finally {
            setIsSubmitting(false);
        }
    };
    // ------------------------------------

    return (
        <div className="bg-blue-50 min-h-screen">
            <Navbar 
                cartCount={cartCount} 
                isLoggedIn={isLoggedIn} 
                userName={userName}
                onLogout={onLogout}
                onNavigating={handleNavAttempt}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-8 flex items-center">
                    <i className="fas fa-shopping-basket text-blue-600 mr-4"></i> Keranjang Belanja Anda
                </h1>

                {cartItems.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl shadow-lg">
                        <i className="fas fa-box-open text-6xl text-gray-400 mb-4"></i>
                        <p className="text-xl text-gray-600 mb-4">Keranjang Anda masih kosong.</p>
                        <Link to="/" className="text-blue-600 font-semibold hover:text-blue-800 transition duration-150">
                            &larr; Lanjut Berbelanja
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-4">
                            {cartItems.map((item) => (
                                <div key={item.id} className="flex items-center bg-white p-4 rounded-xl shadow-md justify-between">
                                    <div className="flex items-center space-x-4 w-1/2">
                                        <i className={`text-3xl ${item.type === 'Layanan' ? 'fas fa-tshirt text-blue-500' : 'fas fa-box text-green-500'}`}></i>
                                        <div>
                                            <h2 className="font-semibold text-gray-800">{item.name}</h2>
                                            <p className="text-sm text-gray-500">Rp {item.price.toLocaleString('id-ID')} / {item.unit || 'unit'}</p>
                                        </div>
                                    </div>

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

                        <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg h-fit sticky top-20">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">Ringkasan Pesanan</h2>
                            <div className="space-y-3 text-gray-600">
                                <div className="flex justify-between">
                                    <span>Subtotal ({totalItems} item)</span>
                                    <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>PPN (10%)</span>
                                    <span>Rp {taxAmount.toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Biaya Pengiriman</span>
                                    <span className={deliveryFeeValue === 0 ? "text-green-600" : ""}>
                                        {deliveryFeeValue === 0 ? "Gratis" : `Rp ${deliveryFeeValue.toLocaleString('id-ID')}`}
                                    </span>
                                </div>
                                <div className="pt-4 border-t border-gray-200 flex justify-between font-bold text-xl text-gray-800">
                                    <span>Total Pembayaran</span>
                                    <span>Rp {finalTotal.toLocaleString('id-ID')}</span>
                                </div>
                            </div>
                            <button 
                                onClick={handleOpenCheckout} 
                                className="w-full mt-6 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200 shadow-md transform hover:scale-[1.01]">
                                Proses Pembayaran                            </button>
                            <Link to="/" className="w-full mt-3 inline-block text-center text-blue-600 hover:text-blue-800 font-medium">
                                &larr; Lanjut Belanja
                            </Link>
                        </div>
                    </div>
                )}
            </div>
            
            <Footer />

            <CheckoutModal
                isOpen={isCheckoutModalOpen}
                onClose={() => setIsCheckoutModalOpen(false)}
                cartItems={cartItems}
                subtotal={subtotal}
                finalTotal={finalTotal}
                deliveryFee={deliveryFeeValue}
                taxAmount={taxAmount}
                taxRate={taxRate}
                onConfirmOrder={handleConfirmOrder}
                userName={userName}
                isSubmitting={isSubmitting}
            />

            <ExitConfirmationModal
                isOpen={isExitModalOpen}
                onClose={() => setIsExitModalOpen(false)}
                onConfirmExit={handleConfirmExit}
            />
        </div>
    );
};

export default CartPage;