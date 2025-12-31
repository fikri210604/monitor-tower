/**
 * User-related type definitions
 */

export interface User {
    id: string;
    name: string;
    username: string;
    role: "SUPER_ADMIN" | "OPERATOR";
    createdAt: string;
    updatedAt: string;
}

export interface UserTableProps {
    users: User[];
    onDelete: (id: string) => void;
    onEdit: (user: User) => void;
}

export type UserSortField = keyof User | null;
export type SortOrder = 'asc' | 'desc';
