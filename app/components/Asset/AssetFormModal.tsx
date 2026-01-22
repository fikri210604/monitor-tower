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
        // Data Utama
        kodeSap: "",
        kodeUnit: "3215",
        deskripsi: "",
        luasTanah: "",
        tahunPerolehan: "",

        // Lokasi
        alamat: "",
        desa: "",
        kecamatan: "",
        kabupaten: "",
        provinsi: "",
        koordinatX: "",
        koordinatY: "",

        // Legal/Sertifikasi
        jenisDokumen: "",
        nomorSertifikat: "",
        tanggalAwalSertifikat: "",
        tanggalAkhirSertifikat: "",
        linkSertifikat: "",

        // Status
        penguasaanTanah: "DIKUASAI",
        jenisBangunan: "TAPAK_TOWER",
        permasalahanAset: "CLEAN_AND_CLEAR",

        // Files
        fotoUrl: "",
        fotoDokumentasiUrl: "", // New state for documentation photo
        sertifikatUrl: "",
    });
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (initialData) {
            // Check for existing photo (ASET)
            const existingFoto = initialData.fotoAset?.find((f: any) => f.kategori !== "SERTIFIKAT" && f.kategori !== "DOKUMENTASI")?.url || "";
            // Check for existing documentation photo (DOKUMENTASI)
            const existingFotoDokumentasi = initialData.fotoAset?.find((f: any) => f.kategori === "DOKUMENTASI")?.url || "";
            // Check for existing sertifikat
            const existingSertifikat = initialData.linkSertifikat || initialData.fotoAset?.find((f: any) => f.kategori === "SERTIFIKAT")?.url || "";

            setFormData({
                // Data Utama
                kodeSap: initialData.kodeSap?.toString() || "",
                kodeUnit: initialData.kodeUnit?.toString() || "",
                deskripsi: initialData.deskripsi || "",
                luasTanah: initialData.luasTanah?.toString() || "",
                tahunPerolehan: initialData.tahunPerolehan?.toString() || "",

                // Lokasi
                alamat: initialData.alamat || "",
                desa: initialData.desa || "",
                kecamatan: initialData.kecamatan || "",
                kabupaten: initialData.kabupaten || "",
                provinsi: initialData.provinsi || "",
                koordinatX: initialData.koordinatX?.toString() || "",
                koordinatY: initialData.koordinatY?.toString() || "",

                // Legal/Sertifikasi
                jenisDokumen: initialData.jenisDokumen || "",
                nomorSertifikat: initialData.nomorSertifikat || "",
                tanggalAwalSertifikat: initialData.tanggalAwalSertifikat ? new Date(initialData.tanggalAwalSertifikat).toISOString().split('T')[0] : "",
                tanggalAkhirSertifikat: initialData.tanggalAkhirSertifikat ? new Date(initialData.tanggalAkhirSertifikat).toISOString().split('T')[0] : "",
                linkSertifikat: initialData.linkSertifikat || "",

                // Status
                penguasaanTanah: initialData.penguasaanTanah || "DIKUASAI",
                jenisBangunan: initialData.jenisBangunan || "TAPAK_TOWER",
                permasalahanAset: initialData.permasalahanAset || "CLEAN_AND_CLEAR",

                // Files
                fotoUrl: existingFoto,
                fotoDokumentasiUrl: existingFotoDokumentasi,
                sertifikatUrl: existingSertifikat,
            });
        } else {
            setFormData({
                // Data Utama
                kodeSap: "",
                kodeUnit: "3215",
                deskripsi: "",
                luasTanah: "",
                tahunPerolehan: "",

                // Lokasi
                alamat: "",
                desa: "",
                kecamatan: "",
                kabupaten: "",
                provinsi: "",
                koordinatX: "",
                koordinatY: "",

                // Legal/Sertifikasi
                jenisDokumen: "",
                nomorSertifikat: "",
                tanggalAwalSertifikat: "",
                tanggalAkhirSertifikat: "",
                linkSertifikat: "",

                // Status
                penguasaanTanah: "DIKUASAI",
                jenisBangunan: "TAPAK_TOWER",
                permasalahanAset: "CLEAN_AND_CLEAR",

                // Files
                fotoUrl: "",
                fotoDokumentasiUrl: "",
                sertifikatUrl: "",
            });
        }
    }, [initialData, isOpen]);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "foto" | "dokumen" | "sertifikat") => {
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
                } else if (type === "dokumen") {
                    setFormData(prev => ({ ...prev, fotoDokumentasiUrl: result.url }));
                } else {
                    // Sync both sertifikatUrl (for detailed state) and linkSertifikat (for DB)
                    setFormData(prev => ({ ...prev, sertifikatUrl: result.url, linkSertifikat: result.url }));
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

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* === SECTION 1: DATA UTAMA === */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide border-b pb-2">📋 Data Utama</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor SAP *</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                    value={formData.kodeSap}
                                    onChange={(e) => setFormData({ ...formData, kodeSap: e.target.value })}
                                    placeholder="10100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Unit</label>
                                <input
                                    type="number"
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                                    value={formData.kodeUnit}
                                    placeholder="3215"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                    value={formData.deskripsi}
                                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                                    placeholder="GARDU INDUK KOTABUMI"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Luas Tanah (m²)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                    value={formData.luasTanah}
                                    onChange={(e) => setFormData({ ...formData, luasTanah: e.target.value })}
                                    placeholder="2500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Perolehan</label>
                                <input
                                    type="number"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                    value={formData.tahunPerolehan}
                                    onChange={(e) => setFormData({ ...formData, tahunPerolehan: e.target.value })}
                                    placeholder="1990"
                                />
                            </div>
                        </div>
                    </div>

                    {/* === SECTION 2: LOKASI === */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide border-b pb-2">📍 Lokasi</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                    rows={2}
                                    value={formData.alamat}
                                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                                    placeholder="JL CURUP KEGUNGAN NO.10"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Desa</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                    value={formData.desa}
                                    onChange={(e) => setFormData({ ...formData, desa: e.target.value })}
                                    placeholder="GURUH KEGUNGAN"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kecamatan</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                    value={formData.kecamatan}
                                    onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                                    placeholder="KOTABUMI SELATAN"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kabupaten</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                    value={formData.kabupaten}
                                    onChange={(e) => setFormData({ ...formData, kabupaten: e.target.value })}
                                    placeholder="LAMPUNG UTARA"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                    value={formData.provinsi}
                                    onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                                    placeholder="LAMPUNG"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Koordinat X (Longitude) *</label>
                                <input
                                    required
                                    type="number"
                                    step="any"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                    value={formData.koordinatX}
                                    onChange={(e) => setFormData({ ...formData, koordinatX: e.target.value })}
                                    placeholder="104.862938"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Koordinat Y (Latitude) *</label>
                                <input
                                    required
                                    type="number"
                                    step="any"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                    value={formData.koordinatY}
                                    onChange={(e) => setFormData({ ...formData, koordinatY: e.target.value })}
                                    placeholder="-4.852055"
                                />
                            </div>
                        </div>
                    </div>

                    {/* === SECTION 3: LEGAL / SERTIFIKASI === */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide border-b pb-2">📜 Legal / Sertifikasi</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Dokumen</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                    value={formData.jenisDokumen}
                                    onChange={(e) => setFormData({ ...formData, jenisDokumen: e.target.value })}
                                    placeholder="Hak Pakai / Hak Guna Bangunan"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Sertifikat</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                    value={formData.nomorSertifikat}
                                    onChange={(e) => setFormData({ ...formData, nomorSertifikat: e.target.value })}
                                    placeholder="08.04.07.03.4.00007"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Awal Sertifikat</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                    value={formData.tanggalAwalSertifikat}
                                    onChange={(e) => setFormData({ ...formData, tanggalAwalSertifikat: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir Sertifikat</label>
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                    value={formData.tanggalAkhirSertifikat}
                                    onChange={(e) => setFormData({ ...formData, tanggalAkhirSertifikat: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link Sertifikat (URL / Path)</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none"
                                    value={formData.linkSertifikat}
                                    onChange={(e) => setFormData({ ...formData, linkSertifikat: e.target.value })}
                                    placeholder="/uploads/file.pdf atau https://..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* === SECTION 4: STATUS === */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide border-b pb-2">⚙️ Status</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Penguasaan Tanah *</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none bg-white"
                                    value={formData.penguasaanTanah}
                                    onChange={(e) => setFormData({ ...formData, penguasaanTanah: e.target.value })}
                                >
                                    <option value="DIKUASAI">Dikuasai</option>
                                    <option value="TIDAK_DIKUASAI">Tidak Dikuasai</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Bangunan *</label>
                                <select
                                    required
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none bg-white"
                                    value={formData.jenisBangunan}
                                    onChange={(e) => setFormData({ ...formData, jenisBangunan: e.target.value })}
                                >
                                    <option value="TAPAK_TOWER">Tapak Tower</option>
                                    <option value="GARDU_INDUK">Gardu Induk</option>
                                </select>
                            </div>
                            {(() => {
                                const STANDARD_PROBLEMS = [
                                    "CLEAN AND CLEAR",
                                    "TUMPAK TINDIH",
                                    "BERSENGKETA",
                                    "DALAM PENGADILAN",
                                    "BELUM BERSERTIFIKAT"
                                ];

                                const isCustom = !STANDARD_PROBLEMS.includes(formData.permasalahanAset);

                                return (
                                    <div className="space-y-2">
                                        <select
                                            required
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none bg-white"
                                            value={isCustom ? "LAINNYA" : formData.permasalahanAset}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === "LAINNYA") {
                                                    // Jika pindah ke Lainnya, kosongkan biar user bisa ketik (kecuali sudah ada value custom)
                                                    if (STANDARD_PROBLEMS.includes(formData.permasalahanAset)) {
                                                        setFormData({ ...formData, permasalahanAset: "" });
                                                    }
                                                } else {
                                                    setFormData({ ...formData, permasalahanAset: val });
                                                }
                                            }}
                                        >
                                            {STANDARD_PROBLEMS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                            <option value="LAINNYA">Lainnya (Ketik Manual)</option>
                                        </select>

                                        {/* Input Manual muncul jika 'Lainnya' dipilih atau value tidak ada di list standar */}
                                        {isCustom && (
                                            <input
                                                type="text"
                                                required
                                                autoFocus
                                                className="w-full px-3 py-2 border border-pln-blue rounded-lg ring-2 ring-pln-blue/10 outline-none animate-in fade-in slide-in-from-top-1 duration-200"
                                                value={formData.permasalahanAset}
                                                onChange={(e) => setFormData({ ...formData, permasalahanAset: e.target.value })}
                                                placeholder="Ketik detail permasalahan..."
                                            />
                                        )}
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    {/* === SECTION 5: FILE UPLOADS === */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wide border-b pb-2">📎 File Upload</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {/* Foto Upload */}
                            <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                                <label className="cursor-pointer block">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-blue-50 p-2 rounded-full mb-2">
                                            <ImageIcon className="w-5 h-5 text-pln-blue" />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-600">
                                            {formData.fotoUrl ? "Ganti Foto Aset" : "Upload Foto Aset"}
                                        </span>
                                        <span className="text-[10px] text-red-400 block mt-1">(Rahasia - Admin Only)</span>
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

                            {/* Foto Dokumentasi Upload */}
                            <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors relative">
                                <label className="cursor-pointer block">
                                    <div className="flex flex-col items-center">
                                        <div className="bg-purple-50 p-2 rounded-full mb-2">
                                            <ImageIcon className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-600">
                                            {formData.fotoDokumentasiUrl ? "Ganti Foto Dokumentasi" : "Upload Foto Dokumentasi"}
                                        </span>
                                        <span className="text-[10px] text-gray-400 block mt-1">(Bisa dilihat Operator)</span>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleUpload(e, "dokumen")}
                                    />
                                </label>
                                {formData.fotoDokumentasiUrl && (
                                    <div className="mt-2 relative group">
                                        <img src={formData.fotoDokumentasiUrl} alt="Preview" className="h-16 w-full object-cover rounded-md" />
                                        <button
                                            type="button"
                                            onClick={() => setFormData(p => ({ ...p, fotoDokumentasiUrl: "" }))}
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
