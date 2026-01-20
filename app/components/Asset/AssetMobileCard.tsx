import { Asset } from "@/types/asset";
import { Edit, Trash2, MapPin, CheckCircle2, AlertCircle, FileText, Zap, TowerControl } from "lucide-react";
import Image from "next/image";

interface AssetMobileCardProps {
    asset: Asset;
    onDelete: (id: string) => void;
    onEdit: (asset: Asset) => void;
    onLocate: (asset: Asset) => void;
    onViewPhotos: (photos: any[]) => void;
    userRole?: string;
}

export default function AssetMobileCard({
    asset,
    onDelete,
    onEdit,
    onLocate,
    onViewPhotos,
    userRole
}: AssetMobileCardProps) {
    const hasCertificate = asset.nomorSertifikat && asset.nomorSertifikat !== "-" && asset.nomorSertifikat !== "";
    const isProblem = asset.permasalahanAset && !asset.permasalahanAset.toLowerCase().includes("clean");
    const canEdit = userRole === "MASTER" || userRole === "ADMIN";

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-4">
            {/* Thumbnail */}
            <div
                className="w-20 h-20 shrink-0 bg-gray-100 rounded-lg overflow-hidden relative cursor-pointer"
                onClick={() => asset.fotoAset && asset.fotoAset.length > 0 && onViewPhotos(asset.fotoAset)}
            >
                {asset.fotoAset && asset.fotoAset.length > 0 ? (
                    <Image
                        src={asset.fotoAset[0].url}
                        alt="Thumbnail"
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                        {asset.jenisBangunan === "GARDU_INDUK" ? <Zap size={20} /> : <TowerControl size={20} />}
                    </div>
                )}
                {asset.fotoAset && asset.fotoAset.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[9px] text-center py-0.5">
                        {asset.fotoAset.length} Foto
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-[10px] font-bold bg-blue-50 text-pln-blue px-1.5 py-0.5 rounded uppercase tracking-wide">
                                {asset.kodeSap}
                            </span>
                            <h3 className="font-bold text-gray-800 text-sm mt-1 line-clamp-1 leading-tight">
                                {asset.deskripsi || "Tanpa Deskripsi"}
                            </h3>
                        </div>

                        {/* Status Icon */}
                        {isProblem ? (
                            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                        ) : (
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        )}
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 line-clamp-1">
                        <MapPin size={12} className="shrink-0" />
                        {asset.alamat || asset.desa || "Lokasi tdk tersedia"}
                    </div>
                </div>

                {/* Actions & Footer */}
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-50">
                    <div className={`text-[10px] font-bold flex items-center gap-1 ${hasCertificate ? "text-emerald-600" : "text-amber-600"}`}>
                        {hasCertificate ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {hasCertificate ? "Bersertifikat" : "Belum Sertifikat"}
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onLocate(asset)}
                            className="p-1.5 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                            title="Lokasi"
                        >
                            <MapPin size={14} />
                        </button>
                        <a
                            href={`/assets/${asset.id}`}
                            className="p-1.5 text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100"
                            title="Detail"
                        >
                            <FileText size={14} />
                        </a>
                        {canEdit && (
                            <>
                                <button
                                    onClick={() => onEdit(asset)}
                                    className="p-1.5 text-amber-600 bg-amber-50 rounded-md hover:bg-amber-100"
                                    title="Edit"
                                >
                                    <Edit size={14} />
                                </button>
                                <button
                                    onClick={() => onDelete(asset.id)}
                                    className="p-1.5 text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                                    title="Hapus"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
