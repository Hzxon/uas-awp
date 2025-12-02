import React from 'react';

const services = [
    { name: "Laundry Coin Cepat", iconClass: "fas fa-coins text-yellow-500", description: "Cuci cepat 60 menit, hemat energi, harga terjangkau." },
    { name: "Pencucian Handuk Eksklusif", iconClass: "fas fa-hand-holding-water text-blue-400", description: "Layanan khusus untuk handuk, menghilangkan bau apek dan kuman." },
    { name: "Jasa Pengeringan Cepat", iconClass: "fas fa-sun text-orange-500", description: "Keringkan pakaian Anda 100% menggunakan mesin pengering profesional." },
];

const FeaturedServices = () => {
    return (
        <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b-2 border-green-500 pb-2">✨ Layanan Pilihan Terbaik Kami</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {services.map((service, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden group">
                        <div className="p-6">
                            <i className={`${service.iconClass} text-4xl mb-4 transition duration-300 group-hover:scale-110`}></i>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.name}</h3>
                            <p className="text-gray-600 text-sm">{service.description}</p>
                            <a href="#layanan-lengkap" className="mt-4 inline-block text-blue-600 font-medium hover:text-blue-800 transition duration-150">Lihat Detail &rarr;</a>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default FeaturedServices;