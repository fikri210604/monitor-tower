"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Map = dynamic(() => import("@/app/components/Map"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 flex items-center justify-center animate-pulse">Memuat Peta...</div>,
});

export default function MapsPage() {
    const [assets, setAssets] = useState<any[]>([]);

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const res = await fetch("/api/assets");
                if (res.ok) {
                    const data = await res.json();
                    setAssets(data);
                }
            } catch (error) {
                console.error("Failed to fetch assets", error);
            }
        };
        fetchAssets();
    }, []);

    return (
        <div className="h-[calc(100vh-theme(spacing.24))] w-full rounded-2xl overflow-hidden shadow-sm border border-gray-100 relative">
            <Map markers={assets} />

            <div className="absolute bottom-4 left-4 z-[400] bg-white p-3 rounded-lg shadow-md border border-gray-100 max-w-xs">
                <h3 className="font-bold text-gray-800 text-sm mb-1">Peta Sebaran Aset</h3>
                <p className="text-xs text-gray-500">Menampilkan {assets.length} titik aset tower.</p>
            </div>
        </div>
    );
}
