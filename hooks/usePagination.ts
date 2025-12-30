import { useState, useMemo } from 'react';

/**
 * Custom hook for handling table pagination
 */
export function usePagination<T>(items: T[], initialItemsPerPage = 10) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);

    // Calculate pagination values
    const totalPages = Math.ceil(items.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const paginatedItems = useMemo(() => {
        return items.slice(startIndex, endIndex);
    }, [items, startIndex, endIndex]);

    // Reset to page 1 when items change significantly
    const resetToFirstPage = () => {
        setCurrentPage(1);
    };

    // Change page with bounds checking
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const nextPage = () => {
        setCurrentPage(prev => Math.min(totalPages, prev + 1));
    };

    const prevPage = () => {
        setCurrentPage(prev => Math.max(1, prev - 1));
    };

    const changeItemsPerPage = (newItemsPerPage: number) => {
        setItemsPerPage(newItemsPerPage);
        setCurrentPage(1); // Reset to first page
    };

    return {
        currentPage,
        itemsPerPage,
        totalPages,
        startIndex,
        endIndex,
        paginatedItems,
        setCurrentPage: goToPage,
        nextPage,
        prevPage,
        changeItemsPerPage,
        resetToFirstPage,
    };
}
