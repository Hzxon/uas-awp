import React, { useState } from 'react';
import { authApi } from '../api';

const ModalAuth = ({ type, onClose, onLoginSuccess, onRegisterSuccess, setModalType }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isLogin = type === 'login';

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            if (isLogin) {
                const data = await authApi.login(email, password);
                onLoginSuccess?.(data);
            } else {
                const data = await authApi.signup(name, email, password);
                onRegisterSuccess?.(data);
            }
        } catch (err) {
            setError(err.message || 'Gagal memproses permintaan');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900 bg-opacity-75 backdrop-blur-sm transition-opacity" onClick={onClose}>
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6 border-b pb-3">
                    <h2 className="text-3xl font-bold text-blue-700">
                        {isLogin ? 'Masuk Akun' : 'Daftar Akun Baru'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 text-2xl">
                        &times;
                    </button>
                </div>
                
                <form onSubmit={handleSubmit}>
                    {!isLogin && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap *</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
                                placeholder="Masukkan nama Anda"/>
                        </div>
                    )}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                               placeholder="Masukkan email Anda"/>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kata Sandi</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required 
                               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                               placeholder="Masukkan kata sandi"/>
                    </div>
                    {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
                    <button type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-md disabled:opacity-60 disabled:cursor-not-allowed">
                        {isLogin ? (isSubmitting ? 'Memproses...' : 'Masuk') : (isSubmitting ? 'Memproses...' : 'Daftar')}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
                    <button 
                        onClick={() => setModalType(isLogin ? 'register' : 'login')}
                        className="text-blue-600 hover:text-blue-800 font-medium ml-1">
                        {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default ModalAuth;
