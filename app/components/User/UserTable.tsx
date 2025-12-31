"use client";

import { ChevronLeft, ChevronRight, Search, ArrowUpDown, ArrowUp, ArrowDown, Filter, Edit, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { UserTableProps, UserSortField, SortOrder, User } from "@/types/user";
import { useUserTableFilters } from "@/hooks/useUserTableFilters";
import { useUserTableSort } from "@/hooks/useUserTableSort";
import { usePagination } from "@/hooks/usePagination";
import { DEFAULT_ITEMS_PER_PAGE, ITEMS_PER_PAGE_OPTIONS } from "@/constants/table";

/* =========================
   Main Component
========================= */
export default function UserTable({
    users,
    onDelete,
    onEdit,
}: UserTableProps) {
    // Use custom hooks
    const {
        searchQuery,
        setSearchQuery,
        roleFilter,
        setRoleFilter,
        uniqueRoles,
        filteredUsers,
        hasActiveFilters,
        resetFilters,
    } = useUserTableFilters(users);

    const {
        sortField,
        sortOrder,
        sortedUsers,
        handleSort,
    } = useUserTableSort(filteredUsers);

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
    } = usePagination(sortedUsers, DEFAULT_ITEMS_PER_PAGE);

    // Reset to page 1 when filters or sorting changes
    useEffect(() => {
        resetToFirstPage();
    }, [searchQuery, roleFilter, sortField, sortOrder]);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
    };

    const handleRoleFilterChange = (value: string) => {
        setRoleFilter(value);
    };

    return (
        <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau username..."
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pln-blue/20 focus:border-pln-blue"
                        />
                    </div>

                    {/* Role Filter */}
                    <div className="flex items-center gap-2 min-w-[200px]">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            value={roleFilter}
                            onChange={(e) => handleRoleFilterChange(e.target.value)}
                            className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pln-blue/20 focus:border-pln-blue"
                        >
                            <option value="all">Semua Role</option>
                            {uniqueRoles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
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
                        {roleFilter !== "all" && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                                Role: {roleFilter}
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

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm bg-white">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-medium whitespace-nowrap">
                        <tr>
                            <SortableHeader field="name" label="Nama" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader field="username" label="Username" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader field="role" label="Role" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                            <SortableHeader field="createdAt" label="Dibuat Pada" sortField={sortField} sortOrder={sortOrder} onSort={handleSort} />
                            <th className="px-4 py-3 text-right">Aksi</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                        {paginatedItems.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                                    {hasActiveFilters
                                        ? "Tidak ada data yang sesuai dengan filter."
                                        : "Belum ada data user."}
                                </td>
                            </tr>
                        ) : (
                            paginatedItems.map((user) => (
                                <UserTableRow
                                    key={user.id}
                                    user={user}
                                    onDelete={onDelete}
                                    onEdit={onEdit}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {sortedUsers.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        {/* Left: Info */}
                        <div className="text-sm text-gray-600">
                            Menampilkan <span className="font-semibold text-gray-800">{startIndex + 1}</span> - <span className="font-semibold text-gray-800">{Math.min(endIndex, sortedUsers.length)}</span> dari <span className="font-semibold text-gray-800">{sortedUsers.length}</span> data
                            {hasActiveFilters && (
                                <span className="ml-1 text-gray-500">(dari {users.length} total)</span>
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
    field: UserSortField;
    label: string;
    sortField: UserSortField;
    sortOrder: SortOrder;
    onSort: (field: UserSortField) => void;
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
                    <ArrowUpDown className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />
                )}
            </button>
        </th>
    );
}

/* =========================
   User Table Row Component
========================= */
function UserTableRow({
    user,
    onDelete,
    onEdit,
}: {
    user: User;
    onDelete: (id: string) => void;
    onEdit: (user: User) => void;
}) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getRoleBadge = (role: string) => {
        const colors = {
            SUPER_ADMIN: "bg-red-100 text-red-700",
            OPERATOR: "bg-blue-100 text-blue-700",
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${colors[role as keyof typeof colors]}`}>
                {role}
            </span>
        );
    };

    return (
        <tr className="hover:bg-gray-50/50 transition-colors">
            <td className="px-4 py-3 font-semibold text-gray-800">
                {user.name}
            </td>

            <td className="px-4 py-3 text-gray-600 font-medium">
                {user.username}
            </td>

            <td className="px-4 py-3">
                {getRoleBadge(user.role)}
            </td>

            <td className="px-4 py-3 text-gray-500 text-xs">
                {formatDate(user.createdAt)}
            </td>

            <td className="px-4 py-3 flex justify-end gap-2">
                <button
                    title="Edit"
                    onClick={() => onEdit(user)}
                    className="p-1.5 rounded-lg transition-colors text-gray-500 hover:bg-gray-100"
                >
                    <Edit className="w-4 h-4" />
                </button>

                <button
                    title="Hapus"
                    onClick={() => onDelete(user.id)}
                    className="p-1.5 rounded-lg transition-colors text-red-500 hover:bg-red-50"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </td>
        </tr>
    );
}
