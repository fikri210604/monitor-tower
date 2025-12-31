"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, LayersControl, useMap, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { TowerControl, CheckCircle2, AlertCircle, MapPin, ExternalLink, Copy, Ruler, Calendar } from "lucide-react";
import { renderToString } from "react-dom/server";

// Fix Leaflet Icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapController({ center }: { center: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (center) map.panTo(center, { animate: true, duration: 0.8 });
    }, [center, map]);
    return null;
}

interface MapProps {
    markers: any[]; 
    center?: [number, number];
    zoom?: number;
    focusedLocation?: [number, number] | null; 
    onMarkerClick?: (marker: any) => void;
}

export default function Map({ markers = [], center = [-4.852055, 104.862938], zoom = 8, focusedLocation = null, onMarkerClick }: MapProps) {
    
    const hasCertificate = (m: any) => m.nomorSertifikat && m.nomorSertifikat !== "-" && m.nomorSertifikat !== "";
    const handleCopy = (txt: string) => { navigator.clipboard.writeText(txt); alert("Disalin!"); };

    const towerIconHtml = renderToString(<TowerControl size={28} color="#2563eb" strokeWidth={2.5} fill="#eff6ff" />);
    const towerIcon = new L.DivIcon({
        html: `<div style="display: flex; align-items: center; justify-content: center; filter: drop-shadow(0px 2px 2px rgba(0,0,0,0.3)); transform: translateY(-5px);">${towerIconHtml}</div>`,
        className: 'custom-tower-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
    });

    const validMarkers = markers.filter(m => typeof m.koordinatY === 'number' && typeof m.koordinatX === 'number');

    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full rounded-xl z-0 outline-none">
            <MapController center={focusedLocation} />
            <LayersControl position="topright">
                <LayersControl.BaseLayer checked name="Jalan"><TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /></LayersControl.BaseLayer>
                <LayersControl.BaseLayer name="Satelit"><TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" /></LayersControl.BaseLayer>
            </LayersControl>
            
            {validMarkers.map((marker, idx) => (
                <Marker 
                    key={marker.id || idx} 
                    position={[marker.koordinatY, marker.koordinatX]} 
                    icon={towerIcon}
                    eventHandlers={{
                        click: (e) => {
                            if (window.innerWidth < 768) {
                                e.target.closePopup();
                                if (onMarkerClick) onMarkerClick({ ...marker, latitude: marker.koordinatY, longitude: marker.koordinatX });
                            }
                        },
                    }}
                >
                    {/* POPUP COMPACT (DESKTOP) */}
                    <Popup minWidth={200} maxWidth={220} className="custom-popup-compact">
                        <div className="font-sans text-gray-800">
                            {/* Header Kecil */}
                            <div className="flex items-center justify-between border-b border-gray-100 pb-1.5 mb-1.5">
                                <div className="flex items-center gap-1.5">
                                    <div className="p-1 bg-blue-50 rounded shrink-0">
                                        <TowerControl className="w-3 h-3 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">SAP</p>
                                        <p className="text-xs font-bold leading-none">{marker.kodeSap}</p>
                                    </div>
                                </div>
                                <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 ${hasCertificate(marker) ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                    {hasCertificate(marker) ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                                    {hasCertificate(marker) ? "Sertifikat" : "Belum"}
                                </div>
                            </div>

                            {/* Data Grid Kecil */}
                            <div className="space-y-1 mb-2">
                                <div className="grid grid-cols-2 gap-1 text-[10px]">
                                    <div className="flex items-center gap-1 text-gray-500"><Ruler size={10}/> {marker.luasTanah || "-"} m²</div>
                                    <div className="flex items-center gap-1 text-gray-500"><Calendar size={10}/> {marker.tahunPerolehan || "-"}</div>
                                </div>
                                <div className="flex items-start gap-1 text-[10px] text-gray-500 bg-gray-50 p-1 rounded">
                                    <MapPin size={10} className="mt-0.5 shrink-0"/>
                                    <span className="line-clamp-2 leading-tight">{marker.alamat || "Alamat kosong"}</span>
                                </div>
                            </div>

                            {/* Footer: Koordinat & Maps */}
                            <div className="flex items-center justify-between gap-1">
                                <div 
                                    onClick={() => handleCopy(`${marker.koordinatY}, ${marker.koordinatX}`)}
                                    className="cursor-pointer hover:bg-gray-100 p-1 rounded group flex flex-col w-full"
                                    title="Klik salin"
                                >
                                    <span className="text-[9px] text-gray-400 font-mono flex items-center gap-1">
                                        {marker.koordinatY.toFixed(5)}, {marker.koordinatX.toFixed(5)} <Copy size={8} className="opacity-0 group-hover:opacity-100"/>
                                    </span>
                                </div>
                                <a 
                                    href={`https://www.google.com/maps?q=${marker.koordinatY},${marker.koordinatX}`}
                                    target="_blank" rel="noopener noreferrer"
                                    className="p-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded shrink-0"
                                    title="Buka Google Maps"
                                >
                                    <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}