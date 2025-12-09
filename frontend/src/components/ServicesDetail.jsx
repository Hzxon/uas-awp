import React, { useState, useEffect } from 'react';

/**
 * Komponen Modal dengan animasi smooth yang dikontrol melalui state internal.
 */
const ServicesDetail = ({ service, onClose, onAddToCart }) => {
    // Kontrol animasi dan data yang tetap ada selama transisi keluar
    const [isVisible, setIsVisible] = useState(false);
    const [renderedService, setRenderedService] = useState(null);

    // --- Efek Transisi (Masuk & Keluar) ---
    useEffect(() => {
        if (service) {
            setRenderedService(service);
            // Pastikan animasi berjalan setelah render
            const showTimer = setTimeout(() => setIsVisible(true), 10);
            return () => clearTimeout(showTimer);
        }

        // Saat service dihapus, tutup animasi dan hapus konten setelah delay
        setIsVisible(false);
        const hideTimer = setTimeout(() => setRenderedService(null), 250);
        return () => clearTimeout(hideTimer);
    }, [service]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            if (onClose) onClose();
        }, 250);
    };

    // Tidak render jika tidak ada konten yang harus ditampilkan
    if (!renderedService) return null;

    return (
        // OVERLAY: Kontrol Opacity
        <div 
            // Menggunakan isVisible untuk mengontrol kelas opacity
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm transition-opacity duration-300 ease-out 
                ${isVisible ? 'bg-opacity-75 opacity-100' : 'bg-opacity-0 opacity-0'}
            `}
            onClick={handleClose} // Menutup modal saat mengklik area luar
        >
            {/* KONTEN MODAL: Kontrol Scale */}
            <div 
                // Menggunakan isVisible untuk mengontrol properti transform
                className={`bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8 m-4 transform transition-transform duration-300 ease-out`}
                onClick={(e) => e.stopPropagation()} 
                // Kontrol Scale untuk Pop In/Out
                style={{ transform: isVisible ? 'scale(1)' : 'scale(0.9)' }} 
            >
                {/* Header Modal */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
                    <h3 className="text-3xl font-extrabold text-gray-900 flex items-center">
                        <i className={`${renderedService.iconClass} text-4xl mr-4`}></i>
                        {renderedService.name}
                    </h3>
                    <button 
                        onClick={handleClose} 
                        className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
                    >
                        &times;
                    </button>
                </div>
                
                {/* Isi Detail */}
                <div className="space-y-4">
                    <p className="text-2xl font-bold text-green-600">
                        Rp {renderedService.price.toLocaleString('id-ID')} / {renderedService.unit}
                    </p>

                    <p className="text-gray-700 leading-relaxed italic">
                        {renderedService.longDescription || "Deskripsi lengkap layanan ini belum tersedia."}
                    </p>

                    <h4 className="text-lg font-bold text-gray-800 pt-2 border-t mt-4">Apa yang Anda Dapatkan:</h4>
                    <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                        {(renderedService.details || []).map((detail, index) => (
                            <li key={index} className="text-sm">{detail}</li>
                        ))}
                    </ul>
                </div>
                
                {/* Footer / Tombol Aksi */}
                <div className="mt-8 flex justify-end space-x-3">
                    <button 
                        onClick={handleClose} 
                        className="py-2 px-5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150"
                    >
                        Tutup
                    </button>
                    {onAddToCart && (
                        <button 
                            onClick={() => {
                                onAddToCart({ ...renderedService, type: 'Layanan' });
                                handleClose(); // Gunakan handleClose yang baru
                            }}
                            className="bg-green-600 text-white py-2 px-5 rounded-lg font-semibold hover:bg-green-700 transition duration-150 shadow-md"
                        >
                            + Tambah ke Keranjang
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServicesDetail;
