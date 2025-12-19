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
  const [isLocating, setIsLocating] = useState(false);

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
    setIsLocating(true);

    if (!navigator.geolocation) {
      setLocError("Browser tidak mendukung geolokasi");
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLoc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLoc(newLoc);
        setIsLocating(false);

        // Auto-select nearest outlet after getting location
        if (outlets.length > 0) {
          const sortedByDistance = outlets
            .filter((o) => o.lat != null && o.lng != null)
            .map((o) => ({
              ...o,
              distance: distanceKm(newLoc.lat, newLoc.lng, Number(o.lat), Number(o.lng)),
            }))
            .sort((a, b) => a.distance - b.distance);

          if (sortedByDistance.length > 0) {
            onSelect?.(sortedByDistance[0]);
          }
        }
      },
      (err) => {
        setLocError(err.message || "Gagal mendapatkan lokasi");
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const nearest = useMemo(() => {
    if (!outletsWithDistance.length || outletsWithDistance[0].distance == null) return null;
    return outletsWithDistance[0];
  }, [outletsWithDistance]);

  return (
    <section className="outlet-selector">
      <div className="outlet-selector-container">
        {/* Left side - 3D Laundry Store Illustration */}
        <div className="outlet-illustration">
          <div className="store-3d">
            {/* Building */}
            <div className="store-building">
              <div className="store-roof"></div>
              <div className="store-body">
                <div className="store-sign">
                  <span>WashFast</span>
                </div>
                <div className="store-window">
                  <div className="window-machine"></div>
                  <div className="window-machine"></div>
                </div>
                <div className="store-door"></div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="floating-bubble bubble-1">
              <i className="fas fa-tshirt"></i>
            </div>
            <div className="floating-bubble bubble-2">
              <i className="fas fa-droplet"></i>
            </div>
            <div className="floating-bubble bubble-3">
              <i className="fas fa-sparkles"></i>
            </div>

            {/* Location pin */}
            <div className="location-pin">
              <i className="fas fa-location-dot"></i>
              <div className="pin-pulse"></div>
            </div>
          </div>
        </div>

        {/* Right side - Content */}
        <div className="outlet-content">
          <div className="outlet-header">
            <div className="outlet-header-text">
              <h3 className="outlet-title">
                <i className="fas fa-map-marker-alt"></i>
                Temukan Outlet Terdekat
              </h3>
            </div>

            <button
              onClick={handleGeo}
              disabled={isLocating}
              className={`location-btn ${isLocating ? 'locating' : ''} ${userLoc ? 'located' : ''}`}
            >
              {isLocating ? (
                <>
                  <span className="btn-spinner"></span>
                  <span>Mencari...</span>
                </>
              ) : userLoc ? (
                <>
                  <i className="fas fa-check-circle"></i>
                  <span>Lokasi Ditemukan</span>
                </>
              ) : (
                <>
                  <i className="fas fa-location-crosshairs"></i>
                  <span>Gunakan Lokasi Saya</span>
                </>
              )}
            </button>
          </div>

          {locError && (
            <div className="outlet-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{locError}</span>
            </div>
          )}

          {error && (
            <div className="outlet-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="outlet-loading">
              <div className="loading-spinner"></div>
              <span>Memuat outlet...</span>
            </div>
          ) : outletsWithDistance.length === 0 ? (
            <div className="outlet-empty">
              <i className="fas fa-store-slash"></i>
              <span>Belum ada outlet aktif.</span>
            </div>
          ) : (
            <div className="outlet-grid">
              {outletsWithDistance.slice(0, 3).map((outlet) => {
                const active = selectedOutlet && selectedOutlet.id === outlet.id;
                const isNearest = nearest && nearest.id === outlet.id && userLoc;

                return (
                  <button
                    key={outlet.id}
                    onClick={() => onSelect?.(outlet)}
                    className={`outlet-card ${active ? 'active' : ''} ${isNearest ? 'nearest' : ''}`}
                  >
                    {isNearest && (
                      <div className="nearest-badge">
                        <i className="fas fa-star"></i>
                        Terdekat
                      </div>
                    )}

                    <div className="outlet-card-header">
                      <div className="outlet-icon">
                        <i className="fas fa-store"></i>
                      </div>
                      <div className="outlet-info">
                        <h4 className="outlet-name">{outlet.nama}</h4>
                        <p className="outlet-address">{outlet.alamat}</p>
                      </div>
                    </div>

                    <div className="outlet-card-footer">
                      <div className="outlet-detail">
                        <i className="fas fa-truck"></i>
                        <span>Rp {Number(outlet.min_biaya || 0).toLocaleString("id-ID")}</span>
                      </div>

                      {outlet.distance != null ? (
                        <div className="outlet-distance">
                          <i className="fas fa-route"></i>
                          <span>{outlet.distance.toFixed(1)} km</span>
                        </div>
                      ) : (
                        <div className="outlet-radius">
                          <i className="fas fa-circle-dot"></i>
                          <span>{outlet.coverage_radius_km || 5} km</span>
                        </div>
                      )}
                    </div>

                    {active && (
                      <div className="selected-indicator">
                        <i className="fas fa-check"></i>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {outletsWithDistance.length > 3 && (
            <p className="outlet-more">
              +{outletsWithDistance.length - 3} outlet lainnya tersedia
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default OutletSelector;
