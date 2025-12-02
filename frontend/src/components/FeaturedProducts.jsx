import React from 'react';

const products = [
    { name: "Deterjen Konsentrat (1L)", price: "Rp 45.000" },
    { name: "Pelembut Pakaian Premium", price: "Rp 32.000" },
    { name: "Penghilang Noda Super", price: "Rp 28.000" },
    { name: "Sikat Pakaian Premium", price: "Rp 18.000" },
];

const FeaturedProducts = ({ onAddToCart }) => {
    return (
        <section className="mb-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8 border-b-2 border-blue-500 pb-2">🛍️ Produk Laundry Pilihan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {products.map((product, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center text-center transition duration-300 hover:shadow-lg">
                    
                        {/* Placeholder Gambar */}
                        <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                            <i className="fas fa-box text-blue-400 text-2xl"></i>
                        </div>

                        <h4 className="font-semibold text-gray-800 mt-2">{product.name}</h4>
                        <p className="text-sm text-gray-500 mb-3">{product.price}</p>
                        <button 
                            className="bg-green-500 text-white text-sm py-2 px-4 rounded-lg hover:bg-green-600 transition duration-150" 
                            onClick={onAddToCart}>
                            + Keranjang
                        </button>
                    </div>
                ))}
            </div>
            <div className="text-center mt-10">
                 <a href="#produk-lengkap" className="inline-block text-blue-600 font-semibold hover:text-blue-800 border-b border-blue-600 pb-1 transition duration-150">Lihat Semua Produk &rarr;</a>
            </div>
        </section>
    );
};

export default FeaturedProducts;