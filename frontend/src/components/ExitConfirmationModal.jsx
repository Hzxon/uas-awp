import React from 'react';

const ExitConfirmationModal = ({ isOpen, onClose, onConfirmExit }) => {
    if (!isOpen) return null;

    return (
        // Overlay (Latar belakang gelap)
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-red-900 bg-opacity-75 backdrop-blur-sm transition-opacity" onClick={onClose}>
            
            {/* Modal Content */}
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                
                <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center">
                    <i className="fas fa-exclamation-triangle mr-3"></i> Keluar dari Pembayaran?
                </h3>

                <p className="text-gray-700 mb-6">
                    Anda sedang dalam proses pembayaran. Semua item di keranjang Anda akan tersimpan, tetapi Anda harus memulai kembali proses *checkout*.
                </p>

                <div className="flex justify-end space-x-3">
                    {/* Opsi 1: Lanjut Pembayaran (Tutup Modal) */}
                    <button 
                        onClick={onClose}
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-200">
                        Lanjut Pembayaran
                    </button>
                    
                    {/* Opsi 2: Keluar (Pindah Halaman) */}
                    <button 
                        onClick={onConfirmExit}
                        className="bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-300 transition duration-200">
                        Keluar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExitConfirmationModal;
