import React, { useEffect, useMemo, useState } from "react";
import { GoogleMap, Marker, InfoWindow, useLoadScript } from "@react-google-maps/api";

const libraries = ["places"];
const defaultCenter = { lat: -6.200000, lng: 106.816666 }; // Jakarta fallback

const OutletMapView = ({
    outlets = [],
    selectedOutlet,
    onSelectOutlet,
    height = "400px"
}) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    const [activeMarker, setActiveMarker] = useState(null);
    const [mapCenter, setMapCenter] = useState(defaultCenter);

    const { isLoaded, loadError } = useLoadScript({
        googleMapsApiKey: apiKey || "",
        libraries,
    });

    // Calculate center based on outlets
    useEffect(() => {
        if (outlets.length > 0) {
            const validOutlets = outlets.filter(o => o.lat && o.lng);
            if (validOutlets.length > 0) {
                const avgLat = validOutlets.reduce((sum, o) => sum + Number(o.lat), 0) / validOutlets.length;
                const avgLng = validOutlets.reduce((sum, o) => sum + Number(o.lng), 0) / validOutlets.length;
                setMapCenter({ lat: avgLat, lng: avgLng });
            }
        }
    }, [outlets]);

    // Update center when selected outlet changes
    useEffect(() => {
        if (selectedOutlet?.lat && selectedOutlet?.lng) {
            setMapCenter({ lat: Number(selectedOutlet.lat), lng: Number(selectedOutlet.lng) });
        }
    }, [selectedOutlet]);

    const mapOptions = useMemo(
        () => ({
            disableDefaultUI: false,
            clickableIcons: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            styles: [
                {
                    featureType: "poi",
                    elementType: "labels",
                    stylers: [{ visibility: "off" }]
                }
            ]
        }),
        []
    );

    const handleMarkerClick = (outlet) => {
        setActiveMarker(outlet.id);
        if (onSelectOutlet) {
            onSelectOutlet(outlet);
        }
    };

    if (loadError) {
        return (
            <div className="outlet-map-error">
                <i className="fas fa-exclamation-circle"></i>
                <span>Gagal memuat peta. Periksa koneksi internet Anda.</span>
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="outlet-map-loading">
                <div className="loading-spinner"></div>
                <span>Memuat peta outlet...</span>
            </div>
        );
    }

    return (
        <div className="outlet-map-section">
            <div className="outlet-map-header">
                <h3>
                    <i className="fas fa-map-location-dot"></i>
                    Lokasi Outlet Kami
                </h3>
            </div>

            <div className="outlet-map-container" style={{ height }}>
                <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={mapCenter}
                    zoom={12}
                    options={mapOptions}
                >
                    {outlets.map((outlet) => {
                        if (!outlet.lat || !outlet.lng) return null;
                        const isSelected = selectedOutlet?.id === outlet.id;

                        return (
                            <Marker
                                key={outlet.id}
                                position={{ lat: Number(outlet.lat), lng: Number(outlet.lng) }}
                                onClick={() => handleMarkerClick(outlet)}
                                icon={{
                                    url: isSelected
                                        ? "https://maps.google.com/mapfiles/ms/icons/green-dot.png"
                                        : "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                                    scaledSize: isSelected
                                        ? new window.google.maps.Size(48, 48)
                                        : new window.google.maps.Size(36, 36),
                                }}
                                animation={isSelected ? window.google.maps.Animation.BOUNCE : null}
                            />
                        );
                    })}

                    {activeMarker && outlets.find(o => o.id === activeMarker) && (
                        <InfoWindow
                            position={{
                                lat: Number(outlets.find(o => o.id === activeMarker).lat),
                                lng: Number(outlets.find(o => o.id === activeMarker).lng)
                            }}
                            onCloseClick={() => setActiveMarker(null)}
                        >
                            <div className="outlet-info-window">
                                <h4>{outlets.find(o => o.id === activeMarker).nama}</h4>
                                <p>{outlets.find(o => o.id === activeMarker).alamat}</p>
                                <p className="outlet-fee">
                                    <i className="fas fa-truck"></i>
                                    Ongkir mulai Rp {Number(outlets.find(o => o.id === activeMarker).min_biaya || 0).toLocaleString("id-ID")}
                                </p>
                            </div>
                        </InfoWindow>
                    )}
                </GoogleMap>
            </div>
        </div>
    );
};

export default OutletMapView;
