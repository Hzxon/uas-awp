import React from "react";
import MapPicker from "./MapPicker";

const categories = ["Rumah", "Kost", "Kantor", "Hotel", "Apartemen"];
const contactTypes = ["Individu", "Perusahaan"];

const AddressFormPanel = ({
  addresses = [],
  selectedAddressId,
  setSelectedAddressId,
  addressForm,
  setAddressForm,
  onSubmit,
  onCancel,
  isAdding,
  isLoading,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-100 to-pink-50 px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3 text-slate-800">
          <span className="h-8 w-8 inline-flex items-center justify-center rounded-full bg-orange-500 text-white">
            <i className="fas fa-location-dot"></i>
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Informasi Penjemputan</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Alamat Pickup</h3>
          <button
            onClick={onCancel}
            className={isAdding
              ? "text-sm text-slate-600 hover:text-slate-800 font-medium"
              : "inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-400 rounded-full hover:from-orange-600 hover:to-orange-500 shadow-md hover:shadow-lg transition-all"
            }
          >
            {isAdding ? (
              "← Pilih alamat tersimpan"
            ) : (
              <>
                <i className="fas fa-plus"></i>
                Tambah alamat baru
              </>
            )}
          </button>
        </div>

        {!isAdding && (
          <>
            {isLoading && <p className="text-sm text-slate-500">Memuat alamat...</p>}
            {!isLoading && addresses.length === 0 && (
              <p className="text-sm text-red-600">Belum ada alamat tersimpan. Tambah alamat baru.</p>
            )}
            <div className="grid gap-3">
              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${selectedAddressId === addr.id ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-200"
                    }`}
                >
                  <input
                    type="radio"
                    checked={selectedAddressId === addr.id}
                    onChange={() => setSelectedAddressId(addr.id)}
                    className="mt-1"
                  />
                  <div className="text-sm text-slate-700">
                    <p className="font-semibold">{addr.label} • {addr.nama_penerima}</p>
                    <p>{addr.alamat}</p>
                    {addr.phone && <p className="text-slate-500">Telp: {addr.phone}</p>}
                  </div>
                </label>
              ))}
            </div>
          </>
        )}

        {isAdding && (
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setAddressForm((p) => ({ ...p, label: cat }))}
                  className={`px-4 py-2 rounded-full border text-sm ${addressForm.label === cat
                    ? "bg-orange-500 text-white border-orange-500"
                    : "border-slate-200 text-slate-600 hover:border-orange-300"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-800 mb-1 block">Alamat Lengkap</label>
              <input
                className="w-full border rounded-lg px-4 py-3 text-sm"
                placeholder="Masukkan alamat lengkap"
                value={addressForm.alamat}
                onChange={(e) => setAddressForm((p) => ({ ...p, alamat: e.target.value }))}
                required
              />
            </div>

            <MapPicker
              value={addressForm}
              height="20rem"
              onChange={(val) =>
                setAddressForm((p) => ({
                  ...p,
                  lat: val.lat,
                  lng: val.lng,
                  alamat: val.alamat || p.alamat,
                }))
              }
            />

            <div>
              <label className="text-sm font-semibold text-slate-800 mb-1 block">Instruksi alamat (opsional)</label>
              <textarea
                className="w-full border rounded-lg px-4 py-3 text-sm"
                placeholder="Contoh: Rumah cat hijau, dekat warung Pak Budi"
                value={addressForm.catatan}
                onChange={(e) => setAddressForm((p) => ({ ...p, catatan: e.target.value }))}
              />
            </div>

            <div className="border-t pt-3">
              <p className="text-sm font-semibold text-slate-800 mb-2">Informasi Kontak</p>
              <div className="flex gap-2 mb-3">
                {contactTypes.map((type) => (
                  <span
                    key={type}
                    className={`px-4 py-2 rounded-full border text-sm ${addressForm.contact_type === type
                      ? "bg-orange-500 text-white border-orange-500"
                      : "border-slate-200 text-slate-600"
                      }`}
                  >
                    {type}
                  </span>
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <input
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="Nama penerima"
                  value={addressForm.nama_penerima}
                  onChange={(e) => setAddressForm((p) => ({ ...p, nama_penerima: e.target.value }))}
                  required
                />
                <input
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="No. telepon"
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm((p) => ({ ...p, phone: e.target.value }))}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-3 mt-2">
                <input
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="Latitude (opsional)"
                  value={addressForm.lat}
                  onChange={(e) => setAddressForm((p) => ({ ...p, lat: e.target.value }))}
                />
                <input
                  className="border rounded-lg px-3 py-2 text-sm"
                  placeholder="Longitude (opsional)"
                  value={addressForm.lng}
                  onChange={(e) => setAddressForm((p) => ({ ...p, lng: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
              >
                Simpan alamat
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-3 rounded-lg border border-slate-200 text-slate-700 hover:border-slate-300"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddressFormPanel;
