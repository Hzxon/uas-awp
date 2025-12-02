import React from 'react';

const services = [
    { id: "svc-coin", name: "Laundry Coin Cepat", price: 12000, unit: "kg", iconClass: "fas fa-coins text-yellow-500", description: "Cuci cepat 60 menit, hemat energi, harga terjangkau." },
    { id: "svc-towel", name: "Pencucian Handuk Eksklusif", price: 15000, unit: "kg", iconClass: "fas fa-hand-holding-water text-blue-400", description: "Layanan khusus untuk handuk, menghilangkan bau apek dan kuman." },
    { id: "svc-dry", name: "Jasa Pengeringan Cepat", price: 10000, unit: "kg", iconClass: "fas fa-sun text-orange-500", description: "Keringkan pakaian Anda 100% menggunakan mesin pengering profesional." },
];

const FeaturedServices = ({ onAddToCart }) => {
    return (
        <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b-2 border-green-500 pb-2">✨ Layanan Pilihan Terbaik Kami</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.map((service) => (
                    <div key={service.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden group">
                        <div className="p-6 flex flex-col h-full">
                            <i className={`${service.iconClass} text-4xl mb-4 transition duration-300 group-hover:scale-110`}></i>
                            <h3 className="text-xl font-semibold text-gray-800 mb-1">{service.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">Rp {service.price.toLocaleString('id-ID')} / {service.unit}</p>
                            <p className="text-gray-600 text-sm flex-1">{service.description}</p>
                            <div className="mt-4 flex items-center justify-between">
                                <a href="#layanan-lengkap" className="text-blue-600 font-medium hover:text-blue-800 transition duration-150">Lihat Detail &rarr;</a>
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
        </section>
    );
};

export default FeaturedServices;
