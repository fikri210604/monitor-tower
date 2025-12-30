"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { normalizeEnumValue, getFieldName } from "@/lib/excel/headers";

interface ExcelImportProps {
    onImportSuccess: () => void;
}

interface ImportError {
    row: number;
    kodeSap?: any;
    reason: string;
}

export default function ExcelImport({ onImportSuccess }: ExcelImportProps) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [importErrors, setImportErrors] = useState<ImportError[]>([]);
    const [importSummary, setImportSummary] = useState<{
        successCount: number;
        skippedCount: number;
        errorCount: number;
        totalRows: number;
    } | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset previous states
        setError("");
        setSuccess("");
        setImportErrors([]);
        setImportSummary(null);

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: "binary" });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const rawData = XLSX.utils.sheet_to_json(ws);

            console.log("📋 Raw Excel data (first 3 rows):", rawData.slice(0, 3));

            // Log ALL COLUMN NAMES from Excel
            if (rawData.length > 0) {
                const firstRow = rawData[0] as any;
                const columnNames = Object.keys(firstRow);
                console.log("📊 Excel Column Headers Found:", columnNames);
                console.log("📊 Total columns:", columnNames.length);
            }

            // Helper: Normalize decimal separator (comma to dot)
            const normalizeDecimal = (value: any): number | null => {
                if (value === null || value === undefined || value === "") return null;

                // If already a number, return it
                if (typeof value === "number") return value;

                // Convert to string and replace comma with dot
                const strValue = String(value).trim().replace(",", ".");
                const parsed = parseFloat(strValue);

                return isNaN(parsed) ? null : parsed;
            };

            // Normalize Keys dan Values menggunakan helper dari lib
            const normalizedData = rawData.map((row: any, index: number) => {
                const newRow: any = {};
                Object.keys(row).forEach((key) => {
                    const fieldName = getFieldName(key);

                    if (fieldName) {
                        // Numeric fields - normalize decimal separator
                        if (fieldName === "koordinatX" || fieldName === "koordinatY") {
                            newRow[fieldName] = normalizeDecimal(row[key]);
                        } else if (fieldName === "luasTanah") {
                            newRow[fieldName] = normalizeDecimal(row[key]);
                        } else if (fieldName === "kodeSap" || fieldName === "kodeUnit" || fieldName === "tahunPerolehan") {
                            const normalized = normalizeDecimal(row[key]);
                            newRow[fieldName] = normalized ? Math.floor(normalized) : null; // Integer fields
                        }
                        // Enum fields - normalize enum values
                        else if (fieldName === "jenisBangunan") {
                            const normalized = normalizeEnumValue(row[key], "jenisBangunan");
                            newRow[fieldName] = normalized || "TAPAK_TOWER";
                        } else if (fieldName === "penguasaanTanah") {
                            const normalized = normalizeEnumValue(row[key], "penguasaanTanah");
                            newRow[fieldName] = normalized || "DIKUASAI";
                        } else if (fieldName === "permasalahanAset") {
                            const normalized = normalizeEnumValue(row[key], "permasalahanAset");
                            newRow[fieldName] = normalized || "CLEAN_AND_CLEAR";
                        }
                        // Other fields - just copy
                        else {
                            newRow[fieldName] = row[key];
                        }
                    }
                });

                if (index === 0) {
                    console.log(`🔍 Row 1 normalized (ALL FIELDS):`, newRow);
                    console.log(`🔍 Has koordinatX?`, newRow.koordinatX);
                    console.log(`🔍 Has koordinatY?`, newRow.koordinatY);
                }
                return newRow;
            });

            console.log("✅ Normalized data (first 3 rows):", normalizedData.slice(0, 3));
            console.log(`Total rows to import: ${normalizedData.length}`);
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
        setImportErrors([]);
        setImportSummary(null);

        console.log("🚀 Sending import request with", data.length, "rows");
        console.log("First row sample:", data[0]);

        try {
            const response = await fetch("/api/assets/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ data }),
            });

            const result = await response.json();
            console.log("📥 Import response:", result);

            if (!response.ok) {
                // All failed
                setError(result.error || "Import failed");
                if (result.errors && result.errors.length > 0) {
                    setImportErrors(result.errors);
                }
            } else {
                // Success or partial success
                const { successCount, skippedCount, errorCount, totalRows, errors } = result;

                setImportSummary({ successCount, skippedCount: skippedCount || 0, errorCount: errorCount || 0, totalRows });

                if (errors && errors.length > 0) {
                    setImportErrors(errors);
                }

                if (successCount > 0) {
                    setSuccess(`Berhasil mengimpor ${successCount} dari ${totalRows} data aset.`);
                    onImportSuccess();
                }

                if (successCount === 0) {
                    setError(`Tidak ada data yang berhasil diimpor dari ${totalRows} baris.`);
                }
            }
        } catch (err: any) {
            console.error("❌ Import error:", err);
            setError(err.message || "Terjadi kesalahan saat import");
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
                Unggah file Excel (.xlsx) dengan kolom wajib: <code>kodeSap</code>, <code>koordinatX</code>, <code>koordinatY</code>, <code>jenisBangunan</code>, <code>penguasaanTanah</code>, <code>permasalahanAset</code>.
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

            {data.length > 0 && !importSummary && (
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

            {/* Import Summary */}
            {importSummary && importSummary.successCount > 0 && (
                <div className="bg-blue-50 p-3 rounded-lg text-sm">
                    <div className="flex items-start gap-2 text-pln-blue mb-2">
                        <AlertTriangle className="w-4 h-4 mt-0.5" />
                        <div className="flex-1">
                            <p className="font-semibold">Ringkasan Import:</p>
                            <ul className="mt-1 space-y-1 text-xs">
                                <li>✅ Berhasil: {importSummary.successCount}</li>
                                {importSummary.skippedCount > 0 && <li>⚠️ Dilewati: {importSummary.skippedCount}</li>}
                                {importSummary.errorCount > 0 && <li>❌ Error: {importSummary.errorCount}</li>}
                                <li>📊 Total: {importSummary.totalRows}</li>
                            </ul>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setData([]);
                            setImportSummary(null);
                            setImportErrors([]);
                            setSuccess("");
                        }}
                        className="text-xs text-pln-blue underline mt-2"
                    >
                        Import file baru
                    </button>
                </div>
            )}

            {/* General Error */}
            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{error}</span>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5" />
                    <span>{success}</span>
                </div>
            )}

            {/* Detailed Errors */}
            {importErrors.length > 0 && (
                <div className="bg-orange-50 p-3 rounded-lg text-sm">
                    <div className="flex items-start gap-2 text-orange-700 mb-2">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-semibold">Detail Error ({importErrors.length} baris):</p>
                            <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                                {importErrors.map((err, idx) => (
                                    <div key={idx} className="text-xs bg-white p-2 rounded border border-orange-200">
                                        <span className="font-medium">Baris {err.row}</span>
                                        {err.kodeSap && <span className="text-gray-500"> (Kode SAP: {err.kodeSap})</span>}
                                        <p className="text-orange-600 mt-1">{err.reason}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
