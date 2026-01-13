"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { History, Search, FileSpreadsheet, Plus, Edit, Trash2, ShieldAlert } from "lucide-react";

export default function HistoryPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Auth Check
    useEffect(() => {
        if (status === "unauthenticated") router.push("/auth/signin");
        if (status === "authenticated") {
            const role = (session?.user as any).role;
            if (role !== "MASTER" && role !== "ADMIN") {
                router.push("/dashboard");
            }
        }
    }, [status, session, router]);

    const fetchLogs = async (p = 1) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/history?page=${p}&limit=20`);
            const data = await res.json();
            if (res.ok) {
                setLogs(data.data);
                setTotalPages(data.meta.totalPages);
                setPage(p);
            }
        } catch (error) {
            console.error("Failed to fetch logs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === "authenticated") fetchLogs();
    }, [status]);

    const getIcon = (action: string) => {
        switch (action) {
            case "IMPORT_EXCEL": return <FileSpreadsheet className="text-green-600" size={18} />;
            case "CREATE_ASSET": return <Plus className="text-blue-600" size={18} />;
            case "UPDATE_ASSET": return <Edit className="text-amber-600" size={18} />;
            case "DELETE_ASSET": return <Trash2 className="text-red-600" size={18} />;
            default: return <ShieldAlert className="text-gray-500" size={18} />;
        }
    };

    const formatAction = (action: string) => {
        return action.replace(/_/g, " ");
    };

    const formatDetails = (details: string | null) => {
        if (!details) return "-";
        try {
            const obj = JSON.parse(details);

            // 1. Import Excel
            if (obj.action === "REPLACE_ALL" || obj.action === "UPDATE_EXISTING") {
                return (
                    <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-gray-700">
                            {obj.action === "REPLACE_ALL" ? "Ganti Semua" : "Update & Tambah"}
                        </span>
                        <span>Total: {obj.totalRows} baris</span>
                        <div className="flex gap-2 text-[10px]">
                            <span className="text-green-600 bg-green-50 px-1 rounded">+{obj.created} Baru</span>
                            <span className="text-amber-600 bg-amber-50 px-1 rounded">~{obj.updated} Update</span>
                            {obj.failed > 0 && <span className="text-red-600 bg-red-50 px-1 rounded">!{obj.failed} Gagal</span>}
                        </div>
                    </div>
                );
            }

            // 2. Delete All
            if (obj.action === "DELETE_ALL_BEFORE_IMPORT") {
                return <span className="text-red-600 font-bold">Menghapus {obj.count} data lama (Reset)</span>;
            }

            // 3. Asset Actions (Create/Update/Delete)
            if (obj.sap) {
                return (
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-800">SAP: {obj.sap}</span>
                        {obj.deskripsi && <span className="text-gray-500 italic line-clamp-1">{obj.deskripsi}</span>}
                    </div>
                );
            }

            // Fallback
            return JSON.stringify(obj);
        } catch (e) {
            return details;
        }
    };

    if (status === "loading" || loading) {
        return <div className="p-8 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-pln-blue border-t-transparent rounded-full"></div></div>;
    }

    return (
        <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto font-sans">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <History className="text-pln-blue" />
                        Riwayat Aktivitas
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Memantau semua aktivitas penambahan, perubahan, dan penghapusan data.
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 font-bold text-gray-700 uppercase text-xs">Waktu</th>
                                <th className="px-6 py-3 font-bold text-gray-700 uppercase text-xs">User</th>
                                <th className="px-6 py-3 font-bold text-gray-700 uppercase text-xs">Aksi</th>
                                <th className="px-6 py-3 font-bold text-gray-700 uppercase text-xs">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-3 whitespace-nowrap text-xs text-gray-500">
                                        {new Date(log.createdAt).toLocaleString("id-ID")}
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-gray-800">{log.user?.name || "Unknown"}</span>
                                            <span className="text-[10px] text-gray-400 uppercase">{log.user?.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-gray-100 p-1.5 rounded-lg">
                                                {getIcon(log.action)}
                                            </div>
                                            <span className="font-semibold text-gray-700 text-xs">
                                                {formatAction(log.action)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-xs font-mono text-gray-600">
                                        {formatDetails(log.details)}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">
                                        Belum ada aktivitas tercatat.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                    <p className="text-xs text-gray-500">Halaman {page} dari {totalPages}</p>
                    <div className="flex gap-2">
                        <button
                            disabled={page <= 1}
                            onClick={() => fetchLogs(page - 1)}
                            className="px-3 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 disabled:opacity-50"
                        >
                            Sebelumnya
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => fetchLogs(page + 1)}
                            className="px-3 py-1 bg-white border border-gray-300 rounded text-xs hover:bg-gray-50 disabled:opacity-50"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
