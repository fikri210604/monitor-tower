/**
 * Asset-related type definitions
 */

export interface Asset {
    id: string;
    kodeSap: string;
    deskripsi: string | null;
    luasTanah: number | null;
    tahunPerolehan: number | null;

    // Lokasi
    alamat: string | null;
    desa: string | null;
    kecamatan: string | null;
    kabupaten: string | null;
    provinsi: string | null;
    koordinatX: number;
    koordinatY: number;

    // Legal
    jenisDokumen: string | null;
    nomorSertifikat: string | null;
    linkSertifikat: string | null;

    // Fisik
    penguasaanTanah: string | null;
    jenisBangunan: string | null;
    permasalahanAset: string | null;

    fotoAset?: { url: string; kategori?: string }[] | null;
}

export interface AssetTableProps {
    assets: Asset[];
    onDelete: (id: string) => void;
    onEdit: (asset: Asset) => void;
    onLocate: (asset: Asset) => void;
    userRole?: string; // Add userRole for conditional rendering
}

export type SortField = keyof Asset | 'lokasi' | null;
export type SortOrder = 'asc' | 'desc';
