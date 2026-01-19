"use client";

import { useState, useMemo } from "react";
import { User } from "@/types/user";

export function useUserTableFilters(users: User[]) {
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");

    // Get unique roles for filter dropdown
    const uniqueRoles = useMemo(() => {
        const roles = new Set(users.map(user => user.role));
        return Array.from(roles);
    }, [users]);

    // Apply filters
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            // Search filter (name or username)
            const matchesSearch =
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.username.toLowerCase().includes(searchQuery.toLowerCase());

            // Role filter
            const matchesRole = roleFilter === "all" || user.role === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, roleFilter]);

    const hasActiveFilters = searchQuery !== "" || roleFilter !== "all";

    const resetFilters = () => {
        setSearchQuery("");
        setRoleFilter("all");
    };

    return {
        searchQuery,
        setSearchQuery,
        roleFilter,
        setRoleFilter,
        uniqueRoles,
        filteredUsers,
        hasActiveFilters,
        resetFilters,
    };
}
