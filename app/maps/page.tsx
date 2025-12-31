"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { 
    X, ExternalLink, TowerControl, Calendar, Ruler, MapPin, 
    CheckCircle2, AlertCircle, Search, ChevronRight, Copy 
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

    useEffect(() => {
        const fetchAssets = async () => { 
            try { 
                const res = await fetch("/api/assets"); 
                if(res.ok) {
                    const data = await res.json();
                    setAssets(data); 
                }
            } catch(e) {
                console.error("Gagal memuat aset", e);
            } 
        };
        fetchAssets();
    }, []);

    const filteredAssets = useMemo(() => {
        if (!searchQuery) return [];
        const q = searchQuery.toLowerCase();
        return assets.filter(a => 
            String(a.kodeSap).includes(q) || 
            (a.alamat && a.alamat.toLowerCase().includes(q)) || 
            (a.desa && a.desa.toLowerCase().includes(q))
        ).slice(0, 5);
    }, [searchQuery, assets]);

    const handleSelectResult = (asset: any) => {
        setFocusedLocation([asset.koordinatY, asset.koordinatX]);
        // Jika di layar HP (lebar < 768), buka panel detail bawah
        if (window.innerWidth < 768) {
            setSelectedAsset(asset);
        }
        setSearchQuery(""); 
        setShowSuggestions(false); 
    };

    const hasCertificate = (a: any) => a.nomorSertifikat && a.nomorSertifikat !== "-" && a.nomorSertifikat !== "";

    return (
        <div className="h-[calc(100vh-theme(spacing.24))] w-full rounded-xl overflow-hidden shadow-sm border border-gray-100 relative bg-gray-50 group">
            
            <Map 
                markers={assets} 
                focusedLocation={focusedLocation} 
                onMarkerClick={(asset) => {
                    setSelectedAsset(asset);
                    setFocusedLocation([asset.koordinatY, asset.koordinatX]);
                }} 
            />

            {/* --- SEARCH BAR: CENTER FLOATING --- */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] md:w-[400px] z-[400]">
                <div className="relative">
                    <div className="bg-white/95 backdrop-blur-sm rounded-full shadow-md border border-gray-200 flex items-center px-4 py-2.5 gap-2 focus-within:ring-2 focus-within:ring-blue-500/30 transition-shadow">
                        <Search className="w-4 h-4 text-gray-400 shrink-0" />
                        <input 
                            type="text"
                            placeholder="Cari Kode SAP atau Alamat..."
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
                                    <div>
                                        <span className="font-bold text-gray-800 text-xs bg-gray-100 px-1.5 py-0.5 rounded mr-2">{asset.kodeSap}</span>
                                        <span className="text-xs text-gray-600 line-clamp-1">{asset.alamat || asset.desa}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- MOBILE BOTTOM SHEET (COMPACT) --- */}
            {selectedAsset && (
                <div className="absolute z-[500] bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.15)] bottom-0 left-0 w-full rounded-t-xl border-t border-gray-200 animate-in slide-in-from-bottom-10 md:hidden pb-safe">
                    {/* Drag Handle */}
                    <div onClick={() => setSelectedAsset(null)} className="w-full flex justify-center py-2 cursor-pointer active:bg-gray-50">
                        <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
                    </div>

                    <div className="px-4 pb-4 space-y-3">
                        {/* Header Mobile */}
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                                    <TowerControl className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase">Kode SAP</p>
                                    <h2 className="font-bold text-gray-900 text-lg leading-none">{selectedAsset.kodeSap}</h2>
                                </div>
                            </div>
                            <div className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 ${hasCertificate(selectedAsset) ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                {hasCertificate(selectedAsset) ? "Bersertifikat" : "Belum Sertifikat"}
                            </div>
                        </div>

                        {/* Grid Data */}
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-gray-50 p-2 rounded flex items-center gap-2">
                                <Ruler size={14} className="text-gray-400"/>
                                <span className="font-semibold text-gray-700">{selectedAsset.luasTanah || "-"} m²</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded flex items-center gap-2">
                                <Calendar size={14} className="text-gray-400"/>
                                <span className="font-semibold text-gray-700">{selectedAsset.tahunPerolehan || "-"}</span>
                            </div>
                        </div>

                        {/* Alamat & Maps */}
                        <div className="space-y-2">
                             <div className="text-xs text-gray-600 bg-gray-50 p-2.5 rounded border border-gray-100 leading-snug flex items-start gap-2">
                                <MapPin size={14} className="mt-0.5 shrink-0 text-gray-400"/>
                                {selectedAsset.alamat || "Alamat tidak tersedia"}
                            </div>

                            <a 
                               href={`https://www.google.com/maps/search/?api=1&query=${selectedAsset.koordinatY},${selectedAsset.koordinatX}`} 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 active:bg-blue-700 text-white rounded-lg text-sm font-bold shadow-sm"
                            >
                                <ExternalLink size={16} />
                                Navigasi Google Maps
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}