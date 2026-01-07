"use client";

import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, LayersControl, useMap, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { TowerControl, CheckCircle2, AlertCircle, MapPin, ExternalLink, Copy, Ruler, Calendar, Zap } from "lucide-react";
import { renderToString } from "react-dom/server";

// Fix Leaflet Icon
const fixLeafletIcon = () => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
};

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
    mapStyle?: "STREET" | "SATELLITE";
}

export default function Map({
    markers = [],
    center = [-4.852055, 104.862938],
    zoom = 8,
    focusedLocation = null,
    onMarkerClick,
    mapStyle = "STREET"
}: MapProps) {
    useEffect(() => {
        fixLeafletIcon();
    }, []);

    const hasCertificate = (m: any) => m.nomorSertifikat && m.nomorSertifikat !== "-" && m.nomorSertifikat !== "";
    const handleCopy = (txt: string) => { navigator.clipboard.writeText(txt); alert("Disalin!"); };

    // Define Icons
    const getIcon = (status: string | null, type: string | null) => {
        const isProblem = status && !status.toLowerCase().includes("clean");
        const color = isProblem ? "#ef4444" : "#2563eb"; // Red vs Blue
        const bgColor = isProblem ? "#fef2f2" : "#eff6ff"; // Light Red vs Light Blue

        // Pilih Icon berdasarkan Jenis Bangunan
        const IconComponent = (type === "GARDU_INDUK") ? Zap : TowerControl;

        return L.divIcon({
            html: renderToString(
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <IconComponent size={14} color={color} strokeWidth={3} fill={bgColor} />
                    {isProblem && (
                        <div style={{
                            position: 'absolute',
                            top: -1,
                            right: -1,
                            width: 6,
                            height: 6,
                            backgroundColor: '#ef4444',
                            borderRadius: '50%',
                            border: '1px solid white'
                        }}></div>
                    )}
                </div>
            ),
            className: 'custom-tower-icon',
            iconSize: [14, 14],
            iconAnchor: [7, 14],
            popupAnchor: [0, -14],
        });
    };

    // Pre-create icons to avoid recreation on every render (Performance optimization)
    const towerSafe = getIcon("CLEAN", "TAPAK_TOWER");
    const towerProblem = getIcon("SENGKETA", "TAPAK_TOWER");
    const garduSafe = getIcon("CLEAN", "GARDU_INDUK");
    const garduProblem = getIcon("SENGKETA", "GARDU_INDUK");

    const validMarkers = markers.filter(m =>
        m.koordinatY !== null && m.koordinatY !== undefined &&
        m.koordinatX !== null && m.koordinatX !== undefined &&
        !isNaN(Number(m.koordinatY)) && !isNaN(Number(m.koordinatX))
    );

    // --- VIEWPORT FILTERING COMPONENT ---
    function VisibleMarkers({ markers, onMarkerClick }: { markers: any[], onMarkerClick?: (m: any) => void }) {
        const map = useMap();
        const [bounds, setBounds] = useState(map.getBounds());

        // Update bounds on move/zoom end
        useMapEvents({
            moveend: () => setBounds(map.getBounds()),
            zoomend: () => setBounds(map.getBounds()),
        });

        // Filter: Hanya ambil marker yang masuk dalam bounds saat ini
        const visibleMarkers = useMemo(() => {
            return markers.filter(m =>
                bounds.contains([m.koordinatY, m.koordinatX])
            );
        }, [markers, bounds]);

        return (
            <>
                {visibleMarkers.map((marker, idx) => {
                    const isProblem = marker.permasalahanAset && !marker.permasalahanAset.toLowerCase().includes("clean");
                    const isGardu = marker.jenisBangunan === "GARDU_INDUK";

                    let iconToUse = towerSafe;
                    if (isGardu) {
                        iconToUse = isProblem ? garduProblem : garduSafe;
                    } else {
                        iconToUse = isProblem ? towerProblem : towerSafe;
                    }

                    return (
                        <Marker
                            key={marker.id || idx}
                            position={[marker.koordinatY, marker.koordinatX]}
                            icon={iconToUse}
                            eventHandlers={{
                                click: (e) => {
                                    if (window.innerWidth < 768) {
                                        e.target.closePopup();
                                        if (onMarkerClick) onMarkerClick({ ...marker, latitude: marker.koordinatY, longitude: marker.koordinatX });
                                    }
                                },
                            }}
                        >
                            {/* POPUP DETAILED */}
                            <Popup minWidth={300} maxWidth={320} className="custom-popup-detailed">
                                <div className="font-sans text-gray-800 p-1">
                                    {/* Header: SAP & Status */}
                                    <div className="flex items-start justify-between border-b border-gray-100 pb-2 mb-2">
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-0.5">Kode SAP</p>
                                            <p className="text-base font-bold text-pln-blue leading-none">{marker.kodeSap}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 ${hasCertificate(marker) ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                                            {hasCertificate(marker) ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                            {hasCertificate(marker) ? "Sertifikat Ada" : "Belum Sertifikat"}
                                        </div>
                                    </div>

                                    {/* Deskripsi */}
                                    <div className="mb-3">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Deskripsi</p>
                                        <p className="text-xs font-medium text-gray-700 leading-snug line-clamp-3">
                                            {marker.deskripsi || "Tidak ada deskripsi"}
                                        </p>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 gap-2 mb-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                                        <div>
                                            <p className="text-[9px] text-gray-500 mb-0.5">Luas Tanah</p>
                                            <p className="text-xs font-semibold flex items-center gap-1">
                                                <Ruler size={12} className="text-gray-400" />
                                                {marker.luasTanah ? `${marker.luasTanah.toLocaleString('id-ID')} m²` : "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] text-gray-500 mb-0.5">Tahun Perolehan</p>
                                            <p className="text-xs font-semibold flex items-center gap-1">
                                                <Calendar size={12} className="text-gray-400" />
                                                {marker.tahunPerolehan || "-"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Alamat */}
                                    <div className="mb-3">
                                        <p className="text-[9px] text-gray-500 mb-0.5">Lokasi / Alamat</p>
                                        <div className="flex items-start gap-1.5 text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-100">
                                            <MapPin size={14} className="mt-0.5 shrink-0 text-red-500" />
                                            <span className="leading-tight">{marker.alamat || "Alamat tidak tersedia"}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons: Sertifikat & Foto */}
                                    <div className="flex flex-col gap-2 mb-3">
                                        {/* Button File Sertifikat */}
                                        {hasCertificate(marker) && marker.linkSertifikat && (
                                            <a
                                                href={marker.linkSertifikat}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-center gap-2 w-full py-1.5 bg-blue-50 text-pln-blue hover:bg-blue-100 rounded-md transition-colors border border-blue-100 group"
                                            >
                                                <ExternalLink size={14} />
                                                <span className="text-xs font-semibold">Lihat File Sertifikat</span>
                                            </a>
                                        )}

                                        {/* Preview/Info Foto (Placeholder logic if photo exists) */}
                                        {marker.fotoAset && marker.fotoAset.length > 0 && (
                                            <button
                                                onClick={() => window.open(marker.fotoAset[0].url, "_blank")}
                                                className="flex items-center justify-center gap-2 w-full py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
                                            >
                                                <div className="flex items-center gap-2">
                                                    {/* Tiny preview if possible, otherwise icon */}
                                                    <div className="w-4 h-4 rounded bg-gray-300 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${marker.fotoAset[0].url})` }}></div>
                                                    <span className="text-xs font-semibold">Lihat Foto ({marker.fotoAset.length})</span>
                                                </div>
                                            </button>
                                        )}
                                    </div>

                                    {/* Footer: Koordinat & Google Maps Link */}
                                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <div
                                            onClick={() => handleCopy(`${marker.koordinatY}, ${marker.koordinatX}`)}
                                            className="cursor-pointer hover:bg-gray-50 px-2 py-1 rounded group"
                                            title="Klik untuk salin koordinat"
                                        >
                                            <p className="text-[9px] text-gray-400 font-mono flex items-center gap-1">
                                                {marker.koordinatY.toFixed(5)}, {marker.koordinatX.toFixed(5)}
                                                <Copy size={10} className="text-gray-300 group-hover:text-gray-500" />
                                            </p>
                                        </div>
                                        <a
                                            href={`https://www.google.com/maps?q=${marker.koordinatY},${marker.koordinatX}`}
                                            target="_blank" rel="noopener noreferrer"
                                            className="text-[10px] font-bold text-pln-blue hover:underline flex items-center gap-0.5"
                                        >
                                            Buka Maps <ExternalLink size={10} />
                                        </a>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </>
        );
    }

    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full rounded-xl z-0 outline-none">
            <MapController center={focusedLocation} />

            {/* Tile Layer Switching */}
            {mapStyle === "STREET" ? (
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
            ) : (
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                />
            )}

            <VisibleMarkers markers={validMarkers} onMarkerClick={onMarkerClick} />
        </MapContainer>
    );
}