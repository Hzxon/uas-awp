import React, { useState } from 'react';
import { authApi } from '../api';

const ModalAuth = ({ type, onClose, onLoginSuccess, onRegisterSuccess, setModalType }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLogin = type === 'login';

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!isLogin && password !== confirmPassword) {
        throw new Error('Konfirmasi password tidak sama');
      }
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6 bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl grid md:grid-cols-[1.05fr_1fr] rounded-card overflow-hidden shadow-2xl border border-slate-200 bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left visual */}
        <div className="hidden md:flex flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-800 text-white p-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-sm font-medium">
              <i className="fas fa-bolt text-amber-400"></i> Laundry on-demand
            </div>
            <h2 className="text-3xl font-bold leading-tight">
              Rapi. Wangi. Antrean aman.
            </h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Masuk untuk melanjutkan pesanan, lacak kurir, dan simpan preferensi cucian Anda.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-white/70">
            <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10">Same day ready</span>
            <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10">Kurir terverifikasi</span>
            <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10">Garansi ulang gratis</span>
          </div>
        </div>

        {/* Right form */}
        <div className="bg-white p-8 md:p-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">{isLogin ? 'Selamat datang kembali' : 'Mulai gratis'}</p>
              <h2 className="text-3xl font-bold text-slate-900">
                {isLogin ? 'Masuk WashFast' : 'Daftar WashFast'}
              </h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl">
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
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
            )}
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
            {!isLogin && (
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
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 text-white py-3 rounded-button font-semibold hover:bg-primary-700 transition-colors shadow-soft disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLogin ? (isSubmitting ? 'Memproses...' : 'Masuk') : (isSubmitting ? 'Memproses...' : 'Daftar')}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
            <button
              onClick={() => setModalType(isLogin ? 'register' : 'login')}
              className="text-primary-600 hover:text-primary-700 font-semibold ml-1 transition-colors"
            >
              {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModalAuth;
