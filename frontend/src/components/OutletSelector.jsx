import React, { useEffect, useMemo, useState } from "react";
import { outletApi } from "../api";

const toRad = (deg) => (deg * Math.PI) / 180;
const distanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const OutletSelector = ({ selectedOutlet, onSelect }) => {
  const [outlets, setOutlets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userLoc, setUserLoc] = useState(null);
  const [locError, setLocError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await outletApi.list();
        setOutlets(Array.isArray(data.outlets) ? data.outlets : []);
      } catch (err) {
        setError(err.message || "Gagal memuat outlet");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const outletsWithDistance = useMemo(() => {
    if (!userLoc) return outlets;
    return outlets
      .map((o) => ({
        ...o,
        distance:
          o.lat != null && o.lng != null
            ? distanceKm(Number(userLoc.lat), Number(userLoc.lng), Number(o.lat), Number(o.lng))
            : null,
      }))
      .sort((a, b) => {
        if (a.distance == null) return 1;
        if (b.distance == null) return -1;
        return a.distance - b.distance;
      });
  }, [outlets, userLoc]);

  const handleGeo = () => {
    setLocError("");
    if (!navigator.geolocation) {
      setLocError("Browser tidak mendukung geolokasi");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        setLocError(err.message || "Gagal mendapatkan lokasi");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const nearest = useMemo(() => {
    if (!outletsWithDistance.length || outletsWithDistance[0].distance == null) return null;
    return outletsWithDistance[0];
  }, [outletsWithDistance]);

  return (
    <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 mb-10">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Outlet terdekat</p>
          <h3 className="text-lg font-bold text-slate-900">Pilih lokasi operasional</h3>
        </div>
        <button
          onClick={handleGeo}
          className="text-sm px-3 py-2 rounded-full border border-slate-200 text-slate-700 hover:border-blue-400 hover:text-blue-600 transition"
        >
          Gunakan lokasi saya
        </button>
      </div>
      {locError && <p className="text-xs text-red-600 mb-2">{locError}</p>}
      {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
      {loading ? (
        <p className="text-sm text-slate-500">Memuat outlet...</p>
      ) : outletsWithDistance.length === 0 ? (
        <p className="text-sm text-slate-500">Belum ada outlet aktif.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {outletsWithDistance.map((outlet) => {
            const active = selectedOutlet && selectedOutlet.id === outlet.id;
            return (
              <button
                key={outlet.id}
                onClick={() => onSelect?.(outlet)}
                className={`text-left p-3 rounded-xl border transition ${
                  active ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-900">{outlet.nama}</h4>
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                    {outlet.coverage_radius_km || 5} km
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">{outlet.alamat}</p>
                <p className="text-xs text-slate-500 mt-1">
                  Ongkir mulai Rp {Number(outlet.min_biaya || 0).toLocaleString("id-ID")}
                </p>
                {outlet.distance != null && (
                  <p className="text-xs text-blue-600 mt-1">
                    ~{outlet.distance.toFixed(1)} km dari lokasi Anda
                  </p>
                )}
              </button>
            );
          })}
        </div>
      )}
      {nearest && (
        <p className="text-xs text-slate-500 mt-2">
          Rekomendasi: {nearest.nama} ({nearest.distance.toFixed(1)} km)
        </p>
      )}
    </section>
  );
};

export default OutletSelector;
