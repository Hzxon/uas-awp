import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { outletItemApi } from '../../api';

const PartnerItemsPage = ({ token }) => {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '',
        type: 'Layanan',
        price: '',
        unit: 'kg',
        description: ''
    });

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            setError('');
            const data = await outletItemApi.listOwn(token);
            if (data.success) {
                setItems(data.items || []);
            } else {
                setError(data.message || 'Gagal memuat data');
            }
        } catch (err) {
            console.error('Failed to fetch items:', err);
            setError(err.message || 'Gagal memuat data. Pastikan Anda terdaftar sebagai partner.');
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        // Auto-change unit based on type
        if (name === 'type') {
            setForm(prev => ({ ...prev, unit: value === 'Layanan' ? 'kg' : 'pcs' }));
        }
    };

    const openNewModal = () => {
        setEditingItem(null);
        setForm({
            name: '',
            type: 'Layanan',
            price: '',
            unit: 'kg',
            description: ''
        });
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setForm({
            name: item.name,
            type: item.type,
            price: item.price,
            unit: item.unit,
            description: item.description || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.price) {
            alert('Nama dan harga wajib diisi');
            return;
        }
        setSaving(true);
        try {
            if (editingItem) {
                await outletItemApi.update(token, editingItem.id, {
                    ...form,
                    price: parseInt(form.price),
                    is_active: editingItem.is_active
                });
            } else {
                await outletItemApi.create(token, {
                    ...form,
                    price: parseInt(form.price)
                });
            }
            setShowModal(false);
            fetchItems();
        } catch (err) {
            alert(err.message || 'Gagal menyimpan item');
        } finally {
            setSaving(false);
        }
    };

    const handleToggleActive = async (item) => {
        try {
            await outletItemApi.update(token, item.id, {
                name: item.name,
                type: item.type,
                price: item.price,
                unit: item.unit,
                description: item.description,
                is_active: !item.is_active
            });
            fetchItems();
        } catch (err) {
            alert(err.message || 'Gagal mengubah status item');
        }
    };

    const handleDelete = async (item) => {
        if (!confirm(`Hapus "${item.name}"?`)) return;
        try {
            await outletItemApi.remove(token, item.id);
            fetchItems();
        } catch (err) {
            alert(err.message || 'Gagal menghapus item');
        }
    };

    const services = items.filter(i => i.type === 'Layanan');
    const products = items.filter(i => i.type === 'Produk');

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <i className="fas fa-spinner fa-spin text-4xl text-pink-500"></i>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="fas fa-exclamation-triangle text-3xl text-red-500"></i>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Ada yang tidak beres</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                        >
                            <i className="fas fa-arrow-left mr-2"></i>Kembali
                        </button>
                        <button
                            onClick={() => {
                                setLoading(true);
                                fetchItems();
                            }}
                            className="flex-1 py-3 bg-pink-500 text-white rounded-xl font-semibold hover:bg-pink-600 transition-all"
                        >
                            <i className="fas fa-redo mr-2"></i>Coba Lagi
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Back Button + Header */}
            <div className="max-w-4xl mx-auto mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                >
                    <i className="fas fa-arrow-left mr-2"></i>
                    Kembali
                </button>
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Kelola Layanan & Produk</h1>
                    <button
                        onClick={openNewModal}
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg shadow-pink-500/30"
                    >
                        <i className="fas fa-plus mr-2"></i>Tambah Item
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">

                {/* Services Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <i className="fas fa-tshirt text-pink-500"></i>
                        Layanan ({services.length})
                    </h3>
                    {services.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Belum ada layanan. Klik "Tambah Item" untuk menambahkan.</p>
                    ) : (
                        <div className="grid gap-4">
                            {services.map(item => (
                                <div key={item.id} className={`flex items-center justify-between p-4 border rounded-xl ${!item.is_active ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                            {!item.is_active && <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">Nonaktif</span>}
                                        </div>
                                        <p className="text-pink-500 font-bold">Rp {item.price?.toLocaleString('id-ID')}/{item.unit}</p>
                                        {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleToggleActive(item)} className={`px-3 py-2 rounded-lg ${item.is_active ? 'bg-gray-100 hover:bg-gray-200' : 'bg-green-100 hover:bg-green-200'}`}>
                                            <i className={`fas ${item.is_active ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                        <button onClick={() => openEditModal(item)} className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button onClick={() => handleDelete(item)} className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Products Section */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <i className="fas fa-box text-cyan-500"></i>
                        Produk ({products.length})
                    </h3>
                    {products.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Belum ada produk. Klik "Tambah Item" untuk menambahkan.</p>
                    ) : (
                        <div className="grid gap-4">
                            {products.map(item => (
                                <div key={item.id} className={`flex items-center justify-between p-4 border rounded-xl ${!item.is_active ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-semibold text-gray-900">{item.name}</h4>
                                            {!item.is_active && <span className="text-xs px-2 py-1 bg-gray-200 rounded-full">Nonaktif</span>}
                                        </div>
                                        <p className="text-cyan-500 font-bold">Rp {item.price?.toLocaleString('id-ID')}/{item.unit}</p>
                                        {item.description && <p className="text-sm text-gray-500 mt-1">{item.description}</p>}
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleToggleActive(item)} className={`px-3 py-2 rounded-lg ${item.is_active ? 'bg-gray-100 hover:bg-gray-200' : 'bg-green-100 hover:bg-green-200'}`}>
                                            <i className={`fas ${item.is_active ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                        <button onClick={() => openEditModal(item)} className="px-3 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button onClick={() => handleDelete(item)} className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                {editingItem ? 'Edit Item' : 'Tambah Item Baru'}
                            </h3>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                                    <select
                                        name="type"
                                        value={form.type}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500"
                                    >
                                        <option value="Layanan">Layanan</option>
                                        <option value="Produk">Produk</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500"
                                        placeholder="Nama layanan/produk"
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Harga *</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={form.price}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500"
                                            placeholder="10000"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                                        <select
                                            name="unit"
                                            value={form.unit}
                                            onChange={handleFormChange}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500"
                                        >
                                            <option value="kg">kg</option>
                                            <option value="pcs">pcs</option>
                                            <option value="set">set</option>
                                            <option value="pasang">pasang</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                    <textarea
                                        name="description"
                                        value={form.description}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500"
                                        rows="3"
                                        placeholder="Deskripsi singkat (opsional)"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-rose-600 transition-all disabled:opacity-50"
                                    >
                                        {saving ? 'Menyimpan...' : 'Simpan'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PartnerItemsPage;
