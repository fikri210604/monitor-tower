"use client";

import { AlertTriangle, Calendar, ChevronRight } from "lucide-react";
import Link from "next/link";

interface ExpiryWidgetProps {
    expiringAssets: any[];
}

export default function ExpiryWidget({ expiringAssets }: ExpiryWidgetProps) {
    if (expiringAssets.length === 0) return null;

    return (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-amber-100 shrink-0">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800">
                        {expiringAssets.length} Sertifikat Akan Kedaluwarsa
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                        Terdapat aset yang masa sertifikatnya akan berakhir dalam 30 hari ke depan. Mohon segera ditindaklanjuti.
                    </p>

                    <div className="space-y-2 bg-white rounded-xl border border-amber-100 divide-y divide-amber-50 overflow-hidden">
                        {expiringAssets.slice(0, 3).map((asset) => (
                            <Link
                                key={asset.id}
                                href={`/assets/${asset.id}`}
                                className="flex items-center justify-between p-3 hover:bg-amber-50/50 transition-colors group"
                            >
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">SAP: {asset.kodeSap}</p>
                                    <p className="text-xs text-gray-500 line-clamp-1">{asset.deskripsi}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-right">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
                                            <Calendar size={12} />
                                            {asset.tanggalAkhirSertifikat
                                                ? new Date(asset.tanggalAkhirSertifikat).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                                                : "-"}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-amber-500 transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>

                    {expiringAssets.length > 3 && (
                        <div className="mt-3 text-center">
                            <Link href="/assets?filter=expiring" className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline">
                                Lihat {expiringAssets.length - 3} aset lainnya →
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
