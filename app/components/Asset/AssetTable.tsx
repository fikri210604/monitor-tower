"use client";

import { Trash2, Edit, MapPin, Image as ImageIcon, FileText, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

/* =========================
   Types
========================= */
/* =========================
   Types
========================= */
interface Asset {
    id: string;
    kodeSap: string;
    deskripsi: string | null;
    luasTanah: number | null;
    tahunPerolehan: number | null;

    // Lokasi
    alamat: string | null;
    desa: string | null;
    kecamatan: string | null;
    kabupaten: string | null;
    provinsi: string | null;
    koordinatX: number;
    koordinatY: number;

    // Legal
    jenisDokumen: string | null;
    nomorSertifikat: string | null;
    linkSertifikat: string | null;

    // Fisik
    penguasaanTanah: string | null;
    jenisBangunan: string | null;
    permasalahanAset: string | null;

    fotoAset?: { url: string; kategori?: string }[] | null;
}

interface AssetTableProps {
    assets: Asset[];
    onDelete: (id: string) => void;
    onEdit: (asset: Asset) => void;
    onLocate: (asset: Asset) => void;
}

/* =========================
   Main Component
========================= */
export default function AssetTable({
    assets,
    onDelete,
    onEdit,
    onLocate,
}: AssetTableProps) {
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Calculate pagination
    const totalPages = Math.ceil(assets.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAssets = assets.slice(startIndex, endIndex);

    // Reset to page 1 when assets change
    useState(() => {
        setCurrentPage(1);
    });

    return (
        <div className="space-y-4">
            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium whitespace-nowrap">
                        <tr>
                            <th className="px-4 py-3">Kode SAP</th>
                            <th className="px-4 py-3">Deskripsi</th>
                            <th className="px-4 py-3">Luas (m²)</th>
                            <th className="px-4 py-3">Tahun</th>
                            <th className="px-4 py-3">Alamat</th>
                            <th className="px-4 py-3">Lokasi</th>
                            <th className="px-4 py-3">Dokumen</th>
                            <th className="px-4 py-3">Sertifikat</th>
                            <th className="px-4 py-3">Masalah</th>
                            <th className="px-4 py-3 text-center">Foto</th>
                            <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {paginatedAssets.length === 0 ? (
                            <tr>
                                <td colSpan={11} className="px-4 py-8 text-center text-gray-400">
                                    Belum ada data aset.
                                </td>
                            </tr>
                        ) : (
                            paginatedAssets.map((asset) => {
                                // Filter real photos (exclude certificates if categorized as such, though we have separate link now)
                                const realPhotos = asset.fotoAset?.filter(f => f.kategori !== "SERTIFIKAT") || [];
                                const hasFoto = realPhotos.length > 0;
                                const hasSertifikat = Boolean(asset.linkSertifikat);

                                // Format Address: Desa, Kec, Kab
                                const addressParts = [asset.desa, asset.kecamatan, asset.kabupaten].filter(Boolean);
                                const shortAddress = addressParts.length > 0 ? addressParts.join(", ") : asset.alamat || "-";

                                return (
                                    <tr
                                        key={asset.id}
                                        className="hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                                            {asset.kodeSap || "-"}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600 font-medium">
                                            {asset.deskripsi || "-"}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {asset.luasTanah?.toLocaleString("id-ID") || "-"}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            {asset.tahunPerolehan || "-"}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600 truncate max-w-xs" title={shortAddress}>
                                            {shortAddress}
                                        </td>

                                        <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">
                                            {asset.koordinatY.toFixed(5)}, {asset.koordinatX.toFixed(5)}
                                        </td>

                                        <td className="px-4 py-3 text-gray-600">
                                            <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium">
                                                {asset.jenisDokumen || "-"}
                                            </span>
                                        </td>

                                        {/* Sertifikat Link */}
                                        <td className="px-4 py-3">
                                            {hasSertifikat ? (
                                                <a
                                                    href={asset.linkSertifikat!}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex items-center gap-1 text-pln-blue hover:underline whitespace-nowrap"
                                                >
                                                    <FileText className="w-3 h-3" />
                                                    <span className="text-xs font-semibold">{asset.nomorSertifikat || "Unduh"}</span>
                                                </a>
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">
                                                    {asset.nomorSertifikat || "-"}
                                                </span>
                                            )}
                                        </td>

                                        {/* Masalah (Highlight if not clean) */}
                                        <td className="px-4 py-3">
                                            <StatusBadge status={asset.permasalahanAset} />
                                        </td>

                                        {/* Foto */}
                                        <td className="px-4 py-3 text-center">
                                            {hasFoto ? (
                                                <IconButton
                                                    title={`Lihat Foto (${realPhotos.length})`}
                                                    color="blue"
                                                    onClick={() =>
                                                        window.open(realPhotos[0].url, "_blank")
                                                    }
                                                >
                                                    <ImageIcon className="w-4 h-4" />
                                                </IconButton>
                                            ) : (
                                                <IconDisabled>
                                                    <ImageIcon className="w-4 h-4" />
                                                </IconDisabled>
                                            )}
                                        </td>

                                        {/* Aksi */}
                                        <td className="px-4 py-3 flex justify-end gap-2">
                                            <IconAction
                                                title="Lihat di Peta"
                                                onClick={() => onLocate(asset)}
                                            >
                                                <MapPin className="w-4 h-4" />
                                            </IconAction>

                                            <IconAction
                                                title="Edit"
                                                color="gray"
                                                onClick={() => onEdit(asset)}
                                            >
                                                <Edit className="w-4 h-4" />
                                            </IconAction>

                                            <IconAction
                                                title="Hapus"
                                                color="red"
                                                onClick={() => onDelete(asset.id)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </IconAction>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {assets.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Left: Info */}
                        <div className="text-sm text-gray-600">
                            Menampilkan <span className="font-semibold text-gray-800">{startIndex + 1}</span> - <span className="font-semibold text-gray-800">{Math.min(endIndex, assets.length)}</span> dari <span className="font-semibold text-gray-800">{assets.length}</span> data
                        </div>

                        {/* Center: Page Navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Halaman Sebelumnya"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-1">
                                {/* Show page numbers (max 5) */}
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                ? "bg-pln-blue text-white"
                                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Halaman Berikutnya"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Right: Items per page */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Per halaman:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => {
                                    setItemsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-pln-blue/20"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: string | null }) {
    if (!status) return <span className="text-gray-400">-</span>;

    const isClean = status.toLowerCase().includes("clean") || status.toLowerCase().includes("aman");
    const colorClass = isClean ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colorClass}`}>
            {status}
        </span>
    );
}

/* =========================
   Small UI Helpers
========================= */

function IconButton({
    children,
    title,
    color,
    onClick,
}: {
    children: React.ReactNode;
    title: string;
    color: "blue" | "green";
    onClick?: () => void;
}) {
    const colors = {
        blue: "bg-blue-50 text-pln-blue hover:bg-blue-100",
        green: "bg-green-50 text-green-600 hover:bg-green-100",
    };

    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`p-1.5 rounded-lg transition-colors ${colors[color]}`}
        >
            {children}
        </button>
    );
}

function IconAction({
    children,
    title,
    color = "blue",
    onClick,
}: {
    children: React.ReactNode;
    title: string;
    color?: "blue" | "gray" | "red";
    onClick: () => void;
}) {
    const colors = {
        blue: "text-pln-blue hover:bg-blue-50",
        gray: "text-gray-500 hover:bg-gray-100",
        red: "text-red-500 hover:bg-red-50",
    };

    return (
        <button
            type="button"
            title={title}
            onClick={onClick}
            className={`p-1.5 rounded-lg transition-colors ${colors[color]}`}
        >
            {children}
        </button>
    );
}

function IconDisabled({ children }: { children: React.ReactNode }) {
    return <span className="inline-flex p-1.5 text-gray-300">{children}</span>;
}
