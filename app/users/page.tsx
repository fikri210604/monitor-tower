"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserTable from "@/app/components/User/UserTable";
import UserFormModal from "@/app/components/User/UserFormModal";
import UserDetailModal from "@/app/components/User/UserDetailModal";
import ReAuthModal from "@/app/components/User/ReAuthModal";
import { verifyCurrentPassword, getUserWithSecrets } from "@/app/actions/user";
import Toast, { ToastType } from "@/app/components/ui/Toast";
import { Plus, RefreshCw } from "lucide-react";
import { User } from "@/types/user";

export default function UsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    // CRUD States
    // CRUD States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    
    // View Details States
    const [isReAuthOpen, setIsReAuthOpen] = useState(false);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedUserForView, setSelectedUserForView] = useState<User | null>(null);
    const [secretUser, setSecretUser] = useState<any | null>(null);

    // Toast State
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    const showToast = (message: string, type: ToastType) => {
        setToast({ message, type });
    };

    // Redirect if not Master
    useEffect(() => {
        if (status === "authenticated" && (session?.user as any)?.role !== "MASTER") {
            router.push("/dashboard");
            showToast("Akses ditolak: Hanya Master yang dapat mengakses halaman ini", "error");
        }
    }, [status, session, router]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else if (res.status === 403) {
                showToast("Akses ditolak", "error");
                router.push("/dashboard");
            } else {
                showToast("Gagal memuat data user", "error");
            }
        } catch (error) {
            console.error("Failed to fetch users", error);
            showToast("Gagal memuat data user", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status === "authenticated" && (session?.user as any)?.role === "MASTER") {
            fetchUsers();
        }
    }, [status, session]);

    const handleDelete = async (id: string) => {
        if (!confirm("Apakah Anda yakin ingin menghapus user ini?")) return;

        try {
            const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
            if (res.ok) {
                showToast("User berhasil dihapus", "success");
                fetchUsers();
            } else {
                const err = await res.json();
                showToast(err.error || "Gagal menghapus user", "error");
            }
        } catch (error) {
            console.error("Delete failed", error);
            showToast("Terjadi kesalahan saat menghapus", "error");
        }
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleCreate = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleSave = async (data: any) => {
        const method = editingUser ? "PUT" : "POST";
        const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Gagal menyimpan");
            }

            showToast(editingUser ? "User berhasil diperbarui" : "User berhasil ditambahkan", "success");
            fetchUsers();
        } catch (error: any) {
            showToast(error.message || "Gagal menyimpan data", "error");
            throw error; // Re-throw so modal understands it failed
        }
    };

    // View Detail Handlers
    const handleView = (user: User) => {
        setSelectedUserForView(user);
        setIsReAuthOpen(true);
    };

    const handleReAuthSuccess = async () => {
        setIsReAuthOpen(false);
        if (selectedUserForView) {
            try {
                const fullUser = await getUserWithSecrets(selectedUserForView.id);
                setSecretUser(fullUser);
                setIsDetailOpen(true);
            } catch (error) {
                console.error(error);
                showToast("Gagal mengambil data detail user", "error");
            }
        }
    };

    // Don't render if not Super Admin
    if (status === "loading" || status === "unauthenticated") {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-500">Memuat...</div>
            </div>
        );
    }

    if ((session?.user as any)?.role !== "MASTER") {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="space-y-6 relative">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen User</h1>
                    <p className="text-gray-500 text-sm">Kelola akses dan role pengguna sistem</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => fetchUsers()}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                        title="Refresh Data"
                    >
                        <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleCreate}
                        className="flex items-center gap-2 px-4 py-2 bg-pln-blue text-white rounded-lg hover:bg-sky-600 transition-colors shadow-sm font-medium"
                    >
                        <Plus className="w-4 h-4" />
                        Tambah User
                    </button>
                </div>
            </div>

            {/* User Table */}
            <div>
                <UserTable users={users} onDelete={handleDelete} onEdit={handleEdit} onView={handleView} />
            </div>

            {/* Modal */}
            <UserFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                initialData={editingUser}
            />

            {/* View Detail Modals */}
            <ReAuthModal
                isOpen={isReAuthOpen}
                onClose={() => setIsReAuthOpen(false)}
                onSuccess={handleReAuthSuccess}
                verifyAction={verifyCurrentPassword}
            />

            <UserDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                user={secretUser}
            />
        </div>
    );
}
