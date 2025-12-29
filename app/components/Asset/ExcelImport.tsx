"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from "lucide-react";

interface ExcelImportProps {
    onImportSuccess: () => void;
}

export default function ExcelImport({ onImportSuccess }: ExcelImportProps) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const rawData = XLSX.utils.sheet_to_json(ws);

            // Normalize Keys
            const normalizedData = rawData.map((row: any) => {
                const newRow: any = {};
                Object.keys(row).forEach((key) => {
                    const cleanKey = key.trim().toUpperCase();
                    if (cleanKey === "KODE SAP" || cleanKey === "KODESAP") newRow.kodeSap = row[key];
                    else if (cleanKey === "UNIT") newRow.unit = row[key];
                    else if (cleanKey === "ALAMAT" || cleanKey === "LOKASI") newRow.alamat = row[key];
                    else if (cleanKey === "KOORDINAT X" || cleanKey === "LATITUDE" || cleanKey === "LAT") newRow.koordinatX = row[key];
                    else if (cleanKey === "KOORDINAT Y" || cleanKey === "LONGITUDE" || cleanKey === "LONG") newRow.koordinatY = row[key];
                    else if (cleanKey.includes("PENGUASAAN") || cleanKey.includes("STATUS TANAH")) newRow.penguasaanTanah = row[key];
                    else if (cleanKey.includes("JENIS BANGUNAN")) newRow.jenisBangunan = row[key];
                    else if (cleanKey.includes("PENYELESAIAN") || cleanKey.includes("SERTIFIKAT")) newRow.statusPenyelesaianAset = row[key];
                    else newRow[key] = row[key]; // Keep original just in case
                });
                return newRow;
            });

            setData(normalizedData);
            setError("");
        };
        reader.readAsBinaryString(file);
    };

    const handleImport = async () => {
        if (data.length === 0) return;

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            const response = await fetch("/api/assets/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Import failed");
            }

            setSuccess(`Berhasil mengimpor ${result.successCount} data aset.`);
            setData([]); // Reset data
            onImportSuccess();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-2 rounded-lg text-green-600">
                    <FileSpreadsheet className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-gray-800">Import Excel</h3>
            </div>

            <p className="text-sm text-gray-500">
                Unggah file Excel (.xlsx) dengan kolom: <code>kodeSap</code>, <code>unit</code>, <code>alamat</code>, <code>koordinatX</code>, <code>koordinatY</code>.
            </p>

            <div className="relative">
                <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                    <Upload className="w-8 h-8 mb-2 text-pln-blue/50" />
                    <span className="text-sm font-medium">Klik untuk upload file</span>
                </div>
            </div>

            {data.length > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-pln-blue flex items-center justify-between">
                    <span>{data.length} data siap diimpor.</span>
                    <button
                        onClick={handleImport}
                        disabled={loading}
                        className="bg-pln-blue text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50"
                    >
                        {loading ? "Memproses..." : "Proses Import"}
                    </button>
                </div>
            )}

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5" />
                    <span>{success}</span>
                </div>
            )}
        </div>
    );
}
