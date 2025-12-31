"use client";

import { useState } from "react";
import { User, UserSortField, SortOrder } from "@/types/user";

export function useUserTableSort(users: User[]) {
    const [sortField, setSortField] = useState<UserSortField>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

    const handleSort = (field: UserSortField) => {
        if (sortField === field) {
            // Toggle sort order if clicking same field
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            // New field, default to ascending
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const sortedUsers = [...users].sort((a, b) => {
        if (!sortField) return 0;

        const aVal = a[sortField];
        const bVal = b[sortField];

        // Handle null values
        if (aVal === null && bVal === null) return 0;
        if (aVal === null) return 1;
        if (bVal === null) return -1;

        // String comparison
        if (typeof aVal === "string" && typeof bVal === "string") {
            return sortOrder === "asc"
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        }

        // Number/Date comparison
        if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
        if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    return {
        sortField,
        sortOrder,
        sortedUsers,
        handleSort,
    };
}
