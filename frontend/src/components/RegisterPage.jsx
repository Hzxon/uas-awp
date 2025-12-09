import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Konfirmasi password harus sama persis.');
      return;
    }

    console.log("Register attempt:", name, email);
    alert('Pendaftaran berhasil! Silakan masuk.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,#2dd4bf22,transparent_40%),radial-gradient(circle_at_bottom_right,#60a5fa22,transparent_35%)]" />
      <div className="relative w-full max-w-4xl grid md:grid-cols-[1.05fr_1fr] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-white/5 backdrop-blur">
        <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-800">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold">
              <i className="fas fa-bolt text-amber-300"></i> Laundry on-demand
            </div>
            <h2 className="text-3xl font-bold leading-tight">Gabung dan nikmati laundry tanpa antre.</h2>
            <p className="text-sm text-white/80">
              Daftar untuk simpan alamat favorit, jadwalkan jemput otomatis, dan dapatkan promo khusus member.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-white/70">
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Jadwal fleksibel</span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Kurir terverifikasi</span>
            <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">Promo member</span>
          </div>
        </div>

        <div className="bg-white text-slate-900 p-8 md:p-10">
          <div className="mb-6">
            <p className="text-xs uppercase tracking-wide text-slate-500">Mulai gratis</p>
            <h2 className="text-3xl font-bold">Daftar WashFast</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Nama lengkap</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="Masukkan nama Anda"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="email@contoh.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Kata sandi</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="********"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Ulangi kata sandi</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                placeholder="********"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition duration-150 shadow-sm"
            >
              Daftar Sekarang
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Sudah punya akun?
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold ml-1">Masuk di sini</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
