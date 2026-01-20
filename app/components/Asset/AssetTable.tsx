"use client";

import { ChevronLeft, ChevronRight, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, FileDown } from "lucide-react";
import { useEffect, useState } from "react";
import { AssetTableProps, SortField, SortOrder } from "@/types/asset";
import { useTableFilters } from "@/hooks/useTableFilters";
import { useTableSort } from "@/hooks/useTableSort";
import { usePagination } from "@/hooks/usePagination";
import AssetTableRow from "./AssetTableRow";
import AssetMobileCard from "./AssetMobileCard";
import { DEFAULT_ITEMS_PER_PAGE, ITEMS_PER_PAGE_OPTIONS, SEARCH_PLACEHOLDER, ALL_STATUS_FILTER_LABEL } from "@/constants/table";
import PhotoLightbox from "../Shared/PhotoLightbox";
import { useSearchParams } from "next/navigation";

/* =========================
   Main Component
========================= */
export default function AssetTable({
    assets,
    onDelete,
    onEdit,
    onLocate,
    userRole,
}: AssetTableProps) {
    // Use custom hooks
    const {
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        expiringFilter,
        setExpiringFilter,
        uniqueStatuses,
        filteredAssets,
        hasActiveFilters,
        resetFilters,
    } = useTableFilters(assets);

    const {
        sortField,
        sortOrder,
        sortedAssets,
        handleSort,
    } = useTableSort(filteredAssets);

    const {
        currentPage,
        itemsPerPage,
        totalPages,
        startIndex,
        endIndex,
        paginatedItems,
        setCurrentPage,
        nextPage,
        prevPage,
        changeItemsPerPage,
        resetToFirstPage,
    } = usePagination(sortedAssets, DEFAULT_ITEMS_PER_PAGE);

    // URL Search Params for Smart Links
    const searchParams = useSearchParams();

    // Effect: Handle URL Filters
    useEffect(() => {
        const filterParam = searchParams.get('filter');
        if (filterParam === 'expiring') {
            setExpiringFilter(true);
        }
    }, [searchParams, setExpiringFilter]);

    // Reset to page 1 when filters or sorting changes
    useEffect(() => {
        resetToFirstPage();
    }, [searchQuery, statusFilter, sortField, sortOrder, expiringFilter]);

    // Handlers with pagination reset
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
    };

    const [viewingPhotos, setViewingPhotos] = useState<{ url: string; id: string; deskripsi?: string | null }[] | null>(null);
    const [photoIndex, setPhotoIndex] = useState(0);

    // Lightbox Handlers
    const handleViewPhotos = (photos: { url: string; id: string; deskripsi?: string | null }[]) => {
        setViewingPhotos(photos);
        setPhotoIndex(0);
    };

    // Export Handler
    const handleExport = () => {
        window.open("/api/assets/export", "_blank");
    };

    return (
        <div className="space-y-4">
            {/* ... (Search and Filter Bar code remains same) ... */}
            {/* Active Date Filter Banner */}
            {expiringFilter && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Filter size={16} />
                        Menampilkan aset yang akan kedaluwarsa dalam 30 hari.
                    </div>
                    <button
                        onClick={() => setExpiringFilter(false)}
                        className="text-xs font-bold underline hover:text-amber-900"
                    >
                        Hapus Filter
                    </button>
                </div>
            )}

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={SEARCH_PLACEHOLDER}
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pln-blue/20 focus:border-pln-blue"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2 min-w-[200px]">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusFilterChange(e.target.value)}
                            className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pln-blue/20 focus:border-pln-blue"
                        >
                            <option value="all">{ALL_STATUS_FILTER_LABEL}</option>
                            {uniqueStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    {/* Export Button (Only for Admin/Master) */}
                    {(userRole === "ADMIN" || userRole === "MASTER") && (
                        <button
                            onClick={handleExport}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors font-medium whitespace-nowrap"
                            title="Export ke Excel"
                        >
                            <FileDown size={18} />
                            <span className="hidden sm:inline">Export Excel</span>
                        </button>
                    )}
                </div>

                {/* Active filters indicator */}
                {hasActiveFilters && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                        <span>Filter aktif:</span>
                        {searchQuery && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                                Pencarian: "{searchQuery}"
                            </span>
                        )}
                        {statusFilter !== "all" && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                                Status: {statusFilter}
                            </span>
                        )}
                        <button
                            onClick={resetFilters}
                            className="ml-2 text-pln-blue hover:underline text-xs font-medium"
                        >
                            Reset Filter
                        </button>
                    </div>
                )}
            </div>

            {/* Desktop Table: Hidden on Mobile */}
            <div className="hidden md:block overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium whitespace-nowrap">
                        <tr>
                            <SortableHeader field="kodeSap" label="Kode SAP" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader field="deskripsi" label="Deskripsi" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader field="luasTanah" label="Luas (m²)" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader field="tahunPerolehan" label="Tahun" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader field="alamat" label="Alamat" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader field="desa" label="Desa/Kel" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader field="kecamatan" label="Kecamatan" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader field="kabupaten" label="Kabupaten/Kota" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader field="provinsi" label="Provinsi" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader field="nomorSertifikat" label="Nomor Sertifikat" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader field="jenisDokumen" label="File Sertifikat" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader field="permasalahanAset" label="Masalah" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                            <th className="px-4 py-3 text-center">Foto</th>
                            <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan={14} className="px-4 py-8 text-center text-gray-400">
                                    {hasActiveFilters
                                        ? "Tidak ada data yang sesuai dengan filter."
                                        : "Belum ada data aset."}
                                </td>
                            </tr>
                        ) : (
                            paginatedItems.map((asset) => (
                                <AssetTableRow
                                    key={asset.id}
                                    asset={asset}
                                    onDelete={onDelete}
                                    onEdit={onEdit}
                                    onLocate={onLocate}
                                    onViewPhotos={handleViewPhotos}
                                    userRole={userRole}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View: Hidden on Desktop */}
            <div className="space-y-3 md:hidden">
                {paginatedItems.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-gray-100">
                        {hasActiveFilters ? "Tidak ada data (Mobile)." : "Belum ada data."}
                    </div>
                ) : (
                    paginatedItems.map((asset) => (
                        <AssetMobileCard
                            key={asset.id}
                            asset={asset}
                            onDelete={onDelete}
                            onEdit={onEdit}
                            onLocate={onLocate}
                            onViewPhotos={handleViewPhotos}
                            userRole={userRole}
                        />
                    ))
                )}
            </div>

            {/* Pagination Controls */}
            {sortedAssets.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Left: Info */}
                        <div className="text-sm text-gray-600">
                            Menampilkan <span className="font-semibold text-gray-800">{startIndex + 1}</span> - <span className="font-semibold text-gray-800">{Math.min(endIndex, sortedAssets.length)}</span> dari <span className="font-semibold text-gray-800">{sortedAssets.length}</span> data
                            {hasActiveFilters && (
                                <span className="ml-1 text-gray-500">(dari {assets.length} total)</span>
                            )}
                        </div>

                        {/* Center: Page Navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Halaman Sebelumnya"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={i}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                ? "bg-pln-blue text-white"
                                                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                title="Halaman Berikutnya"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Right: Items per page */}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <span>Per halaman:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => changeItemsPerPage(Number(e.target.value))}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-pln-blue/20"
                            >
                                {ITEMS_PER_PAGE_OPTIONS.map(option => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Global Lightbox Modal */}
            {viewingPhotos && (
                <PhotoLightbox
                    photos={viewingPhotos}
                    initialIndex={photoIndex}
                    onClose={() => setViewingPhotos(null)}
                />
            )}
        </div>
    );
}

/* =========================
   Sortable Header Component
========================= */
function SortableHeader({
    field,
    label,
    sortField,
    sortOrder,
    onSort
}: {
    field: SortField;
    label: string;
    sortField: SortField;
    sortOrder: SortOrder;
    onSort: (field: SortField) => void;
}) {
    const isActive = sortField === field;

    return (
        <th className="px-4 py-3">
            <button
                onClick={() => onSort(field)}
                className="flex items-center gap-1.5 text-gray-700 transition-colors group"
            >
                <span>{label}</span>
                {isActive ? (
                    sortOrder === 'asc' ? (
                        <ArrowUp className="w-3.5 h-3.5 text-pln-blue" />
                    ) : (
                        <ArrowDown className="w-3.5 h-3.5 text-pln-blue" />
                    )
                ) : (
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-0 opacity-50 transition-opacity" />
                )}
            </button>
        </th>
    );
}
