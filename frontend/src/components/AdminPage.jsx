import React, { useEffect, useState } from "react";
import { API_BASE_URL, layananApi, produkApi } from "../api";

const AdminPage = ({ userName, onLogout, authToken }) => {
  const [layanan, setLayanan] = useState([]);
  const [produk, setProduk] = useState([]);

  const [newLayanan, setNewLayanan] = useState({ nama: "", deskripsi: "", harga: "" });
  const [newProduk, setNewProduk] = useState({ nama: "", deskripsi: "", harga: "" });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const layananRes = await layananApi.list(authToken);
        setLayanan(Array.isArray(layananRes) ? layananRes : []);

        const produkRes = await produkApi.list(authToken);
        setProduk(Array.isArray(produkRes) ? produkRes : []);
      } catch (err) {
        console.error("Gagal load data admin:", err);
      }
    };
    fetchAll();
  }, [authToken]);

  const handleCreateLayanan = async (e) => {
    e.preventDefault();
    try {
      const body = {
        nama: newLayanan.nama,
        deskripsi: newLayanan.deskripsi,
        harga: Number(newLayanan.harga),
      };

      await fetch(`${API_BASE_URL}/layanan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });

      setNewLayanan({ nama: "", deskripsi: "", harga: "" });
      const layananRes = await layananApi.list(authToken);
      setLayanan(Array.isArray(layananRes) ? layananRes : []);
    } catch (err) {
      console.error("Gagal tambah layanan:", err);
      alert("Gagal menambah layanan");
    }
  };

  const handleDeleteLayanan = async (id) => {
    if (!window.confirm("Hapus layanan ini?")) return;
    try {
      await fetch(`${API_BASE_URL}/layanan/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setLayanan((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error("Gagal hapus layanan:", err);
      alert("Gagal menghapus layanan");
    }
  };

  const handleCreateProduk = async (e) => {
    e.preventDefault();
    try {
      const body = {
        nama: newProduk.nama,
        deskripsi: newProduk.deskripsi,
        harga: Number(newProduk.harga),
      };

      await fetch(`${API_BASE_URL}/produk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });

      setNewProduk({ nama: "", deskripsi: "", harga: "" });
      const produkRes = await produkApi.list(authToken);
      setProduk(Array.isArray(produkRes) ? produkRes : []);
    } catch (err) {
      console.error("Gagal tambah produk:", err);
      alert("Gagal menambah produk");
    }
  };

  const handleDeleteProduk = async (id) => {
    if (!window.confirm("Hapus produk ini?")) return;
    try {
      await fetch(`${API_BASE_URL}/produk/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      setProduk((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Gagal hapus produk:", err);
      alert("Gagal menghapus produk");
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">Admin Panel</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">
              Halo, {userName} <span className="text-xs text-yellow-700">(Admin)</span>
            </span>
            <button
              onClick={onLogout}
              className="text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
            >
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* LAYANAN */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Kelola Layanan</h2>

          <form onSubmit={handleCreateLayanan} className="mb-4 flex flex-wrap gap-2">
            <input
              className="border rounded px-2 py-1 text-sm"
              placeholder="Nama layanan"
              value={newLayanan.nama}
              onChange={(e) => setNewLayanan((p) => ({ ...p, nama: e.target.value }))}
            />
            <input
              className="border rounded px-2 py-1 text-sm w-64"
              placeholder="Deskripsi"
              value={newLayanan.deskripsi}
              onChange={(e) => setNewLayanan((p) => ({ ...p, deskripsi: e.target.value }))}
            />
            <input
              className="border rounded px-2 py-1 text-sm w-24"
              placeholder="Harga"
              type="number"
              value={newLayanan.harga}
              onChange={(e) => setNewLayanan((p) => ({ ...p, harga: e.target.value }))}
            />
            <button className="bg-blue-600 text-white text-sm px-3 py-1 rounded">
              Tambah
            </button>
          </form>

          <table className="w-full text-sm bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Nama</th>
                <th className="p-2 text-left">Deskripsi</th>
                <th className="p-2 text-right">Harga</th>
                <th className="p-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {layanan.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="p-2">{l.nama}</td>
                  <td className="p-2 text-gray-600">{l.deskripsi}</td>
                  <td className="p-2 text-right">
                    Rp {l.harga.toLocaleString("id-ID")}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleDeleteLayanan(l.id)}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {layanan.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-2 text-center text-gray-500">
                    Belum ada layanan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* PRODUK */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Kelola Produk</h2>

          <form onSubmit={handleCreateProduk} className="mb-4 flex flex-wrap gap-2">
            <input
              className="border rounded px-2 py-1 text-sm"
              placeholder="Nama produk"
              value={newProduk.nama}
              onChange={(e) => setNewProduk((p) => ({ ...p, nama: e.target.value }))}
            />
            <input
              className="border rounded px-2 py-1 text-sm w-64"
              placeholder="Deskripsi"
              value={newProduk.deskripsi}
              onChange={(e) => setNewProduk((p) => ({ ...p, deskripsi: e.target.value }))}
            />
            <input
              className="border rounded px-2 py-1 text-sm w-24"
              placeholder="Harga"
              type="number"
              value={newProduk.harga}
              onChange={(e) => setNewProduk((p) => ({ ...p, harga: e.target.value }))}
            />
            <button className="bg-blue-600 text-white text-sm px-3 py-1 rounded">
              Tambah
            </button>
          </form>

          <table className="w-full text-sm bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Nama</th>
                <th className="p-2 text-left">Deskripsi</th>
                <th className="p-2 text-right">Harga</th>
                <th className="p-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {produk.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{p.nama}</td>
                  <td className="p-2 text-gray-600">{p.deskripsi}</td>
                  <td className="p-2 text-right">
                    Rp {p.harga.toLocaleString("id-ID")}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleDeleteProduk(p.id)}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {produk.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-2 text-center text-gray-500">
                    Belum ada produk.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};

export default AdminPage;
