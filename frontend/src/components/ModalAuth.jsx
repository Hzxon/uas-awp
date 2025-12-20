import React, { useState, useEffect, useRef } from 'react';
import { authApi } from '../api';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const ModalAuth = ({ type, onClose, onLoginSuccess, onRegisterSuccess, setModalType }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleButtonRef = useRef(null);

  const isLogin = type === 'login';

  // Initialize Google Sign-In
  useEffect(() => {
    if (window.google && googleButtonRef.current) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: isLogin ? 'signin_with' : 'signup_with',
        shape: 'pill',
      });
    }
  }, [isLogin]);

  const handleGoogleResponse = async (response) => {
    setError('');
    setIsSubmitting(true);
    try {
      const data = await authApi.googleLogin(response.credential);
      onLoginSuccess?.(data);
    } catch (err) {
      setError(err.message || 'Gagal login dengan Google');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        className="relative w-full max-w-4xl grid md:grid-cols-[1.05fr_1fr] rounded-2xl overflow-hidden shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left visual - Clean image only */}
        <div className="hidden md:block relative overflow-hidden">
          <img
            src="/laundry-auth-banner.png"
            alt="WashFast Laundry"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right form - Light beach theme */}
        <div className="bg-gradient-to-b from-cyan-50 via-white to-amber-50 p-8 md:p-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                {isLogin ? 'Masuk WashFast' : 'Daftar WashFast'}
              </h2>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 text-2xl transition-colors">
              &times;
            </button>
          </div>

          {/* Google Sign-In Button */}
          <div className="mb-4">
            <div ref={googleButtonRef} className="w-full flex justify-center"></div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-sm text-slate-400">atau</span>
            <div className="flex-1 h-px bg-slate-200"></div>
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
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
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
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
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
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
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
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 transition-all"
                  placeholder="********"
                />
              </div>
            )}
            {error && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-400 to-amber-500 text-white py-3 rounded-xl font-semibold hover:from-orange-500 hover:to-amber-600 transition-all shadow-lg shadow-orange-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLogin ? (isSubmitting ? 'Memproses...' : 'Masuk') : (isSubmitting ? 'Memproses...' : 'Daftar')}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            {isLogin ? "Belum punya akun?" : "Sudah punya akun?"}
            <button
              onClick={() => setModalType(isLogin ? 'register' : 'login')}
              className="text-teal-600 hover:text-teal-700 font-semibold ml-1 transition-colors"
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
