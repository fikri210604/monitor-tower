/**
 * Table-related constants
 */

// Pagination options
export const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50, 100] as const;
export const DEFAULT_ITEMS_PER_PAGE = 10;
export const MAX_PAGINATION_BUTTONS = 5;

// Table configuration
export const EMPTY_STATE_MESSAGE = "Belum ada data aset.";
export const NO_RESULTS_MESSAGE = "Tidak ada data yang sesuai dengan filter.";

// Search configuration
export const SEARCH_PLACEHOLDER = "Cari aset (kode SAP, deskripsi, alamat, dll...)";

// Searchable fields for asset
export const SEARCHABLE_FIELDS = [
    'kodeSap',
    'deskripsi',
    'alamat',
    'jenisDokumen',
    'nomorSertifikat',
    'permasalahanAset',
    'tahunPerolehan'
] as const;

// Filter options
export const ALL_STATUS_FILTER_VALUE = "all";
export const ALL_STATUS_FILTER_LABEL = "Semua Status";

// Photo categories
export const PHOTO_CATEGORY_SERTIFIKAT = "SERTIFIKAT";

// Status keywords
export const CLEAN_STATUS_KEYWORDS = ["clean", "aman"];
