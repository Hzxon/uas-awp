import React from 'react';

/**
 * Komponen Modal untuk menampilkan detail lengkap dari suatu layanan.
 * @param {object} props
 * @param {object | null} props.service - Objek layanan yang akan ditampilkan. Jika null, modal tidak terlihat.
 * @param {function} props.onClose - Fungsi untuk menutup modal.
 * @param {function} [props.onAddToCart] - Fungsi opsional untuk menambah layanan ke keranjang.
 */
const ServicesDetail = ({ service, onClose, onAddToCart }) => {
    // Jika tidak ada layanan yang dipilih (service === null), modal tidak ditampilkan
    if (!service) return null;

    // Tambahkan data fallback jika service.details atau longDescription tidak ada
    const details = service.details || [
        "Fitur 1: Mohon lengkapi data details di objek service.", 
        "Fitur 2: Fitur ini belum terdefinisi."
    ];
    const longDescription = service.longDescription || "Deskripsi lengkap layanan ini belum tersedia. Silakan cek informasi harga dan unit.";


    return (
        // Overlay Modal: Fixed position, full screen, semi-transparent black background
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm transition-opacity duration-300" 
            onClick={onClose} // Menutup modal saat mengklik area luar
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl max-w-xl w-full p-8 m-4 transform transition-transform duration-300 scale-100"
                onClick={(e) => e.stopPropagation()} // Mencegah klik di dalam modal menutup modal
            >
                {/* Header Modal */}
                <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
                    <h3 className="text-3xl font-extrabold text-gray-900 flex items-center">
                        {/* Ikon dari data layanan */}
                        <i className={`${service.iconClass} text-4xl mr-4`}></i>
                        {service.name}
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 text-3xl transition-colors"
                    >
                        &times;
                    </button>
                </div>
                
                {/* Isi Detail */}
                <div className="space-y-4">
                    <p className="text-2xl font-bold text-green-600">
                        Rp {service.price.toLocaleString('id-ID')} / {service.unit}
                    </p>

                    <p className="text-gray-700 leading-relaxed italic">
                        {longDescription}
                    </p>

                    <h4 className="text-lg font-bold text-gray-800 pt-2 border-t mt-4">Apa yang Anda Dapatkan:</h4>
                    <ul className="list-disc list-inside text-gray-600 ml-4 space-y-1">
                        {details.map((detail, index) => (
                            <li key={index} className="text-sm">{detail}</li>
                        ))}
                    </ul>
                </div>
                
                {/* Footer / Tombol Aksi */}
                <div className="mt-8 flex justify-end space-x-3">
                    <button 
                        onClick={onClose} 
                        className="py-2 px-5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition duration-150"
                    >
                        Tutup
                    </button>
                    {onAddToCart && (
                        <button 
                            onClick={() => {
                                onAddToCart({ ...service, type: 'Layanan' });
                                onClose(); 
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