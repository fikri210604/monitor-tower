"use client";

import { Trash2, Edit, MapPin, Image as ImageIcon, FileText } from "lucide-react";
import { Asset } from "@/types/asset";
import { formatAddress, formatCoordinates, filterRealPhotos, hasRealPhotos, hasCertificate, isCleanStatus, formatNumber, getDisplayValue } from "@/utils/assetHelpers";

interface AssetTableRowProps {
    asset: Asset;
    onDelete: (id: string) => void;
    onEdit: (asset: Asset) => void;
    onLocate: (asset: Asset) => void;
}

export default function AssetTableRow({
    asset,
    onDelete,
    onEdit,
    onLocate,
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

            <td className="px-4 py-3 text-gray-600 truncate max-w-xs" title={shortAddress}>
                {shortAddress}
            </td>

            <td className="px-4 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">
                {formatCoordinates(asset.koordinatY, asset.koordinatX)}
            </td>

            <td className="px-4 py-3 text-gray-600">
                <span className="px-2 py-1 rounded bg-gray-100 text-xs font-medium">
                    {getDisplayValue(asset.jenisDokumen)}
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
                        <span className="text-xs font-semibold">
                            {asset.nomorSertifikat || "Unduh"}
                        </span>
                    </a>
                ) : (
                    <span className="text-gray-400 text-xs italic">
                        {getDisplayValue(asset.nomorSertifikat)}
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
                        onClick={() => window.open(realPhotos[0].url, "_blank")}
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

