import { useState, useMemo } from 'react';
import { Asset } from '@/types/asset';
import { ALL_STATUS_FILTER_VALUE } from '@/constants/table';
import { formatAddress } from '@/utils/assetHelpers';

/**
 * Custom hook for handling table search and status filtering
 */
export function useTableFilters(assets: Asset[]) {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>(ALL_STATUS_FILTER_VALUE);

    // Get unique status values for filter dropdown
    const uniqueStatuses = useMemo(() => {
        const statuses = new Set<string>();
        assets.forEach(asset => {
            if (asset.permasalahanAset) {
                statuses.add(asset.permasalahanAset);
            }
        });
        return Array.from(statuses).sort();
    }, [assets]);

    // Apply filters
    const filteredAssets = useMemo(() => {
        let result = [...assets];

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(asset => {
                const addressParts = formatAddress(asset);

                return (
                    asset.kodeSap?.toString().toLowerCase().includes(query) ||
                    asset.deskripsi?.toLowerCase().includes(query) ||
                    asset.alamat?.toLowerCase().includes(query) ||
                    addressParts.toLowerCase().includes(query) ||
                    asset.jenisDokumen?.toLowerCase().includes(query) ||
                    asset.nomorSertifikat?.toLowerCase().includes(query) ||
                    asset.permasalahanAset?.toLowerCase().includes(query) ||
                    asset.tahunPerolehan?.toString().includes(query)
                );
            });
        }

        // Apply status filter
        if (statusFilter !== ALL_STATUS_FILTER_VALUE) {
            result = result.filter(asset => asset.permasalahanAset === statusFilter);
        }

        return result;
    }, [assets, searchQuery, statusFilter]);

    const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== ALL_STATUS_FILTER_VALUE;

    const resetFilters = () => {
        setSearchQuery("");
        setStatusFilter(ALL_STATUS_FILTER_VALUE);
    };

    return {
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        uniqueStatuses,
        filteredAssets,
        hasActiveFilters,
        resetFilters,
    };
}
