import { Asset } from "@/types/asset";
import { PHOTO_CATEGORY_SERTIFIKAT, CLEAN_STATUS_KEYWORDS } from "@/constants/table";

/**
 * Utility functions for asset data formatting and manipulation
 */

/**
 * Format address from asset data
 * Combines desa, kecamatan, kabupaten or falls back to alamat
 */
export function formatAddress(asset: Asset): string {
    const addressParts = [asset.desa, asset.kecamatan, asset.kabupaten]
        .filter(Boolean);

    return addressParts.length > 0
        ? addressParts.join(", ")
        : asset.alamat || "-";
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number | null | undefined, lng: number | null | undefined, decimals = 5): string {
    if (lat === null || lat === undefined || lng === null || lng === undefined) return "-";
    return `${lat.toFixed(decimals)}, ${lng.toFixed(decimals)}`;
}

/**
 * Filter out certificate photos from fotoAset array
 * Returns only real photos (non-certificate files)
 */
export function filterRealPhotos(fotoAset: Asset['fotoAset']): { id: string; url: string; kategori?: string | null; deskripsi?: string | null }[] {
    if (!fotoAset) return [];
    return fotoAset.filter(f => f.kategori !== PHOTO_CATEGORY_SERTIFIKAT);
}

/**
 * Check if asset has real photos (excluding certificates)
 */
export function hasRealPhotos(asset: Asset): boolean {
    return filterRealPhotos(asset.fotoAset).length > 0;
}

/**
 * Check if asset has certificate link
 */
export function hasCertificate(asset: Asset): boolean {
    return Boolean(asset.linkSertifikat);
}

/**
 * Determine if a status is considered "clean" or "safe"
 */
export function isCleanStatus(status: string | null): boolean {
    if (!status) return false;
    const lowerStatus = status.toLowerCase();
    return CLEAN_STATUS_KEYWORDS.some(keyword => lowerStatus.includes(keyword));
}

/**
 * Format number with Indonesian locale
 */
export function formatNumber(value: number | null | undefined): string {
    if (value === null || value === undefined) return "-";
    return value.toLocaleString("id-ID");
}

/**
 * Get display value or fallback
 */
export function getDisplayValue(value: string | number | null | undefined, fallback = "-"): string {
    if (value === null || value === undefined || value === "") return fallback;
    return String(value);
}
