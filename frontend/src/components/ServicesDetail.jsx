import React, { useState, useEffect } from 'react';

/**
 * Komponen Modal dengan animasi smooth yang dikontrol melalui state internal.
 */
const ServicesDetail = ({ service, onClose, onAddToCart }) => {
    // State internal untuk mengontrol apakah Modal harus ditampilkan secara visual (true/false)
    const [isVisible, setIsVisible] = useState(false);
    // State internal untuk mengontrol apakah Modal sudah harus dihapus dari DOM
    const [isMounted, setIsMounted] = useState(false);

    // Dapatkan data layanan saat ini
    const currentService = service;

    // --- Efek Transisi Masuk (Mount) ---
    useEffect(() => {
        if (currentService) {
            // 1. Render komponen ke DOM
            setIsMounted(true);
            // 2. Tunda sedikit, lalu atur isVisible ke true untuk memulai Fade In/Pop In
            setTimeout(() => setIsVisible(true), 10);
        }
    }, [currentService]);

    // --- Efek Transisi Keluar (Unmount Tertunda) ---
    const handleClose = () => {
        // 1. Atur isVisible ke false untuk memulai Fade Out/Pop Out
        setIsVisible(false);
        
        // 2. Tunda penghapusan dari DOM (unmount) hingga animasi (300ms) selesai
        setTimeout(() => {
            setIsMounted(false);
            onClose(); // Panggil fungsi onClose dari parent untuk mereset state 'service'
        }, 300); // Harus sama dengan durasi transisi (duration-300)
    };

    // Jika komponen belum dipasang di DOM, jangan tampilkan apa-apa
    if (!isMounted) return null;

    // Data fallback jika properti detail tidak ada (menggunakan data dari service terakhir yang dibuka)
    const details = service ? service.details || [] : [];
    const longDescription = service ? service.longDescription || "Deskripsi lengkap layanan ini belum tersedia." : "";


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
                        <i className={`${currentService.iconClass} text-4xl mr-4`}></i>
                        {currentService.name}
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
                        Rp {currentService.price.toLocaleString('id-ID')} / {currentService.unit}
                    </p>

                    <p className="text-gray-700 leading-relaxed italic">
                        {currentService.longDescription}
                    </p>

                    <h4 className="text-lg font-bold text-gray-800 pt-2 border-t mt-4">Apa yang Anda Dapatkan:</h4>
                    <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                        {currentService.details.map((detail, index) => (
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
                                onAddToCart({ ...currentService, type: 'Layanan' });
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