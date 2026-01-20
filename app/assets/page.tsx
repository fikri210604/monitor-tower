"use client";

import { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";
import ExcelImport from "@/app/components/Asset/ExcelImport";
import AssetTable from "@/app/components/Asset/AssetTable";
import AssetFormModal from "@/app/components/Asset/AssetFormModal";
import Toast, { ToastType } from "@/app/components/ui/Toast";
import { Plus, RefreshCw } from "lucide-react";

// Dynamic import Map to avoid SSR
const Map = dynamic(() => import("@/app/components/Map"), {
    ssr: false,
    loading: () => <div className="h-[400px] bg-gray-100 flex items-center justify-center rounded-xl animate-pulse">Memuat Peta...</div>,
});

export default function AssetsPage() {
    const { data: session } = useSession();
    const userRole = (session?.user as any)?.role;
    const canManage = userRole === "MASTER" || userRole === "ADMIN";

    const [assets, setAssets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showImport, setShowImport] = useState(false);

    // CRUD States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAsset, setEditingAsset] = useState<any>(null);

    // Toast State
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const showToast = (message: string, type: ToastType) => {
        setToast({ message, type });
    };

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/assets?limit=9999"); // Fetch all assets
            if (res.ok) {
                const response = await res.json();
                // Handle both old (array) and new (object with data) formats
                const assetsData = Array.isArray(response) ? response : response.data;
                setAssets(assetsData);
            } else {
                showToast("Gagal memuat data aset", "error");
            }
        } catch (error) {
            console.error("Failed to fetch assets:", error);
            showToast("Terjadi kesalahan saat memuat data", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus aset ini?")) return;

        try {
            const res = await fetch(`/api/assets/${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("Aset berhasil dihapus", "success");
                fetchAssets();
            } else {
                showToast("Gagal menghapus aset", "error");
            }
        } catch (error) {
            console.error("Delete failed", error);
            showToast("Terjadi kesalahan saat menghapus", "error");
        }
    };

    const handleEdit = (asset: any) => {
        setEditingAsset(asset);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingAsset(null);
        setIsModalOpen(true);
    };

    const handleSave = async (data: any) => {
        const method = editingAsset ? "PUT" : "POST";
        const url = editingAsset ? `/api/assets/${editingAsset.id}` : "/api/assets";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Gagal menyimpan");
            }

            showToast(editingAsset ? "Aset berhasil diperbarui" : "Aset berhasil ditambahkan", "success");
            fetchAssets();
        } catch (error: any) {
            showToast(error.message || "Gagal menyimpan data", "error");
            throw error; // Re-throw so modal understands it failed
        }
    };

    const handleLocate = (asset: any) => {
        // alert(`Lokasi: ${asset.alamat}\nKoordinat: ${asset.koordinatY}, ${asset.koordinatX}`);
        showToast("Menavigasi ke lokasi aset", "success");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6 relative">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Data Aset Tower</h1>
                    <p className="text-gray-500 text-sm">Kelola dan monitor sebaran aset tower PLN</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => fetchAssets()}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    {canManage && (
                        <>
                            <button
                                onClick={() => setShowImport(!showImport)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${showImport ? "bg-gray-200 text-gray-700" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                                    }`}
                            >
                                {showImport ? "Tutup Import" : "Import Excel"}
                            </button>
                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-2 px-4 py-2 bg-pln-blue text-white rounded-lg hover:bg-sky-600 transition-colors shadow-sm font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                Tambah Manual
                            </button>
                        </>
                    )}
                </div>
            </div>

            {showImport && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <ExcelImport onImportSuccess={() => {
                        showToast("Import berhasil!", "success");
                        fetchAssets();
                        setShowImport(false);
                    }} />
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map Section */}
                <div className="lg:col-span-3 xl:col-span-2 h-[300px] lg:h-[500px] bg-white p-1 rounded-2xl shadow-sm border border-gray-100">
                    <Map markers={assets} />
                </div>

                {/* Stats / Mini List */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                    <h3 className="font-bold text-gray-800 mb-4">Ringkasan</h3>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-gray-500 text-xs uppercase font-semibold">Total Aset</p>
                            <p className="text-2xl font-bold text-pln-blue mt-1">{assets.length}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-gray-500 text-xs uppercase font-semibold">Terpetakan</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">
                                {assets.filter(a => a.koordinatX && a.koordinatY).length}
                            </p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col">
                        <h3 className="font-bold text-gray-800 mb-2 text-sm">Baru Ditambahkan</h3>
                        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                            {assets.slice(0, 5).map(asset => (
                                <div key={asset.id} className="p-3 border border-gray-100 rounded-lg hover:border-pln-cyan/30 transition-colors cursor-pointer" onClick={() => handleLocate(asset)}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">{asset.kodeSap}</p>
                                            <p className="text-xs text-gray-500 line-clamp-1">{asset.alamat}</p>
                                        </div>
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full" suppressHydrationWarning>
                                            {asset.createdAt ? new Date(asset.createdAt).toLocaleDateString("id-ID") : "-"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Full Table Section */}
            <div>
                <h3 className="font-bold text-gray-800 mb-4 text-lg">Daftar Aset Lengkap</h3>
                <Suspense fallback={<div className="p-8 text-center text-gray-500">Memuat data tabel...</div>}>
                    <AssetTable
                        assets={assets}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onLocate={handleLocate}
                        userRole={(session?.user as any)?.role}
                    />
                </Suspense>
            </div>

            {/* Modal */}
            <AssetFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingAsset}
            />
        </div>
    );
}
