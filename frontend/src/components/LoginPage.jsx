import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginPage = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Login attempt:", email);
        onLogin(true); // Mengatur status login di App.jsx
        navigate('/'); // Arahkan ke Beranda
    };

    return (
        <div className="bg-gray-100 flex items-center justify-center min-h-screen">
            <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Selamat Datang Kembali!</h2>
                <form onSubmit={handleSubmit}>
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
                    <button type="submit" 
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-md">
                        Masuk
                    </button>
                </form>
                <p className="text-center text-sm text-gray-600 mt-6">
                    Belum punya akun? 
                    <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">Daftar di sini</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;