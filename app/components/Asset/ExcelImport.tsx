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
    const [isUploading, setIsUploading] = useState(false);
    const [replaceAll, setReplaceAll] = useState(false);
    const [strictFilter, setStrictFilter] = useState(true); // Default true: Hanya yang ada Nomor
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [importErrors, setImportErrors] = useState<ImportError[]>([]);
    const [importProgress, setImportProgress] = useState<number>(0); // NEW: Progress tracking
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

            // Cari sheet dengan nama "SERTIPIKAT" (case insensitive)
            let wsname = wb.SheetNames.find(name => name.toUpperCase().includes("SERTIPIKAT"));

            // Kalau tidak ketemu, pakai sheet pertama
            if (!wsname) {
                wsname = wb.SheetNames[0];
                console.log("⚠️ Sheet 'SERTIPIKAT' not found, using first sheet:", wsname);
            } else {
                console.log("✅ Found target sheet:", wsname);
            }

            const ws = wb.Sheets[wsname];

            // First, read as array of arrays to find header row
            const sheetData = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false });

            console.log("📄 First 5 rows of Excel (raw):", sheetData.slice(0, 5));

            // Find the header row - look for known columns like "koordinat", "kode", etc.
            let headerRowIndex = -1;
            let headerRow: any[] = [];

            for (let i = 0; i < Math.min(10, sheetData.length); i++) {
                const row = sheetData[i] as any[];
                if (!row || row.length === 0) continue; // Skip empty rows
                const rowStr = JSON.stringify(row).toLowerCase();

                // Check if this row contains header-like content
                if (rowStr.includes("koordinat") ||
                    rowStr.includes("titik") ||
                    rowStr.includes("kode") ||
                    rowStr.includes("latitude") ||
                    rowStr.includes("longitude")) {
                    headerRowIndex = i;
                    headerRow = row;
                    console.log(`✅ Found header row at index ${i}:`, row);
                    break;
                }
            }

            if (headerRowIndex === -1) {
                alert("❌ Tidak dapat menemukan header row di Excel. Pastikan ada kolom 'Titik Koordinat' atau 'Kode'");
                return;
            }

            // Parse data rows (skip header and rows before it)
            const dataRows = sheetData.slice(headerRowIndex + 1) as any[][];

            // Convert array of arrays to array of objects using detected headers
            const rawData = dataRows.map(row => {
                const obj: any = {};
                headerRow.forEach((header, index) => {
                    if (header && header.toString().trim()) { // Only if header is not empty
                        obj[header] = row[index];
                    }
                });
                return obj;
            });

            console.log("📋 Raw Excel data with correct headers (first 3 rows):", rawData.slice(0, 3));

            // Log column names
            if (rawData.length > 0) {
                const firstRow = rawData[0] as any;
                const columnNames = Object.keys(firstRow);

                console.log("📊 Excel Column Headers:", columnNames);
                console.log("📊 Total columns:", columnNames.length);
            }

            // Helper: Normalize decimal separator (comma to dot)
            const normalizeDecimal = (value: any): number | null => {
                if (value === null || value === undefined || value === "") return null;

                const raw = String(value).trim();
                if (!raw || ["-", "N/A", "NULL"].includes(raw.toUpperCase())) return null;

                // If already a number, return it
                if (typeof value === "number") return value;

                let strValue = String(value).trim().replace(/\s/g, "");

                // Smart detect: which is decimal separator?
                const hasComma = strValue.includes(",");
                const hasDot = strValue.includes(".");

                if (hasComma && hasDot) {
                    // Both present: check which one comes last (that's the decimal separator)
                    const lastCommaIndex = strValue.lastIndexOf(",");
                    const lastDotIndex = strValue.lastIndexOf(".");

                    if (lastCommaIndex > lastDotIndex) {
                        // Indonesian format: 1.234,56 → remove dots, replace comma with dot
                        strValue = strValue.replace(/\./g, "").replace(",", ".");
                    } else {
                        // International format: 1,234.56 → remove commas
                        strValue = strValue.replace(/,/g, "");
                    }
                } else if (hasComma) {
                    // Only comma: assume it's decimal separator
                    strValue = strValue.replace(",", ".");
                } else if (hasDot) {
                    // Only dot: check if it's thousand separator or decimal
                    // If more than one dot, it's thousand separator
                    const dotCount = (strValue.match(/\./g) || []).length;
                    if (dotCount > 1) {
                        // Multiple dots = thousand separator: remove all
                        strValue = strValue.replace(/\./g, "");
                    }
                    // Single dot = decimal separator, keep it
                }

                const parsed = parseFloat(strValue);

                // Validate coordinate range for koordinatX/Y
                if (!isNaN(parsed)) {
                    // Coordinates should be valid geographic values
                    // Indonesia roughly: latitude -11 to 6, longitude 95 to 141
                    // But we'll be lenient: -90 to 90, -180 to 180
                    if (Math.abs(parsed) > 200) {
                        console.warn(`⚠️  Suspicious coordinate value: ${value} → ${parsed}`);
                    }
                }

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
                            newRow[fieldName] = normalized !== null ? Math.floor(normalized) : null; // Integer fields
                        }
                        // Enum fields - normalize enum values
                        else if (fieldName === "jenisBangunan") {
                            const normalized = normalizeEnumValue(row[key], "jenisBangunan");
                            newRow[fieldName] = normalized || "TAPAK_TOWER";
                        } else if (fieldName === "penguasaanTanah") {
                            const normalized = normalizeEnumValue(row[key], "penguasaanTanah");
                            newRow[fieldName] = normalized || "DIKUASAI";
                        } else if (fieldName === "permasalahanAset") {
                            // Direct copy for String type
                            newRow[fieldName] = row[key];
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

            // Filter Logic
            let validData = normalizedData;

            if (strictFilter) {
                // Hanya ambil baris yang memiliki kolom "NO"
                validData = normalizedData.filter(row => {
                    const hasNo = row.no !== undefined && row.no !== null && String(row.no).trim() !== "";
                    return hasNo;
                });
                console.log(`🔍 Filtering applied. Kept ${validData.length} of ${normalizedData.length} rows.`);
            } else {
                console.log(`🔍 Filtering disabled. Importing all ${normalizedData.length} rows.`);
            }

            console.log(`✅ Ready to import: ${validData.length} rows`);
            setData(validData);
            setError("");
        };
        reader.readAsBinaryString(file);
    };

    const handleImport = async () => {
        if (data.length === 0) return;

        // Confirmation for replace all
        if (replaceAll) {
            const confirmed = confirm(
                `⚠️ PERINGATAN!\n\nAnda akan MENGHAPUS SEMUA ${data.length} data aset yang ada dan menggantinya dengan data baru dari Excel.\n\nApakah Anda yakin ingin melanjutkan?`
            );
            if (!confirmed) {
                return;
            }
        }

        setLoading(true);
        setError("");
        setSuccess("");
        setImportErrors([]);
        setImportSummary(null);
        setImportProgress(0); // Reset progress

        console.log("🚀 Sending import request with", data.length, "rows");
        console.log("First row sample:", data[0]);
        console.log("Replace all mode:", replaceAll);

        // Simulate progress (since we can't track real-time from server)
        const progressInterval = setInterval(() => {
            setImportProgress(prev => Math.min(prev + 5, 90)); // Max 90% until done
        }, 300);

        try {
            const res = await fetch("/api/assets/import", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    rows: data,
                    replaceAll: replaceAll
                }),
            });

            clearInterval(progressInterval);
            setImportProgress(100); // Complete

            const result = await res.json();
            console.log("📥 Import response:", result);

            if (!res.ok) {
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
            clearInterval(progressInterval);
        } finally {
            setLoading(false);
            setTimeout(() => setImportProgress(0), 2000); // Reset after 2s
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-bold text-gray-800">Import dari Excel</h2>
                    <p className="text-gray-500 text-sm mt-1">Upload file Excel (.xlsx) untuk import data aset</p>
                </div>
            </div>

            {/* Replace All Checkbox */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={replaceAll}
                        onChange={(e) => setReplaceAll(e.target.checked)}
                        className="mt-1 w-4 h-4 text-pln-blue border-gray-300 rounded focus:ring-pln-blue"
                    />
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-amber-800 text-sm">Ganti Semua Data</span>
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                        </div>
                        <p className="text-xs text-amber-700 mt-1">
                            Centang ini akan <strong>menghapus semua data aset yang ada</strong> dan menggantinya dengan data baru dari Excel. Gunakan fitur ini untuk re-import dengan data yang sudah diperbaiki.
                        </p>
                    </div>
                </label>
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <input
                    type="checkbox"
                    id="strictFilter"
                    checked={strictFilter}
                    onChange={(e) => setStrictFilter(e.target.checked)}
                    className="w-4 h-4 text-pln-blue rounded border-gray-300 focus:ring-pln-blue"
                />
                <label htmlFor="strictFilter" className="text-sm text-gray-700 cursor-pointer select-none">
                    <span className="font-semibold block">Hanya Import Data dengan Nomor</span>
                    <span className="text-xs text-gray-500">Jika dicentang, baris tanpa nomor urut (NO) tidak akan dimasukkan. Hilangkan centang untuk import semuanya.</span>
                </label>
            </div>

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
                <div className="bg-blue-50 p-3 rounded-lg text-sm text-pln-blue space-y-3">
                    <div className="flex items-center justify-between">
                        <span>{data.length} data siap diimpor.</span>
                        <button
                            onClick={handleImport}
                            disabled={loading}
                            className="bg-pln-blue text-white px-3 py-1 rounded-md text-xs font-semibold hover:bg-sky-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Memproses..." : "Proses Import"}
                        </button>
                    </div>
                    {loading && importProgress > 0 && (
                        <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                                <span className="font-semibold">Progress Import</span>
                                <span className="font-bold">{importProgress}%</span>
                            </div>
                            <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                                <div
                                    className="bg-pln-blue h-full transition-all duration-300 ease-out"
                                    style={{ width: `${importProgress}%` }}
                                />
                            </div>
                        </div>
                    )}
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
