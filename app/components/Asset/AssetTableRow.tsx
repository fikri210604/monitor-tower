"use client";

import Link from "next/link";
import { Trash2, Edit, MapPin, Image as ImageIcon, FileText, Eye } from "lucide-react";
import { Asset } from "@/types/asset";
import { formatAddress, formatCoordinates, filterRealPhotos, hasRealPhotos, hasCertificate, isCleanStatus, formatNumber, getDisplayValue } from "@/utils/assetHelpers";

interface AssetTableRowProps {
    asset: Asset;
    onDelete: (id: string) => void;
    onEdit: (asset: Asset) => void;
    onLocate: (asset: Asset) => void;
    onViewPhotos: (photos: { url: string; id: string }[]) => void;
    userRole?: string;
}

export default function AssetTableRow({
    asset,
    onDelete,
    onEdit,
    onLocate,
    onViewPhotos,
    userRole,
}: AssetTableRowProps) {
    const realPhotos = filterRealPhotos(asset.fotoAset);
    const hasFoto = hasRealPhotos(asset);
    const hasSertifikat = hasCertificate(asset);
    const shortAddress = formatAddress(asset);

    return (
        <tr className="hover:bg-gray-50/50 transition-colors">
            <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">
                {getDisplayValue(asset.kodeSap)}
            </td>

            <td className="px-4 py-3 text-gray-600 font-medium">{getDisplayValue(asset.deskripsi)}</td>

            <td className="px-4 py-3 text-gray-600">
                {formatNumber(asset.luasTanah)}
            </td>

            <td className="px-4 py-3 text-gray-600">
                {getDisplayValue(asset.tahunPerolehan)}
            </td>

            {/* Alamat */}
            <td className="px-4 py-3 text-gray-600 truncate max-w-xs" title={asset.alamat || ""}>
                {asset.alamat || "-"}
            </td>

            {/* Desa */}
            <td className="px-4 py-3 text-gray-600">
                {asset.desa || "-"}
            </td>

            {/* Kecamatan */}
            <td className="px-4 py-3 text-gray-600">
                {asset.kecamatan || "-"}
            </td>

            {/* Kabupaten */}
            <td className="px-4 py-3 text-gray-600">
                {asset.kabupaten || "-"}
            </td>

            {/* Provinsi */}
            <td className="px-4 py-3 text-gray-600">
                {asset.provinsi || "-"}
            </td>

            {/* Nomor Sertifikat (Just Text) */}
            <td className="px-4 py-3 text-gray-600 font-medium">
                {userRole === "OPERATOR" ? (
                    <span className="text-gray-400 italic text-xs">Restricted</span>
                ) : (
                    getDisplayValue(asset.nomorSertifikat)
                )}
            </td>

            {/* File Sertifikat (Link/Download) */}
            <td className="px-4 py-3">
                {userRole === "OPERATOR" ? (
                    <span className="text-gray-400 text-xs">-</span>
                ) : hasSertifikat ? (
                    <a
                        href={asset.linkSertifikat!}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-pln-blue hover:bg-blue-100 transition-colors"
                        title={asset.jenisDokumen || "Unduh Sertifikat"}
                    >
                        <FileText className="w-3.5 h-3.5" />
                        <span className="text-xs font-semibold">Lihat File</span>
                    </a>
                ) : (
                    <span className="text-gray-400 text-xs">-</span>
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
                        onClick={() => onViewPhotos(realPhotos)}
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
                <Link
                    href={`/assets/${asset.id}`}
                    className="p-1.5 rounded-lg transition-colors text-indigo-600 hover:bg-indigo-50"
                    title="Lihat Detail"
                >
                    <Eye className="w-4 h-4" />
                </Link>

                <IconAction
                    title="Lihat di Peta"
                    onClick={() => onLocate(asset)}
                >
                    <MapPin className="w-4 h-4" />
                </IconAction>

                {(userRole === "MASTER" || userRole === "ADMIN" || userRole === "SUPER_ADMIN") && (
                    <>
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
                    </>
                )}
            </td>
        </tr>
    );
}

/* =========================
   Helper Components
========================= */

function StatusBadge({ status }: { status: string | null }) {
    if (!status) return <span className="text-gray-400">-</span>;

    const cleanStatus = isCleanStatus(status);
    const colorClass = cleanStatus
        ? "bg-green-100 text-green-700"
        : "bg-red-100 text-red-700";

    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colorClass}`}>
            {status}
        </span>
    );
}

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

