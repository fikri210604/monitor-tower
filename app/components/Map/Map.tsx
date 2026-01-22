"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, Popup, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";

import Link from "next/link";
import {CheckCircle2, AlertCircle, MapPin, ExternalLink, Copy, Ruler, Calendar, Zap, ArrowRight } from "lucide-react";
import { renderToString } from "react-dom/server";
import PhotoLightbox from "../Shared/PhotoLightbox";

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
    selectedMarkerId?: string | number | null;
}

export default function Map({
    markers = [],
    center = [-4.852055, 104.862938],
    zoom = 8,
    focusedLocation = null,
    onMarkerClick,
    mapStyle = "STREET",
    selectedMarkerId = null
}: MapProps) {
    useEffect(() => {
        fixLeafletIcon();
    }, []);

    const hasCertificate = (m: any) => m.hasCertificate ?? (m.nomorSertifikat && m.nomorSertifikat !== "-" && m.nomorSertifikat !== "");
    const handleCopy = (txt: string) => { navigator.clipboard.writeText(txt); alert("Disalin!"); };

    // Define Icons Factory
    const getIcon = (status: boolean, type: string | null) => {
        const isProblem = !status; // status passed here is 'isSafe' basically, wait. Logic below:
        // Let's pass 'isProblem' directly or 'color'.
        // Simplified:
        // Blue = Safe (Ada Sertifikat usually means safe in validMarkers logic?)
        // Actually earlier logic: Blue = Safe Config, Red = Problem.
        // Let's stick to: Blue Icon = OK, Red Icon = Problem.

        const color = isProblem ? "#ef4444" : "#2563eb";
        const bgColor = isProblem ? "#fef2f2" : "#eff6ff";

        const IconComponent = (type === "GARDU_INDUK") ? Zap : MapPin;

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

    // Memoize icons
    const towerSafe = useMemo(() => getIcon(false, "TAPAK_TOWER"), []);
    const towerProblem = useMemo(() => getIcon(true, "TAPAK_TOWER"), []);
    const garduSafe = useMemo(() => getIcon(false, "GARDU_INDUK"), []);
    const garduProblem = useMemo(() => getIcon(true, "GARDU_INDUK"), []);

    const validMarkers = useMemo(() => markers.filter(m =>
        m.koordinatY !== null && m.koordinatY !== undefined &&
        m.koordinatX !== null && m.koordinatX !== undefined &&
        !isNaN(Number(m.koordinatY)) && !isNaN(Number(m.koordinatX))
    ), [markers]);

    // --- LOGIC FOR INDIVIDUAL MARKER ---
    function MarkerItem({ marker, isSelected }: any) {
        const markerRef = useRef<any>(null);

        // Icon logic
        const hasCert = hasCertificate(marker);
        const isGardu = marker.jenisBangunan === "GARDU_INDUK";
        // Logic: If Certificate Exists -> Blue/Safe. If No Cert -> Red/Problem.
        // Wait, earlier logic was: isProblem = !clean.
        // Let's stick to the visibleMarkers logic in previous code:
        // iconToUse = hasCert ? (isGardu ? garduSafe : towerSafe) : (isGardu ? garduProblem : towerProblem);
        const iconToUse = hasCert ? (isGardu ? garduSafe : towerSafe) : (isGardu ? garduProblem : towerProblem);

        useEffect(() => {
            if (isSelected && markerRef.current) {
                if (window.innerWidth >= 768) {
                    markerRef.current.openPopup();
                }
            }
        }, [isSelected]);

        return (
            <Marker
                ref={markerRef}
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
                <Popup minWidth={300} maxWidth={320} className="custom-popup-detailed" autoPanPadding={[10, 80]}>
                    <div className="font-sans text-gray-800 p-1">
                        {/* Header: SAP & Certificate Status */}
                        <div className="flex flex-col border-b border-gray-100 pb-2 mb-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase leading-none mb-1">Nomor SAP</p>
                            <div className="flex items-center gap-2">
                                <p className="text-base font-bold text-pln-blue leading-none">{marker.kodeSap}</p>
                                <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 border ${hasCertificate(marker) ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                                    {hasCertificate(marker) ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                                    {hasCertificate(marker) ? "Ada Sertifikat" : "Belum Sertifikat"}
                                </div>
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

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 mb-3">
                            <Link
                                href={`/assets/${marker.id}`}
                                className="flex items-center justify-center gap-2 w-full py-2 bg-pln-blue text-white hover:bg-blue-700 rounded-md transition-colors shadow-sm group"
                            >
                                <span className="text-xs font-bold text-white">Lihat Detail Aset</span>
                                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>

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

                            {marker.fotoAset && marker.fotoAset.length > 0 && (
                                <button
                                    onClick={() => {
                                        setLightboxPhotos(marker.fotoAset);
                                    }}
                                    className="flex items-center justify-center gap-2 w-full py-1.5 bg-gray-50 text-gray-700 hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded bg-gray-300 overflow-hidden bg-cover bg-center" style={{ backgroundImage: `url(${marker.fotoAset[0].url})` }}></div>
                                        <span className="text-xs font-semibold">Lihat Foto ({marker.fotoAset.length})</span>
                                    </div>
                                </button>
                            )}
                        </div>

                        {/* Footer */}
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
    }

    // Lightbox State
    const [lightboxPhotos, setLightboxPhotos] = useState<any[] | null>(null);

    const mapId = useMemo(() => "map-" + Math.random().toString(36).substr(2, 9), []);

    // Custom createClusterCustomIcon function
    const createClusterCustomIcon = function (cluster: any) {
        return L.divIcon({
            html: `
                <div style="
                    background-color: rgba(37, 99, 235, 0.9);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    width: 32px;
                    height: 32px;
                    border: 2px solid white;
                    font-weight: bold;
                    font-size: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
                ">
                    ${cluster.getChildCount()}
                </div>
            `,
            className: 'custom-cluster-icon',
            iconSize: L.point(32, 32, true),
        });
    };

    return (
        <>
            <MapContainer
                id={mapId}
                key={mapId}
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                className="h-full w-full rounded-xl z-0 outline-none"
                zoomControl={false}
            >
                <ZoomControl position="bottomright" />
                <MapController center={focusedLocation} />

                {mapStyle === "STREET" ? (
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                ) : (
                    <TileLayer
                        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                        attribution='Tiles &copy; Esri'
                    />
                )}

                <MarkerClusterGroup
                    chunkedLoading
                    iconCreateFunction={createClusterCustomIcon}
                    maxClusterRadius={60}
                    spiderfyOnMaxZoom={true}
                >
                    {validMarkers.map((marker, idx) => (
                        <MarkerItem
                            key={marker.id || idx}
                            marker={marker}
                            isSelected={selectedMarkerId === marker.id}
                        />
                    ))}
                </MarkerClusterGroup>
            </MapContainer>

            {lightboxPhotos && (
                <PhotoLightbox
                    photos={lightboxPhotos}
                    initialIndex={0}
                    onClose={() => setLightboxPhotos(null)}
                />
            )}
        </>
    );
}