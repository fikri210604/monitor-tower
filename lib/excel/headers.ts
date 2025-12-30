// Mapping untuk normalisasi nilai enum dari Excel ke database

export const ENUM_MAPPINGS = {
    jenisBangunan: {
        "GARDU_INDUK": "GARDU_INDUK",
        "GARDUINDUK": "GARDU_INDUK",
        "GARDU": "GARDU_INDUK",
        "GI": "GARDU_INDUK",
        "INDUK": "GARDU_INDUK",
        "TAPAK_TOWER": "TAPAK_TOWER",
        "TAPAKTOWER": "TAPAK_TOWER",
        "TAPAK": "TAPAK_TOWER",
        "TOWER": "TAPAK_TOWER",
        "T": "TAPAK_TOWER",
        "TRANSMISI": "TAPAK_TOWER",
        "JARINGAN_TRANSMISI": "TAPAK_TOWER",
        "JARINGANTRANSMISI": "TAPAK_TOWER",
        "DISTRIBUSI": "TAPAK_TOWER",
        "JARINGAN": "TAPAK_TOWER"
    },
    penguasaanTanah: {
        "DIKUASAI": "DIKUASAI",
        "DI_KUASAI": "DIKUASAI",
        "DIKUASAI_PLN": "DIKUASAI",
        "MILIK_SENDIRI": "DIKUASAI",
        "MILIKSENDIRI": "DIKUASAI",
        "MILIK": "DIKUASAI",
        "SENDIRI": "DIKUASAI",
        "ADA": "DIKUASAI",
        "TIDAK_DIKUASAI": "TIDAK_DIKUASAI",
        "TIDAKDIKUASAI": "TIDAK_DIKUASAI",
        "TIDAK_DI_KUASAI": "TIDAK_DIKUASAI",
        "TIDAK": "TIDAK_DIKUASAI",
        "TDK": "TIDAK_DIKUASAI",
        "SEWA": "TIDAK_DIKUASAI",
        "PINJAM_PAKAI": "TIDAK_DIKUASAI",
        "PINJAMPAKAI": "TIDAK_DIKUASAI",
        "PINJAM": "TIDAK_DIKUASAI"
    },
    permasalahanAset: {
        "CLEAN_AND_CLEAR": "CLEAN_AND_CLEAR",
        "CLEANANDCLEAR": "CLEAN_AND_CLEAR",
        "CLEANCLEAR": "CLEAN_AND_CLEAR",
        "CLEAN": "CLEAN_AND_CLEAR",
        "CLEAR": "CLEAN_AND_CLEAR",
        "CC": "CLEAN_AND_CLEAR",
        "C_AND_C": "CLEAN_AND_CLEAR",
        "TIDAK_ADA_MASALAH": "CLEAN_AND_CLEAR",
        "TIDAKADAMASALAH": "CLEAN_AND_CLEAR",
        "AMAN": "CLEAN_AND_CLEAR",
        "TUMPAK_TINDIH": "TUMPAK_TINDIH",
        "TUMPAKTINDIH": "TUMPAK_TINDIH",
        "TUMPANG_TINDIH": "TUMPAK_TINDIH",
        "TUMPANGTINDIH": "TUMPAK_TINDIH",
        "TINDIH": "TUMPAK_TINDIH",
        "TUMPANG": "TUMPAK_TINDIH",
        "TUMPAK": "TUMPAK_TINDIH",
        "SENGKETA": "TUMPAK_TINDIH",
        "KONFLIK": "TUMPAK_TINDIH",
        "IRISAN": "TUMPAK_TINDIH",
        "BUMN": "TUMPAK_TINDIH"
    }
} as const;

export type EnumType = keyof typeof ENUM_MAPPINGS;

/**
 * Normalize enum values dari berbagai format
 */
export function normalizeEnumValue(value: any, enumType: EnumType): string | null {
    if (!value) return null;

    const strValue = String(value).trim();

    // Normalize: hapus semua karakter non-alphanumeric kecuali underscore, lalu uppercase
    const normalized = strValue
        .replace(/[^a-zA-Z0-9_]/g, '')  // Hapus spasi, &, -, dll
        .toUpperCase();

    console.log(`🔄 Normalizing ${enumType}: "${strValue}" → "${normalized}"`);

    const mappings = ENUM_MAPPINGS[enumType];

    // Exact match
    if (normalized in mappings) {
        const result = mappings[normalized as keyof typeof mappings];
        console.log(`✅ Found exact match: ${result}`);
        return result;
    }

    // Partial match - cek apakah normalized string mengandung salah satu key
    for (const [key, val] of Object.entries(mappings)) {
        if (normalized.includes(key) || key.includes(normalized)) {
            console.log(`✅ Found partial match: ${key} → ${val}`);
            return val as string;
        }
    }

    console.warn(`⚠️  No mapping found for ${enumType}: "${strValue}" (normalized: "${normalized}")`);
    return null;
}

/**
 * Mapping nama kolom Excel ke field database
 * Mendukung berbagai variasi nama kolom
 */
