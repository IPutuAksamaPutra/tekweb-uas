"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MyMapComponent() {
  const [isClient, setIsClient] = useState(false);

  const position: LatLngExpression = [-8.117498278884936, 115.08788956863872];

  // Membuat objek ikon secara manual untuk menghindari error "iconUrl not set"
  const kustomIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 font-medium">
        Memuat Peta...
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <MapContainer 
        center={position} 
        zoom={18} 
        style={{ height: "100%", width: "100%" }} 
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        {/* 🔥 Tambahkan properti icon={kustomIcon} di sini */}
        <Marker position={position} icon={kustomIcon}>
          <Popup>Universitas Pendidikan Ganesha (Undiksha)</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}