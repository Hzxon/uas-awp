import React, { useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, Marker, useLoadScript, Autocomplete } from "@react-google-maps/api";

const libraries = ["places"];
const defaultCenter = { lat: -6.200000, lng: 106.816666 }; // Jakarta fallback

const MapPicker = ({ value, onChange, height = "16rem" }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const [center, setCenter] = useState(() => ({
    lat: value?.lat ? Number(value.lat) : defaultCenter.lat,
    lng: value?.lng ? Number(value.lng) : defaultCenter.lng,
  }));
  const [markerPos, setMarkerPos] = useState(() => ({
    lat: value?.lat ? Number(value.lat) : defaultCenter.lat,
    lng: value?.lng ? Number(value.lng) : defaultCenter.lng,
  }));
  const autocompleteRef = useRef(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || "",
    libraries,
  });

  useEffect(() => {
    if (value?.lat && value?.lng) {
      const lat = Number(value.lat);
      const lng = Number(value.lng);
      setCenter({ lat, lng });
      setMarkerPos({ lat, lng });
    }
  }, [value?.lat, value?.lng]);

  const onPlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace();
    if (place?.geometry?.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setCenter({ lat, lng });
      setMarkerPos({ lat, lng });
      onChange?.({
        lat,
        lng,
        alamat: place.formatted_address || value?.alamat,
      });
    }
  };

  const mapOptions = useMemo(
    () => ({
      disableDefaultUI: false,
      clickableIcons: false,
      zoomControl: true,
      streetViewControl: false,
      mapTypeControl: false,
    }),
    []
  );

  if (loadError) {
    return <div className="text-xs text-red-600">Gagal memuat peta.</div>;
  }
  if (!isLoaded) {
    return <div className="text-sm text-slate-500">Memuat peta...</div>;
  }

  return (
    <div className="space-y-2">
      <Autocomplete onLoad={(ref) => (autocompleteRef.current = ref)} onPlaceChanged={onPlaceChanged}>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Cari alamat atau tempat"
          defaultValue={value?.alamat}
        />
      </Autocomplete>
      <div className="rounded-xl border border-slate-200 overflow-hidden" style={{ height }}>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={15}
          options={mapOptions}
          onClick={(e) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            setMarkerPos({ lat, lng });
            onChange?.({ lat, lng, alamat: value?.alamat });
          }}
        >
          <Marker
            position={markerPos}
            draggable
            onDragEnd={(e) => {
              const lat = e.latLng.lat();
              const lng = e.latLng.lng();
              setMarkerPos({ lat, lng });
              onChange?.({ lat, lng, alamat: value?.alamat });
            }}
          />
        </GoogleMap>
      </div>
      <p className="text-xs text-slate-500">
        Cari alamat di atas, atau geser pin untuk menentukan lokasi yang tepat.
      </p>
    </div>
  );
};

export default MapPicker;