export const COLUMN_MAPPINGS: Record<string, string> = {
    // Kode SAP
    "KODE SAP": "kodeSap",
    "KODESAP": "kodeSap",
    "KODE SAP TANAH": "kodeSap",
    "KODESAPTANAH": "kodeSap",

    // Kode Unit
    "KODE UNIT": "kodeUnit",
    "KODEUNIT": "kodeUnit",
    "UNIT": "kodeUnit",
    "KODE SATKER": "kodeUnit",
    "KODESATKER": "kodeUnit",
    "SATKER": "kodeUnit",

    // Deskripsi
    "DESKRIPSI": "deskripsi",
    "NAMA ASET": "deskripsi",
    "NAMASET": "deskripsi",
    "URAIAN BMN": "deskripsi",
    "URAIANBMN": "deskripsi",
    "URAIAN": "deskripsi",

    // Luas Tanah
    "LUAS TANAH": "luasTanah",
    "LUASTANAH": "luasTanah",
    "LUAS": "luasTanah",
    "LUAS TANAH (M²)": "luasTanah",
    "LUAS TANAH (M2)": "luasTanah",
    "LUAS TANAH M2": "luasTanah",

    // Tahun Perolehan
    "TAHUN PEROLEHAN": "tahunPerolehan",
    "TAHUNPEROLEHAN": "tahunPerolehan",
    "TAHUN": "tahunPerolehan",

    // Alamat
    "ALAMAT": "alamat",
    "LOKASI": "alamat",
    "PENUGASAN": "alamat",
    "PENUGASAN (ALAMAT)": "alamat",

    // Desa
    "DESA": "desa",
    "KELURAHAN": "desa",

    // Kecamatan
    "KECAMATAN": "kecamatan",

    // Kabupaten
    "KABUPATEN": "kabupaten",
    "KOTA": "kabupaten",

    // Provinsi
    "PROVINSI": "provinsi",

    // Koordinat X (Latitude)
    "TITIK KOORDINAT (X)": "koordinatX",
    "TITIKKOORDINAT(X)": "koordinatX",
    "TITIK KOORDINAT X": "koordinatX",

    // Koordinat Y (Longitude)
    "TITIK KOORDINAT (Y)": "koordinatY",
    "TITIKKOORDINAT(Y)": "koordinatY",
    "TITIK KOORDINAT Y": "koordinatY",

    // Jenis Dokumen
    "JENIS DOKUMEN": "jenisDokumen",
    "JENISDOKUMEN": "jenisDokumen",
    "JENIS DOKUMEN LEGAL EXISTING": "jenisDokumen",
    "JENISDOKUMENLEGALEXISTING": "jenisDokumen",
    "DOKUMEN LEGAL": "jenisDokumen",

    // Nomor Sertifikat
    "NOMOR SERTIFIKAT": "nomorSertifikat",
    "NOMORSERTIFIKAT": "nomorSertifikat",
    "NO SERTIFIKAT": "nomorSertifikat",
    "NOSERTIFIKAT": "nomorSertifikat",

    // Tanggal Sertifikat
    "TANGGAL AWAL SERTIFIKAT": "tanggalAwalSertifikat",
    "TANGGALAWALSERTIFIKAT": "tanggalAwalSertifikat",
    "TGL AWAL SERTIFIKAT": "tanggalAwalSertifikat",
    "TANGGAL AKHIR SERTIFIKAT": "tanggalAkhirSertifikat",
    "TANGGALAKHIRSERTIFIKAT": "tanggalAkhirSertifikat",
    "TGL AKHIR SERTIFIKAT": "tanggalAkhirSertifikat",

    // Jenis Bangunan
    "JENIS BANGUNAN": "jenisBangunan",
    "JENISBANGUNAN": "jenisBangunan",
    "JENIS ASET": "jenisBangunan",
    "JENISASET": "jenisBangunan",

    // Penguasaan Tanah
    "PENGUASAAN TANAH": "penguasaanTanah",
    "PENGUASAANTANAH": "penguasaanTanah",
    "STATUS TANAH": "penguasaanTanah",
    "STATUSTANAH": "penguasaanTanah",
    "PENGUASAAN": "penguasaanTanah",

    // Permasalahan Aset
    "PERMASALAHAN ASET": "permasalahanAset",
    "PERMASALAHANASET": "permasalahanAset",
    "PERMASALAHAN": "permasalahanAset",
    "MASALAH ASET": "permasalahanAset",
    "MASALAHASET": "permasalahanAset",
    "MASALAH": "permasalahanAset",
};

/**
 * Mendapatkan nama field database dari nama kolom Excel
 * @param columnName - Nama kolom dari Excel
 * @returns Nama field database atau null jika tidak dikenali
 */
export function getFieldName(columnName: string): string | null {
    // Skip __EMPTY_ columns silently (these are unnamed Excel columns)
    if (columnName.startsWith("__EMPTY")) {
        return null;
    }

    const normalized = columnName.trim().toUpperCase();
    const result = COLUMN_MAPPINGS[normalized] || null;

    if (!result) {
        // console.warn(`⚠️  No column mapping for: "${columnName}" (normalized: "${normalized}")`);
    } else {
        console.log(`✅ Mapped column: "${columnName}" → ${result}`);
    }

    return result;
}
