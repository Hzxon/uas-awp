import React from 'react';

const FeaturedServices = ({ services = [], onAddToCart }) => {
  return (
    <section id="layanan-terbaik" className="mb-16">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b-2 border-green-500 pb-2">
        ✨ Layanan Pilihan Terbaik Kami
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {services.length === 0 ? (
          <p className="text-gray-500">Memuat data layanan...</p>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 overflow-hidden group"
            >
              <div className="p-6 flex flex-col h-full">
                <i className="fas fa-basket-shopping text-4xl text-blue-500 mb-4 transition duration-300 group-hover:scale-110"></i>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">{service.nama}</h3>
                <p className="text-sm text-gray-500 mb-2">
                  Rp {Number(service.harga || 0).toLocaleString('id-ID')} / kg
                </p>
                <p className="text-gray-600 text-sm flex-1">
                  {service.deskripsi || "Layanan laundry profesional untuk kebutuhan harian Anda."}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-400">ID: {service.id}</span>
                  {onAddToCart && (
                    <button
                      onClick={() =>
                        onAddToCart({
                          id: service.id,
                          name: service.nama,
                          price: Number(service.harga || 0),
                          type: 'Layanan',
                          unit: 'kg',
                        })
                      }
                      className="text-sm bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 transition duration-150"
                    >
                      + Keranjang
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default FeaturedServices;
