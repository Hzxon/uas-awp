import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { layananApi, produkApi } from "../api";
import AdminAnalytics from "./admin/AdminAnalytics";
import AdminPartnerApproval from "./admin/AdminPartnerApproval";

const emptyEntry = { nama: "", deskripsi: "", harga: "", image: "" };
const formatRupiah = (value) => `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
const normalizeList = (items) =>
  Array.isArray(items)
    ? items.map((item) => ({ ...item, harga: Number(item.harga || 0) }))
    : [];

const AdminPage = ({ userName, onLogout, authToken }) => {
  const navigate = useNavigate();
  const [layanan, setLayanan] = useState([]);
  const [produk, setProduk] = useState([]);
  const [activeTab, setActiveTab] = useState("layanan");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [lastSync, setLastSync] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  const [newLayanan, setNewLayanan] = useState(emptyEntry);
  const [newProduk, setNewProduk] = useState(emptyEntry);

  const [editingLayananId, setEditingLayananId] = useState(null);
  const [editingProdukId, setEditingProdukId] = useState(null);
  const [editLayanan, setEditLayanan] = useState(emptyEntry);
  const [editProduk, setEditProduk] = useState(emptyEntry);

  // Effect untuk menerapkan dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMsg("");
      const [layananRes, produkRes] = await Promise.all([
        layananApi.list(authToken),
        produkApi.list(authToken),
      ]);
      setLayanan(normalizeList(layananRes));
      setProduk(normalizeList(produkRes));
      setLastSync(new Date());
    } catch (err) {
      console.error("Gagal load data admin:", err);
      setErrorMsg("Gagal memuat data master. Pastikan token admin aktif & role admin.");
      alert("Gagal memuat data master. Pastikan token admin aktif & role admin.");
    } finally {
      setIsLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    if (authToken) {
      fetchAll();
    }
  }, [authToken, fetchAll]);

  useEffect(() => {
    setEditingLayananId(null);
    setEditingProdukId(null);
    setEditLayanan(emptyEntry);
    setEditProduk(emptyEntry);
  }, [activeTab]);

  const handleImageUpload = (file, setter) => {
    if (!file) {
      setter((prev) => ({ ...prev, image: "" }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () =>
      setter((prev) => ({
        ...prev,
        image: typeof reader.result === "string" ? reader.result : "",
      }));
    reader.readAsDataURL(file);
  };

  const buildPayload = (data) => {
    const payload = {
      nama: data.nama.trim(),
      deskripsi: data.deskripsi.trim(),
      harga: Number(data.harga),
    };
    if (!payload.nama || Number.isNaN(payload.harga)) {
      throw new Error("Nama dan harga wajib diisi dengan benar");
    }
    if (data.image) {
      payload.image = data.image;
    }
    return payload;
  };

  const handleCreateLayanan = async (e) => {
    e.preventDefault();
    try {
      const payload = buildPayload(newLayanan);
      const created = await layananApi.create(authToken, payload);
      setLayanan((prev) => [...prev, { ...created, harga: Number(created.harga) }]);
      setNewLayanan(emptyEntry);
      setLastSync(new Date());
    } catch (err) {
      console.error("Gagal tambah layanan:", err);
      alert(err.message || "Gagal menambah layanan");
    }
  };

  const handleDeleteLayanan = async (id) => {
    if (!window.confirm("Hapus layanan ini?")) return;
    try {
      await layananApi.remove(authToken, id);
      setLayanan((prev) => prev.filter((l) => l.id !== id));
      setLastSync(new Date());
    } catch (err) {
      console.error("Gagal hapus layanan:", err);
      alert("Gagal menghapus layanan");
    }
  };

  const handleCreateProduk = async (e) => {
    e.preventDefault();
    try {
      const payload = buildPayload(newProduk);
      const created = await produkApi.create(authToken, payload);
      setProduk((prev) => [...prev, { ...created, harga: Number(created.harga) }]);
      setNewProduk(emptyEntry);
      setLastSync(new Date());
    } catch (err) {
      console.error("Gagal tambah produk:", err);
      alert(err.message || "Gagal menambah produk");
    }
  };

  const handleDeleteProduk = async (id) => {
    if (!window.confirm("Hapus produk ini?")) return;
    try {
      await produkApi.remove(authToken, id);
      setProduk((prev) => prev.filter((p) => p.id !== id));
      setLastSync(new Date());
    } catch (err) {
      console.error("Gagal hapus produk:", err);
      alert("Gagal menghapus produk");
    }
  };

  const startEditLayanan = (item) => {
    setEditingLayananId(item.id);
    setEditLayanan({
      nama: item.nama || "",
      deskripsi: item.deskripsi || "",
      harga: item.harga?.toString() || "",
      image: item.image || "",
    });
  };

  const startEditProduk = (item) => {
    setEditingProdukId(item.id);
    setEditProduk({
      nama: item.nama || "",
      deskripsi: item.deskripsi || "",
      harga: item.harga?.toString() || "",
      image: item.image || "",
    });
  };

  const cancelEditLayanan = () => {
    setEditingLayananId(null);
    setEditLayanan(emptyEntry);
  };

  const cancelEditProduk = () => {
    setEditingProdukId(null);
    setEditProduk(emptyEntry);
  };

  const handleUpdateLayanan = async (id) => {
    try {
      const payload = buildPayload(editLayanan);
      const updated = await layananApi.update(authToken, id, payload);
      setLayanan((prev) =>
        prev.map((item) =>
          item.id === id ? { ...updated, harga: Number(updated.harga) } : item
        )
      );
      cancelEditLayanan();
      setLastSync(new Date());
    } catch (err) {
      console.error("Gagal update layanan:", err);
      alert(err.message || "Gagal memperbarui layanan");
    }
  };

  const handleUpdateProduk = async (id) => {
    try {
      const payload = buildPayload(editProduk);
      const updated = await produkApi.update(authToken, id, payload);
      setProduk((prev) =>
        prev.map((item) =>
          item.id === id ? { ...updated, harga: Number(updated.harga) } : item
        )
      );
      cancelEditProduk();
      setLastSync(new Date());
    } catch (err) {
      console.error("Gagal update produk:", err);
      alert(err.message || "Gagal memperbarui produk");
    }
  };

  const listData = activeTab === "layanan" ? layanan : produk;
  const isEditing = (id) =>
    activeTab === "layanan" ? editingLayananId === id : editingProdukId === id;
  const totalHarga = listData.reduce((sum, item) => sum + Number(item.harga || 0), 0);
  const avgHarga = listData.length ? totalHarga / listData.length : 0;
  const lastSyncLabel = lastSync
    ? lastSync.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    : "Belum sinkron";
  const refreshAll = () => {
    fetchAll();
  };
  const accent =
    activeTab === "layanan"
      ? {
        pill: "bg-blue-50 text-blue-700 border-blue-200",
        button: "bg-blue-600 hover:bg-blue-700 shadow-blue-500/30",
        tone: "text-blue-700",
        header: "bg-blue-50 text-blue-800 border-blue-100",
        ring: "focus:ring-blue-300",
      }
      : {
        pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
        button: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30",
        tone: "text-emerald-700",
        header: "bg-emerald-50 text-emerald-800 border-emerald-100",
        ring: "focus:ring-emerald-300",
      };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_32%),radial-gradient(circle_at_85%_15%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_70%_80%,rgba(96,165,250,0.1),transparent_30%)]" />
      <header className="admin-navbar">
        <div className="admin-navbar-container">
          <div className="admin-navbar-brand">
            <span className="logo-icon">
              <i className="fas fa-water"></i>
            </span>
            <div className="brand-info">
              <span className="brand-label">Admin Panel</span>
              <span className="brand-name">
                WashFast <span className="logo-sparkle">✨</span>
                <span className="badge">{userName || "Admin"}</span>
              </span>
            </div>
          </div>
          <div className="admin-navbar-actions">
            <button
              onClick={() => navigate("/admin/orders")}
              className="nav-btn"
            >
              <i className="fas fa-receipt"></i>
              <span>Order History</span>
            </button>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="icon-btn theme-toggle"
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <i className="fas fa-sun"></i>
              ) : (
                <i className="fas fa-moon"></i>
              )}
            </button>
            <button
              onClick={() => navigate("/")}
              className="nav-btn primary"
            >
              <i className="fas fa-sign-out-alt"></i>
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[260px,1fr]">
        <aside className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-sky-500 to-emerald-400 text-lg font-semibold text-white shadow-lg shadow-blue-500/30">
              WF
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Admin cockpit</p>
              <h1 className="text-xl font-bold text-slate-900">WashFast</h1>
            </div>
          </div>

          <div className="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">Login sebagai</p>
                <p className="text-sm font-semibold text-slate-900">{userName || "Admin"}</p>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                Admin
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live mode</span>
              <span className="mx-2 h-3 w-[1px] bg-slate-200" />
              <span>Sinkron {lastSyncLabel}</span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {["analytics", "partners", "layanan", "produk"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm font-semibold transition ${activeTab === tab
                  ? tab === "analytics"
                    ? "border-pink-200 bg-pink-50 text-pink-700 shadow-lg shadow-pink-200/60"
                    : tab === "partners"
                      ? "border-purple-200 bg-purple-50 text-purple-700 shadow-lg shadow-purple-200/60"
                      : tab === "layanan"
                        ? "border-blue-200 bg-blue-50 text-blue-700 shadow-lg shadow-blue-200/60"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-200/60"
                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
              >
                <span className="flex items-center gap-2">
                  <i className={`fas ${tab === "analytics" ? "fa-chart-line" :
                    tab === "partners" ? "fa-store" :
                      tab === "layanan" ? "fa-tshirt" : "fa-box"
                    }`}></i>
                  {tab === "analytics" ? "Analytics" : tab === "partners" ? "Partner" : tab === "layanan" ? "Layanan" : "Produk"}
                </span>
                <span className="text-xs text-slate-500">
                  {tab === "layanan" ? `${layanan.length}` : tab === "produk" ? `${produk.length}` : ""}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <main className="space-y-6">
          {/* Render Analytics or Partners tabs */}
          {activeTab === "analytics" && (
            <AdminAnalytics token={authToken} />
          )}

          {activeTab === "partners" && (
            <AdminPartnerApproval token={authToken} />
          )}

          {/* Original Layanan/Produk content */}
          {(activeTab === "layanan" || activeTab === "produk") && (
            <>
              <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-blue-50 via-white to-emerald-50 shadow-xl">
                <div className="absolute -left-16 -top-10 h-52 w-52 rounded-full bg-blue-200/60 blur-3xl" />
                <div className="absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-emerald-200/60 blur-3xl" />
                <div className="relative p-6 md:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-2xl space-y-2">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">Master data</p>
                      <h2 className="text-3xl font-bold text-slate-900">Kelola layanan & produk dengan tenang</h2>
                      <p className="text-sm text-slate-600">
                        CRUD langsung ke database dengan panel ringan. Pantau jumlah item, harga rata-rata, dan lakukan edit cepat tanpa kehilangan konteks.
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2 text-right">
                      <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-wide ${accent.pill}`}>
                        Tab aktif: {activeTab === "layanan" ? "Layanan" : "Produk"}
                      </span>
                      <span className="text-xs text-slate-600">Terakhir sinkron: {lastSyncLabel}</span>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      onClick={fetchAll}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Refresh data
                    </button>
                    <a
                      href="#admin-form"
                      className={`rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition ${accent.button}`}
                    >
                      Tambah cepat
                    </a>
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      Realtime ready
                    </button>
                  </div>
                </div>
              </section>

              <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-blue-100/80">
                  <p className="text-xs text-slate-500">Total layanan</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{layanan.length}</p>
                  <p className="text-[11px] text-slate-500">Semua jenis servis</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-emerald-100/80">
                  <p className="text-xs text-slate-500">Total produk</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{produk.length}</p>
                  <p className="text-[11px] text-slate-500">Item add-on & pendukung</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-cyan-100/80">
                  <p className="text-xs text-slate-500">Rata harga ({activeTab})</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{formatRupiah(avgHarga)}</p>
                  <p className="text-[11px] text-slate-500">Mengukur kewajaran harga</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-md shadow-indigo-100/80">
                  <p className="text-xs text-slate-500">Total nilai ({activeTab})</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{formatRupiah(totalHarga)}</p>
                  <p className="text-[11px] text-slate-500">Akumulasi harga list aktif</p>
                </div>
              </section>

              <section className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur">
                {errorMsg && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {errorMsg}
                  </div>
                )}

                {isLoading ? (
                  <div className="grid gap-6 lg:grid-cols-[1fr,1.4fr]">
                    <div className="space-y-3">
                      <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
                      <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
                      <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
                      <div className="h-12 animate-pulse rounded-xl bg-slate-200" />
                      <div className="h-11 animate-pulse rounded-xl bg-slate-200" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-10 w-48 animate-pulse rounded bg-slate-200" />
                      <div className="h-64 animate-pulse rounded-2xl bg-slate-200" />
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-6 lg:grid-cols-[1fr,1.4fr]">
                    <div id="admin-form" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-md">
                      {activeTab === "layanan" ? (
                        <>
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <div>
                              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Form</p>
                              <h3 className="text-lg font-semibold text-slate-900">Tambah layanan</h3>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${accent.pill}`}>
                              Layanan
                            </span>
                          </div>
                          <form onSubmit={handleCreateLayanan} className="space-y-3">
                            <label className="block text-xs text-slate-600">
                              Nama layanan
                              <input
                                className={`mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring ${accent.ring}`}
                                placeholder="Cuci kiloan express"
                                value={newLayanan.nama}
                                onChange={(e) => setNewLayanan((p) => ({ ...p, nama: e.target.value }))}
                                required
                              />
                            </label>
                            <label className="block text-xs text-slate-600">
                              Deskripsi
                              <textarea
                                className={`mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring ${accent.ring}`}
                                placeholder="Detail layanan / SLA"
                                rows={3}
                                value={newLayanan.deskripsi}
                                onChange={(e) => setNewLayanan((p) => ({ ...p, deskripsi: e.target.value }))}
                              />
                            </label>
                            <label className="block text-xs text-slate-600">
                              Gambar (opsional)
                              <div className="mt-1 flex items-center gap-3">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border file:border-slate-200 file:bg-slate-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-100"
                                  onChange={(e) => handleImageUpload(e.target.files?.[0] || null, setNewLayanan)}
                                />
                                {newLayanan.image && <span className="text-[11px] text-slate-500">Preview di bawah</span>}
                              </div>
                              {newLayanan.image && (
                                <img
                                  src={newLayanan.image}
                                  alt="Preview layanan"
                                  className="mt-2 h-16 w-16 rounded-lg border border-slate-200 object-cover"
                                />
                              )}
                            </label>
                            <label className="block text-xs text-slate-600">
                              Harga (Rp)
                              <input
                                className={`mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring ${accent.ring}`}
                                placeholder="35000"
                                type="number"
                                value={newLayanan.harga}
                                onChange={(e) => setNewLayanan((p) => ({ ...p, harga: e.target.value }))}
                                required
                              />
                            </label>
                            <button
                              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition ${accent.button}`}
                            >
                              Simpan layanan
                            </button>
                          </form>
                        </>
                      ) : (
                        <>
                          <div className="mb-3 flex items-center justify-between gap-2">
                            <div>
                              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Form</p>
                              <h3 className="text-lg font-semibold text-slate-900">Tambah produk</h3>
                            </div>
                            <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${accent.pill}`}>
                              Produk
                            </span>
                          </div>
                          <form onSubmit={handleCreateProduk} className="space-y-3">
                            <label className="block text-xs text-slate-600">
                              Nama produk
                              <input
                                className={`mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring ${accent.ring}`}
                                placeholder="Deterjen premium"
                                value={newProduk.nama}
                                onChange={(e) => setNewProduk((p) => ({ ...p, nama: e.target.value }))}
                                required
                              />
                            </label>
                            <label className="block text-xs text-slate-600">
                              Deskripsi
                              <textarea
                                className={`mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring ${accent.ring}`}
                                placeholder="Komposisi, manfaat, dsb."
                                rows={3}
                                value={newProduk.deskripsi}
                                onChange={(e) => setNewProduk((p) => ({ ...p, deskripsi: e.target.value }))}
                              />
                            </label>
                            <label className="block text-xs text-slate-600">
                              Gambar (opsional)
                              <div className="mt-1 flex items-center gap-3">
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border file:border-slate-200 file:bg-slate-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-100"
                                  onChange={(e) => handleImageUpload(e.target.files?.[0] || null, setNewProduk)}
                                />
                                {newProduk.image && <span className="text-[11px] text-slate-500">Preview di bawah</span>}
                              </div>
                              {newProduk.image && (
                                <img
                                  src={newProduk.image}
                                  alt="Preview produk"
                                  className="mt-2 h-16 w-16 rounded-lg border border-slate-200 object-cover"
                                />
                              )}
                            </label>
                            <label className="block text-xs text-slate-600">
                              Harga (Rp)
                              <input
                                className={`mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring ${accent.ring}`}
                                placeholder="15000"
                                type="number"
                                value={newProduk.harga}
                                onChange={(e) => setNewProduk((p) => ({ ...p, harga: e.target.value }))}
                                required
                              />
                            </label>
                            <button
                              className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition ${accent.button}`}
                            >
                              Simpan produk
                            </button>
                          </form>
                        </>
                      )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white shadow-md p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Daftar</p>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {activeTab === "layanan" ? "Layanan" : "Produk"}
                          </h3>
                        </div>
                        <span className="text-xs text-slate-600">Total: {listData.length}</span>
                      </div>

                      {listData.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
                          Belum ada data. <a href="#admin-form" className="text-blue-600 font-semibold">Tambah pertama</a>
                        </div>
                      ) : (
                        <div className="grid gap-4 sm:grid-cols-2">
                          {listData.map((item) => {
                            const editing = isEditing(item.id);
                            const current = activeTab === "layanan" ? editLayanan : editProduk;
                            const setCurrent =
                              activeTab === "layanan" ? setEditLayanan : setEditProduk;
                            const handleSave =
                              activeTab === "layanan"
                                ? () => handleUpdateLayanan(item.id)
                                : () => handleUpdateProduk(item.id);
                            const handleCancel =
                              activeTab === "layanan" ? cancelEditLayanan : cancelEditProduk;

                            return (
                              <div
                                key={item.id}
                                className={`rounded-xl border ${editing ? "border-blue-200 bg-blue-50/50" : "border-slate-200 bg-white"
                                  } shadow-sm p-4 flex flex-col gap-3`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="h-16 w-16 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex-shrink-0">
                                    {item.image ? (
                                      <img src={item.image} alt={item.nama} className="h-full w-full object-cover" />
                                    ) : (
                                      <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
                                        No image
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    {editing ? (
                                      <input
                                        className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400 focus:ring ${accent.ring}`}
                                        value={current.nama}
                                        onChange={(e) => setCurrent((p) => ({ ...p, nama: e.target.value }))}
                                      />
                                    ) : (
                                      <h4 className="text-base font-semibold text-slate-900">{item.nama}</h4>
                                    )}
                                    {editing ? (
                                      <textarea
                                        className={`mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring ${accent.ring}`}
                                        rows={2}
                                        value={current.deskripsi}
                                        onChange={(e) => setCurrent((p) => ({ ...p, deskripsi: e.target.value }))}
                                      />
                                    ) : (
                                      <p className="text-sm text-slate-600 line-clamp-3">{item.deskripsi || "-"}</p>
                                    )}
                                  </div>
                                </div>

                                {editing ? (
                                  <div className="space-y-2">
                                    <label className="block text-xs text-slate-600">
                                      Harga (Rp)
                                      <input
                                        className={`mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring ${accent.ring}`}
                                        type="number"
                                        value={current.harga}
                                        onChange={(e) => setCurrent((p) => ({ ...p, harga: e.target.value }))}
                                      />
                                    </label>
                                    <label className="block text-xs text-slate-600">
                                      Gambar (opsional)
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="mt-1 block w-full text-xs text-slate-600 file:mr-3 file:rounded-lg file:border file:border-slate-200 file:bg-slate-50 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-100"
                                        onChange={(e) => handleImageUpload(e.target.files?.[0] || null, setCurrent)}
                                      />
                                      {current.image && (
                                        <img
                                          src={current.image}
                                          alt="Preview"
                                          className="mt-2 h-16 w-16 rounded-lg border border-slate-200 object-cover"
                                        />
                                      )}
                                    </label>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 text-sm">
                                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800">
                                      {formatRupiah(item.harga)}
                                    </span>
                                  </div>
                                )}

                                <div className="flex gap-2">
                                  {editing ? (
                                    <>
                                      <button
                                        onClick={handleSave}
                                        className="flex-1 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600"
                                      >
                                        Simpan
                                      </button>
                                      <button
                                        onClick={handleCancel}
                                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                      >
                                        Batal
                                      </button>
                                    </>
                                  ) : (
                                    <>
                                      <button
                                        onClick={() =>
                                          activeTab === "layanan" ? startEditLayanan(item) : startEditProduk(item)
                                        }
                                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() =>
                                          activeTab === "layanan"
                                            ? handleDeleteLayanan(item.id)
                                            : handleDeleteProduk(item.id)
                                        }
                                        className="flex-1 rounded-lg bg-red-500/90 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600"
                                      >
                                        Hapus
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </section>
            </>
          )}

        </main>
      </div>
    </div>
  );
};

export default AdminPage;
