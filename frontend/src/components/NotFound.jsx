const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-800 px-4">
    <div className="max-w-md w-full bg-white border border-slate-200 shadow-md rounded-2xl p-6 text-center space-y-3">
      <h1 className="text-2xl font-bold">Halaman tidak ditemukan</h1>
      <p className="text-sm text-slate-600">Periksa URL atau kembali ke beranda.</p>
      <a
        href="/"
        className="inline-flex justify-center px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
      >
        Kembali ke beranda
      </a>
    </div>
  </div>
);

export default NotFound;
