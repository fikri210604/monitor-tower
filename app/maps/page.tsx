"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
    X, ExternalLink, Calendar, Ruler, MapPin,
    CheckCircle2, AlertCircle, Search, ChevronRight, Copy, Zap, Info
} from "lucide-react";

// Pastikan file Map.tsx Anda sudah diupdate dengan kode dari jawaban sebelumnya
// agar fitur 'focusedLocation' (geser otomatis) berfungsi.
const Map = dynamic(() => import("@/app/components/Map"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center animate-pulse">Memuat Peta...</div>,
});

export default function MapsPage() {
    const [assets, setAssets] = useState<any[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [focusedLocation, setFocusedLocation] = useState<[number, number] | null>(null);
    const [filterStatus, setFilterStatus] = useState<"ALL" | "SAFE" | "PROBLEM">("ALL");
    const [filterType, setFilterType] = useState<"ALL" | "TOWER" | "GARDU">("ALL");
    const [filterCert, setFilterCert] = useState<"ALL" | "CERTIFIED" | "UNCERTIFIED">("ALL");
    const [mapStyle, setMapStyle] = useState<"STREET" | "SATELLITE">("STREET");
    const [showFilters, setShowFilters] = useState(false);
    const [showLegend, setShowLegend] = useState(true);

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const res = await fetch("/api/assets/markers");
                if (res.ok) {
                    const data = await res.json();
                    setAssets(data);
                }
            } catch (e) {
                console.error("Gagal memuat aset", e);
            }
        };
        fetchAssets();
    }, []);

    const hasCertificate = (a: any) => a.hasCertificate ?? (a.nomorSertifikat && a.nomorSertifikat !== "-" && a.nomorSertifikat !== "");

    const filteredAssets = useMemo(() => {
        // First filter by search
        let result = assets;

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(a =>
                String(a.kodeSap).includes(q) ||
                (a.alamat && a.alamat.toLowerCase().includes(q)) ||
                (a.desa && a.desa.toLowerCase().includes(q)) ||
                (a.deskripsi && a.deskripsi.toLowerCase().includes(q)) ||
                (a.tahunPerolehan && String(a.tahunPerolehan).includes(q))
            );
        }

        return result.slice(0, 5); // Limit suggestions
    }, [searchQuery, assets]);

    // Derived assets for Map Display (Applying Status AND Type Filter)
    const mapAssets = useMemo(() => {
        return assets.filter(a => {
            // Filter by Status
            let statusMatch = true;
            if (filterStatus === "SAFE") {
                statusMatch = !a.permasalahanAset || a.permasalahanAset.toLowerCase().includes("clean");
            } else if (filterStatus === "PROBLEM") {
                statusMatch = a.permasalahanAset && !a.permasalahanAset.toLowerCase().includes("clean");
            }

            // Filter by Type
            let typeMatch = true;
            if (filterType === "TOWER") {
                typeMatch = a.jenisBangunan === "TAPAK_TOWER";
            } else if (filterType === "GARDU") {
                typeMatch = a.jenisBangunan === "GARDU_INDUK";
            }

            // Filter by Certificate
            let certMatch = true;
            if (filterCert === "CERTIFIED") {
                certMatch = hasCertificate(a);
            } else if (filterCert === "UNCERTIFIED") {
                certMatch = !hasCertificate(a);
            }

            return statusMatch && typeMatch && certMatch;
        });
    }, [assets, filterStatus, filterType, filterCert]);

    const handleSelectResult = (asset: any) => {
        setFocusedLocation([asset.koordinatY, asset.koordinatX]);
        setSelectedAsset(asset);
        setSearchQuery("");
        setShowSuggestions(false);
    };

    return (
        <div className="h-[calc(100vh-theme(spacing.24))] w-full rounded-xl overflow-hidden shadow-sm border border-gray-100 relative bg-gray-50 group">

            <Map
                markers={mapAssets}
                focusedLocation={focusedLocation}
                mapStyle={mapStyle}
                selectedMarkerId={selectedAsset?.id}
                onMarkerClick={(asset) => {
                    setSelectedAsset(asset);
                    setFocusedLocation([asset.koordinatY, asset.koordinatX]);
                }}
            />

            {/* --- SEARCH BAR & FILTER TOGGLE --- */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[95%] md:w-[480px] z-[400] flex flex-col gap-2 pointer-events-none">

                {/* Search Row */}
                <div className="flex gap-2 pointer-events-auto">
                    <div className="relative flex-1">
                        <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-md border border-gray-200 flex items-center px-4 py-2.5 gap-2 focus-within:ring-2 focus-within:ring-blue-500/30 transition-shadow">
                            <Search className="w-4 h-4 text-gray-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Cari SAP, Alamat, Deskripsi, Tahun..."
                                className="w-full text-sm outline-none text-gray-700 placeholder:text-gray-400 bg-transparent"
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                                onFocus={() => setShowSuggestions(true)}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100">
                                    <X size={14} />
                                </button>
                            )}
                        </div>

                        {showSuggestions && searchQuery && filteredAssets.length > 0 && (
                            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                                {filteredAssets.map((asset) => (
                                    <button
                                        key={asset.id}
                                        onClick={() => handleSelectResult(asset)}
                                        className="w-full text-left p-3 hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0 flex items-center justify-between"
                                    >
                                        <div className="overflow-hidden">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="font-bold text-gray-800 text-xs bg-gray-100 px-1.5 py-0.5 rounded">{asset.kodeSap}</span>
                                                <span className="text-[10px] text-gray-400">{asset.tahunPerolehan}</span>
                                            </div>
                                            <p className="text-xs text-gray-600 line-clamp-1">{asset.alamat || asset.desa}</p>
                                            <p className="text-[10px] text-gray-400 line-clamp-1">{asset.deskripsi}</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`w-11 h-11 flex items-center justify-center rounded-full shadow-md border border-gray-200 transition-all ${showFilters ? 'bg-pln-blue text-white border-pln-blue' : 'bg-white/95 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {/* Simple Filter Icon manually SVG to avoid import errors if icon missing */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="4" y1="21" x2="4" y2="14"></line>
                            <line x1="4" y1="10" x2="4" y2="3"></line>
                            <line x1="12" y1="21" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12" y2="3"></line>
                            <line x1="20" y1="21" x2="20" y2="16"></line>
                            <line x1="20" y1="12" x2="20" y2="3"></line>
                            <line x1="1" y1="14" x2="7" y2="14"></line>
                            <line x1="9" y1="8" x2="15" y2="8"></line>
                            <line x1="17" y1="16" x2="23" y2="16"></line>
                        </svg>
                    </button>
                </div>

                {/* --- FILTER CONTROL PANEL (COLLAPSIBLE) --- */}
                {showFilters && (
                    <div className="pointer-events-auto animate-in slide-in-from-top-2 duration-300 w-full">
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200/80 p-3 flex flex-col gap-3 max-h-[60vh] overflow-y-auto">

                            {/* Layer Style Group */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Tampilan Peta</label>
                                <div className="flex bg-gray-100/80 p-1 rounded-xl gap-1">
                                    <button
                                        onClick={() => setMapStyle("STREET")}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${mapStyle === "STREET"
                                            ? "bg-white text-gray-800 shadow-sm ring-1 ring-black/5"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                                            }`}
                                    >
                                        🗺️ Jalan
                                    </button>
                                    <button
                                        onClick={() => setMapStyle("SATELLITE")}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${mapStyle === "SATELLITE"
                                            ? "bg-white text-gray-800 shadow-sm ring-1 ring-black/5"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                                            }`}
                                    >
                                        🛰️ Satelit
                                    </button>
                                </div>
                            </div>

                            <hr className="border-dashed border-gray-200" />

                            {/* Status Filter Group */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Kondisi Aset</label>
                                <div className="flex bg-gray-100/80 p-1 rounded-xl gap-1">
                                    <button
                                        onClick={() => setFilterStatus("ALL")}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${filterStatus === "ALL"
                                            ? "bg-white text-gray-800 shadow-sm ring-1 ring-black/5"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                                            }`}
                                    >
                                        Semua
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus("SAFE")}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${filterStatus === "SAFE"
                                            ? "bg-white text-green-600 shadow-sm ring-1 ring-black/5"
                                            : "text-gray-500 hover:text-green-600 hover:bg-green-50/50"
                                            }`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${filterStatus === "SAFE" ? "bg-green-500" : "bg-gray-300"}`}></div>
                                        Aman
                                    </button>
                                    <button
                                        onClick={() => setFilterStatus("PROBLEM")}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${filterStatus === "PROBLEM"
                                            ? "bg-white text-red-600 shadow-sm ring-1 ring-black/5"
                                            : "text-gray-500 hover:text-red-600 hover:bg-red-50/50"
                                            }`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${filterStatus === "PROBLEM" ? "bg-red-500" : "bg-gray-300"}`}></div>
                                        Masalah
                                    </button>
                                </div>
                            </div>

                            {/* Certificate Filter Group */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Status Sertifikat</label>
                                <div className="flex bg-gray-100/80 p-1 rounded-xl gap-1">
                                    <button
                                        onClick={() => setFilterCert("ALL")}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${filterCert === "ALL"
                                            ? "bg-white text-gray-800 shadow-sm ring-1 ring-black/5"
                                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                                            }`}
                                    >
                                        Semua
                                    </button>
                                    <button
                                        onClick={() => setFilterCert("CERTIFIED")}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${filterCert === "CERTIFIED"
                                            ? "bg-white text-emerald-600 shadow-sm ring-1 ring-black/5"
                                            : "text-gray-500 hover:text-emerald-600 hover:bg-emerald-50/50"
                                            }`}
                                    >
                                        <CheckCircle2 size={12} />
                                        Ada
                                    </button>
                                    <button
                                        onClick={() => setFilterCert("UNCERTIFIED")}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5 ${filterCert === "UNCERTIFIED"
                                            ? "bg-white text-amber-600 shadow-sm ring-1 ring-black/5"
                                            : "text-gray-500 hover:text-amber-600 hover:bg-amber-50/50"
                                            }`}
                                    >
                                        <AlertCircle size={12} />
                                        Belum
                                    </button>
                                </div>
                            </div>

                            {/* Type Filter Group */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1">Jenis Bangunan</label>
                                <div className="flex bg-gray-100/80 p-1 rounded-xl gap-1">
                                    <button
                                        onClick={() => setFilterType("ALL")}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${filterType === "ALL"
                                            ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                                            : "text-gray-500 hover:text-blue-600 hover:bg-blue-50/50"
                                            }`}
                                    >
                                        Semua
                                    </button>
                                    <button
                                        onClick={() => setFilterType("TOWER")}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${filterType === "TOWER"
                                            ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                                            : "text-gray-500 hover:text-blue-600 hover:bg-blue-50/50"
                                            }`}
                                    >
                                        🗼 Tower
                                    </button>
                                    <button
                                        onClick={() => setFilterType("GARDU")}
                                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${filterType === "GARDU"
                                            ? "bg-white text-amber-600 shadow-sm ring-1 ring-black/5"
                                            : "text-gray-500 hover:text-amber-600 hover:bg-amber-50/50"
                                            }`}
                                    >
                                        ⚡ Gardu
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>

            {/* --- LEGEND (KETERANGAN) --- */}
            <div className="absolute top-20 right-4 md:top-4 md:right-4 z-[400] flex flex-col items-end gap-2 pointer-events-none">
                {/* Toggle Button (Visible on Mobile/Tablet to save space, or just always show toggle) */}
                <button
                    onClick={() => setShowLegend(!showLegend)}
                    className="w-8 h-8 bg-white/95 backdrop-blur-sm shadow-md border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:text-pln-blue pointer-events-auto transition-colors"
                    title="Keterangan Icon"
                >
                    <Info size={18} />
                </button>

                {/* Legend Box */}
                {showLegend && (
                    <div className="bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-200/80 w-44 pointer-events-auto animate-in fade-in slide-in-from-top-1">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">Legenda Peta</h4>

                        {/* Status Colors */}
                        <div className="mb-3 space-y-1.5">
                            <p className="text-[9px] font-semibold text-gray-500 mb-1">Status Sertifikat</p>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-600 border border-blue-200 shadow-sm"></div>
                                <span className="text-[10px] font-bold text-gray-700">Ada Sertifikat</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500 border border-red-200 shadow-sm"></div>
                                <span className="text-[10px] font-bold text-gray-700">Belum Sertifikat</span>
                            </div>
                        </div>

                        {/* Asset Types */}
                        <div className="space-y-1.5">
                            <p className="text-[9px] font-semibold text-gray-500 mb-1">Jenis Aset</p>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-4 h-4 rounded bg-gray-100/50">
                                    <MapPin size={14} className="text-gray-700" />
                                </div>
                                <span className="text-[10px] font-medium text-gray-600">Tapak Tower</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center justify-center w-4 h-4 rounded bg-gray-100/50">
                                    <Zap size={14} className="text-gray-700" />
                                </div>
                                <span className="text-[10px] font-medium text-gray-600">Gardu Induk</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* --- MOBILE BOTTOM SHEET (COMPACT) --- */}
            {selectedAsset && (
                <div className="absolute z-[500] bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.15)] bottom-0 left-0 w-full rounded-t-2xl border-t border-gray-200 animate-in slide-in-from-bottom-10 md:hidden pb-safe flex flex-col max-h-[85vh]">
                    {/* Drag Handle */}
                    <div onClick={() => setSelectedAsset(null)} className="w-full flex justify-center py-3 cursor-pointer active:bg-gray-50 shrink-0">
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                    </div>

                    <div className="px-5 pb-6 space-y-4 overflow-y-auto custom-scrollbar">
                        {/* Header: Photo & Basic Info */}
                        <div className="flex gap-4">
                            {/* Photo Thumbnail */}
                            <div className="w-20 h-20 shrink-0 bg-gray-100 rounded-xl overflow-hidden border border-gray-200 relative">
                                {selectedAsset.fotoAset && selectedAsset.fotoAset.length > 0 ? (
                                    <img
                                        src={selectedAsset.fotoAset[0].url}
                                        alt="Aset"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <MapPin size={24} />
                                    </div>
                                )}
                            </div>

                            {/* Title & Status */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded uppercase tracking-wide">
                                        SAP: {selectedAsset.kodeSap}
                                    </span>
                                    {selectedAsset.permasalahanAset && !selectedAsset.permasalahanAset.toLowerCase().includes("clean") ? (
                                        <span className="text-[10px] font-bold bg-red-50 text-red-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                            <AlertCircle size={10} /> Masalah
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                            <CheckCircle2 size={10} /> Aman
                                        </span>
                                    )}
                                </div>
                                <h2 className="font-bold text-gray-900 text-lg leading-tight line-clamp-2 mb-1">
                                    {selectedAsset.deskripsi || "Aset Tanpa Nama"}
                                </h2>
                                <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                                    <MapPin size={12} />
                                    {selectedAsset.alamat || "Alamat kosong"}
                                </p>
                            </div>
                        </div>

                        {/* Grid Data */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Sertifikat</p>
                                <div className={`text-xs font-bold flex items-center gap-1.5 ${hasCertificate(selectedAsset) ? "text-emerald-600" : "text-amber-600"}`}>
                                    {hasCertificate(selectedAsset) ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                    {hasCertificate(selectedAsset) ? "Ada" : "Belum"}
                                </div>
                            </div>
                            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                                <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Tahun</p>
                                <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                    <Calendar size={14} className="text-gray-400" />
                                    {selectedAsset.tahunPerolehan || "-"}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="grid grid-cols-2 gap-3 pt-2">
                            {/* Tombol Detail (Primary) */}
                            <a
                                href={`/assets/${selectedAsset.id}`}
                                className="col-span-2 flex items-center justify-center gap-2 w-full py-3 bg-pln-blue text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 active:scale-95 transition-all"
                            >
                                Lihat Detail Lengkap
                                <ChevronRight size={16} />
                            </a>

                            {/* Tombol Navigasi (Secondary) */}
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedAsset.koordinatY},${selectedAsset.koordinatX}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="col-span-2 flex items-center justify-center gap-2 w-full py-2.5 bg-white text-gray-700 border border-gray-200 rounded-xl text-xs font-bold hover:bg-gray-50 active:bg-gray-100 transition-colors"
                            >
                                <ExternalLink size={14} />
                                Rute ke Lokasi
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}