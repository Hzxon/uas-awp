import React, { useMemo } from 'react';

const CheckoutModal = ({ isOpen, onClose, cartItems, subtotal, finalTotal, deliveryFee, taxAmount: taxAmountProp, taxRate = 0.1, onConfirmOrder, userName, isSubmitting }) => {

    const taxAmount = typeof taxAmountProp === 'number' ? taxAmountProp : Math.round(subtotal * taxRate);
    const delivery = deliveryFee || 0;
    const totalBeforeDelivery = subtotal + taxAmount;
    const finalAmount = typeof finalTotal === 'number' ? finalTotal : totalBeforeDelivery + delivery;
    
    const transactionDate = useMemo(() => {
        return new Date().toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    }, []);
    const orderCode = useMemo(() => {
        const seed = Math.abs(subtotal || 0) + cartItems.length * 17;
        return `#WFAST${seed.toString().padStart(6, "0").slice(-6)}`;
    }, [cartItems.length, subtotal]);

    if (!isOpen) return null;

    return (
        // Overlay (Latar belakang gelap)
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm transition-opacity" onClick={onClose}>
            
            {/* Modal Content */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                
                <div className="flex justify-between items-start mb-6 border-b pb-3">
                    <h2 className="text-3xl font-bold text-green-600">
                        Konfirmasi Pesanan
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-2xl">
                        &times;
                    </button>
                </div>

                {/* Informasi Transaksi */}
                <div className="text-sm text-gray-700 mb-6 space-y-2">
                    <p className='font-semibold'>Pesanan untuk: <span className='text-blue-600'>{userName}</span></p>
                    <p>Tanggal Transaksi: <span className='font-medium'>{transactionDate}</span></p>
                    <p>Kode Transaksi: <span className='font-medium text-blue-500'>{orderCode}</span></p>
                </div>

                {/* Daftar Produk */}
                <div className="mb-6 border rounded-lg overflow-hidden">
                    <h3 className="font-bold text-lg p-3 bg-gray-100 text-gray-800">Barang dan Layanan ({cartItems.length} Jenis)</h3>
                    <div className="divide-y divide-gray-200">
                        {cartItems.map((item, index) => (
                            <div key={index} className="flex justify-between items-center p-3 text-sm">
                                <div className='w-3/5'>
                                    <p className="font-medium text-gray-800">{item.name}</p>
                                    <p className="text-xs text-gray-500">{item.qty} x Rp {item.price.toLocaleString('id-ID')}</p>
                                </div>
                                <span className="font-semibold text-right">
                                    Rp {(item.qty * item.price).toLocaleString('id-ID')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Ringkasan Pembayaran Detail */}
                <div className="space-y-3 text-gray-700 mb-6">
                    <h3 className="font-bold text-lg text-gray-800">Detail Pembayaran</h3>
                    <div className="flex justify-between">
                        <span>Subtotal Barang</span>
                        <span>Rp {subtotal.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>PPN (Pajak 10%)</span>
                        <span className='text-red-500'>+ Rp {taxAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                        <span>Total Setelah Pajak</span>
                        <span className='font-medium'>Rp {totalBeforeDelivery.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Biaya Pengiriman</span>
                        <span className={delivery === 0 ? "text-green-600 font-semibold" : "font-medium"}>
                            {delivery === 0 ? "Gratis" : `Rp ${delivery.toLocaleString('id-ID')}`}
                        </span>
                    </div>
                </div>

                {/* Total Pembayaran Akhir */}
                <div className="pt-4 border-t border-gray-300 flex justify-between font-extrabold text-xl text-gray-900 bg-green-50 p-3 rounded-lg">
                    <span>TOTAL AKHIR PEMBAYARAN</span>
                    <span>Rp {finalAmount.toLocaleString('id-ID')}</span>
                </div>

                {/* Tombol Aksi */}
                <div className="mt-8 space-y-3">
                    <button 
                        onClick={onConfirmOrder}
                        disabled={isSubmitting}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition duration-200 shadow-lg transform hover:scale-[1.01] disabled:opacity-60 disabled:cursor-not-allowed">
                        {isSubmitting ? "Memproses..." : "Konfirmasi & Bayar Sekarang"}
                    </button>
                    <button 
                        onClick={onClose}
                        className="w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition duration-200">
                        Batal / Ubah Pesanan
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutModal;
