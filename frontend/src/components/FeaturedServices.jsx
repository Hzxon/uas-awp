import React, { useState } from 'react';
// Import modul detail layanan yang sudah dinamai ulang
import ServicesDetail from './ServicesDetail'; 

// Data Layanan Lengkap, DILENGKAPI dengan detail (longDescription dan details) untuk Modal
const services = [
    { 
        id: 1, 
        name: "Cuci Kering", 
        price: 6000, 
        unit: "kg", 
        iconClass: "fas fa-coins text-yellow-500", 
        description: "Cuci cepat 60 menit, hemat energi, harga terjangkau.", 
        longDescription: "Layanan cuci-kering tercepat kami, selesai dalam 60 menit. Ideal untuk pakaian sehari-hari yang tidak memerlukan perlakuan khusus. Harga sangat terjangkau per kilogram.", 
        details: ["60 menit selesai", "Hemat energi", "Harga terbaik"] 
    },
    { 
        id: 2, 
        name: "Cuci + Setrika", 
        price: 8000, 
        unit: "kg", 
        iconClass: "fas fa-hand-holding-water text-blue-400", 
        description: "Layanan khusus untuk handuk, menghilangkan bau apek dan kuman.", 
        longDescription: "Perlakuan khusus menggunakan deterjen anti-bakteri dan pelembut premium untuk mengembalikan kelembutan dan kesegaran handuk Anda. Sangat efektif menghilangkan bau apek.", 
        details: ["Anti-bakteri", "Pelembut handuk premium", "Menghilangkan bau apek"] 
    },
    { 
        id: 3, 
        name: "Setrika Saja", 
        price: 5000, 
        unit: "kg", 
        iconClass: "fas fa-sun text-orange-500", 
        description: "Keringkan pakaian Anda 100% menggunakan mesin pengering profesional.", 
        longDescription: "Pakaian kering 100% dalam waktu singkat menggunakan mesin pengering profesional yang higienis. Ini memastikan pakaian Anda siap dipakai segera setelah diambil.", 
        details: ["Kering 100%", "Mesin profesional", "Sangat cepat"] 
    },
    // Menambahkan layanan sepatu untuk contoh yang lebih lengkap
    { 
        id: 4, 
        name: "Dry Cleaning", 
        price: 15000, 
        unit: "pasang", 
        iconClass: "fas fa-shoe-prints text-brown-600", 
        description: "Pencucian mendalam untuk semua jenis sepatu (sneakers, kulit, dll.) dengan cairan khusus. Termasuk perlakuan anti-bakteri.", 
        longDescription: "Perawatan sepatu yang dilakukan oleh ahli kami. Menggunakan sikat dan cairan khusus sesuai bahan sepatu Anda. Termasuk deep cleaning dan anti-bakteri.", 
        details: ["Perawatan profesional", "Cairan khusus", "Anti-bakteri & Deodorizing"] 
    },

    { 
        id: 5, 
        name: "Cuci Selimut", 
        price: 25000, 
        unit: "pasang", 
        iconClass: "fas fa-shoe-prints text-brown-600", 
        description: "Pencucian mendalam untuk semua jenis sepatu (sneakers, kulit, dll.) dengan cairan khusus. Termasuk perlakuan anti-bakteri.", 
        longDescription: "Perawatan sepatu yang dilakukan oleh ahli kami. Menggunakan sikat dan cairan khusus sesuai bahan sepatu Anda. Termasuk deep cleaning dan anti-bakteri.", 
        details: ["Perawatan profesional", "Cairan khusus", "Anti-bakteri & Deodorizing"] 
    },
];

const FeaturedServices = ({ onAddToCart }) => {
    // State untuk melacak ID layanan yang detailnya sedang dilihat (Modal terbuka jika tidak null)
    const [selectedServiceId, setSelectedServiceId] = useState(null);

    // Mencari objek layanan yang sesuai dengan ID untuk diteruskan ke Modal
    const selectedService = services.find(svc => svc.id === selectedServiceId);

    /**
     * Mengatur state untuk menampilkan Modal detail layanan
     */
    const handleViewDetail = (serviceId) => {
        setSelectedServiceId(serviceId);
    };

    /**
     * Menutup Modal
     */
    const handleCloseModal = () => {
        setSelectedServiceId(null);
    };

    return (
        <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b-2 border-green-500 pb-2">✨ Layanan Pilihan Terbaik Kami</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {services.map((service) => (
                    <div key={service.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden group">
                        <div className="p-6 flex flex-col h-full">
                            <i className={`${service.iconClass} text-4xl mb-4 transition duration-300 group-hover:scale-110`}></i>
                            <h3 className="text-xl font-semibold text-gray-800 mb-1">{service.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">Rp {service.price.toLocaleString('id-ID')} / {service.unit}</p>
                            <p className="text-gray-600 text-sm flex-1">{service.description}</p>
                            
                            <div className="mt-4 flex items-center justify-between">
                                {/* Memicu Modal dengan mengklik tombol Lihat Detail */}
                                <button 
                                    onClick={() => handleViewDetail(service.id)} 
                                    className="text-blue-600 font-medium hover:text-blue-800 transition duration-150"
                                >
                                    Lihat Detail &rarr;
                                </button>
                                {onAddToCart && (
                                    <button 
                                        onClick={() => onAddToCart({ ...service, type: 'Layanan' })}
                                        className="text-sm bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition duration-150">
                                        + Keranjang
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Memanggil komponen ServicesDetail dan meneruskan data serta fungsi kontrol */}
            <ServicesDetail 
                service={selectedService} // Data layanan (null jika tertutup)
                onClose={handleCloseModal} // Fungsi untuk menutup Modal
                onAddToCart={onAddToCart} // Fungsi opsional untuk menambah ke keranjang
            />
        </section>
    );
};

export default FeaturedServices;