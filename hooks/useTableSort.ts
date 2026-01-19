import { useState, useMemo } from 'react';
import { Asset, SortField, SortOrder } from '@/types/asset';
import { formatAddress } from '@/utils/assetHelpers';

/**
 * Custom hook for handling table column sorting
 */
export function useTableSort(assets: Asset[]) {
    const [sortField, setSortField] = useState<SortField>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    // Apply sorting
    const sortedAssets = useMemo(() => {
        if (!sortField) return assets;

        const result = [...assets];

        result.sort((a, b) => {
            let aVal: any;
            let bVal: any;

            // Handle special case for 'lokasi' field
            if (sortField === 'lokasi') {
                aVal = formatAddress(a);
                bVal = formatAddress(b);
            } else {
                aVal = a[sortField as keyof Asset];
                bVal = b[sortField as keyof Asset];
            }

            // Handle null values
            if (aVal === null || aVal === undefined) aVal = "";
            if (bVal === null || bVal === undefined) bVal = "";

            // Compare values based on type
            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortOrder === 'asc'
                    ? aVal.localeCompare(bVal)
                    : bVal.localeCompare(aVal);
            }

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
            }

            return 0;
        });

        return result;
    }, [assets, sortField, sortOrder]);

    // Toggle sort or set new sort field
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            // Toggle order if same field
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // New field, default to asc
            setSortField(field);
            setSortOrder('asc');
        }
    };

    return {
        sortField,
        sortOrder,
        sortedAssets,
        handleSort,
    };
}
