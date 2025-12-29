"use client";

import { useState, useEffect } from "react";
import { X, Save, Upload, FileText, Image as ImageIcon, Trash2 } from "lucide-react";

interface AssetFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: any;
}

export default function AssetFormModal({ isOpen, onClose, onSave, initialData }: AssetFormModalProps) {
    const [formData, setFormData] = useState({
        kodeSap: "",
        unit: "",
        alamat: "",
        koordinatX: "",
        koordinatY: "",
        statusTanah: "TIDAK_DIKUASAI",
        jenisBangunan: "TAPAK_TOWER",
        // Files
        fotoUrl: "",
        sertifikatUrl: "",
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (initialData) {
            // Check for existing photo
            const existingFoto = initialData.fotoAset?.find((f: any) => f.kategori !== "SERTIFIKAT")?.url || "";
            // Check for existing sertifikat (either in sertifikatUrl or FotoAset with category SERTIFIKAT)
            const existingSertifikat = initialData.sertifikasi?.sertifikatUrl || initialData.fotoAset?.find((f: any) => f.kategori === "SERTIFIKAT")?.url || "";

            setFormData({
                kodeSap: initialData.kodeSap || "",
                unit: initialData.unit || "",
                alamat: initialData.alamat || "",
                koordinatX: initialData.koordinatX || "",
                koordinatY: initialData.koordinatY || "",
                statusTanah: initialData.statusTanah?.penguasaanTanah || "TIDAK_DIKUASAI",
                jenisBangunan: initialData.statusTanah?.jenisBangunan || "TAPAK_TOWER",
                fotoUrl: existingFoto,
                sertifikatUrl: existingSertifikat,
            });
        } else {
            setFormData({
                kodeSap: "",
                unit: "",
                alamat: "",
                koordinatX: "",
                koordinatY: "",
                statusTanah: "TIDAK_DIKUASAI",
                jenisBangunan: "TAPAK_TOWER",
                fotoUrl: "",
                sertifikatUrl: "",
            });
        }
    }, [initialData, isOpen]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "foto" | "sertifikat") => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const data = new FormData();
        data.append("file", file);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: data,
            });
            const result = await res.json();

            if (res.ok) {
                if (type === "foto") {
                    setFormData(prev => ({ ...prev, fotoUrl: result.url }));
                } else {
                    setFormData(prev => ({ ...prev, sertifikatUrl: result.url }));
                }
            } else {
                alert("Upload failed: " + result.error);
            }
        } catch (error) {
            console.error(error);
            alert("Upload Error");
        } finally {
            setUploading(false);
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error(error);
            alert("Gagal menyimpan data");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
                    <h3 className="font-bold text-gray-800">
                        {initialData ? "Edit Aset" : "Tambah Aset Baru"}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kode SAP</label>
                            <input
                                required
                                type="text"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                value={formData.kodeSap}
                                onChange={(e) => setFormData({ ...formData, kodeSap: e.target.value })}
                                placeholder="Contoh: 100028374"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Koordinat X (Lat)</label>
                            <input
                                required
                                type="number"
                                step="any"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                value={formData.koordinatX}
                                onChange={(e) => setFormData({ ...formData, koordinatX: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Koordinat Y (Long)</label>
                            <input
                                required
                                type="number"
                                step="any"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                value={formData.koordinatY}
                                onChange={(e) => setFormData({ ...formData, koordinatY: e.target.value })}
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat / Lokasi</label>
                            <textarea
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                rows={2}
                                value={formData.alamat}
                                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                                placeholder="Deskripsi lokasi..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                placeholder="Unit kerja"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Bangunan</label>
                            <select
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none bg-white"
                                value={formData.jenisBangunan}
                                onChange={(e) => setFormData({ ...formData, jenisBangunan: e.target.value })}
                            >
                                <option value="TAPAK_TOWER">Tapak Tower</option>
                                <option value="GARDU_INDUK">Gardu Induk</option>
                            </select>
                        </div>

                        {/* File Uploads */}
                        <div className="col-span-2 grid grid-cols-2 gap-4">
                            {/* Foto Upload */}
                            <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                                <label className="cursor-pointer block">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-blue-50 p-2 rounded-full mb-2">
                                            <ImageIcon className="w-5 h-5 text-pln-blue" />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-600">
                                            {formData.fotoUrl ? "Ganti Foto" : "Upload Foto Aset"}
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleUpload(e, "foto")}
                                    />
                                </label>
                                {formData.fotoUrl && (
                                    <div className="mt-2 relative group">
                                        <img src={formData.fotoUrl} alt="Preview" className="h-16 w-full object-cover rounded-md" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, fotoUrl: "" }))}
                                            className="absolute top-1 right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Sertifikat PDF Upload */}
                            <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors">
                                <label className="cursor-pointer block">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-green-50 p-2 rounded-full mb-2">
                                            <FileText className="w-5 h-5 text-green-600" />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-600">
                                            {formData.sertifikatUrl ? "Ganti Sertifikat" : "Upload Sertifikat (PDF)"}
                                        </span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="application/pdf"
                                        className="hidden"
                                        onChange={(e) => handleUpload(e, "sertifikat")}
                                    />
                                </label>
                                {formData.sertifikatUrl && (
                                    <div className="mt-2 flex items-center justify-between bg-gray-100 p-2 rounded text-xs gap-2">
                                        <span className="truncate flex-1 text-gray-600">File Selected</span>
                                        <a href={formData.sertifikatUrl} target="_blank" className="text-blue-600 hover:underline">View</a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3 justify-end border-t border-gray-50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || uploading}
                            className="px-4 py-2 bg-pln-blue hover:bg-sky-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-pln-blue/20 disabled:opacity-50"
                        >
                            {loading || uploading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
