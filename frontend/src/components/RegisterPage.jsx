import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault();

        console.log("Register attempt:", name, email);
        alert('Pendaftaran berhasil! Silakan masuk.');
        navigate('/login'); 
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg">
                <h2 className="text-3xl font-bold text-center text-green-600 mb-6">Buat Akun Baru</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nama Lengkap</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required 
                               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"/>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
                               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"/>
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Kata Sandi</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required 
                               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"/>
                    </div>
                    <button type="submit" 
                            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition duration-200 shadow-md">
                        Daftar Sekarang
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-6">
                    Sudah punya akun? 
                    <Link to="/login" className="text-green-600 hover:text-green-800 font-medium">Masuk di sini</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;