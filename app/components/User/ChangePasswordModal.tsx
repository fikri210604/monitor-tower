"use client";

import { useState } from "react";
import { X, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import Toast, { ToastType } from "../ui/Toast";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);

    // Toast State (Internal to Modal or passed up? Let's use internal for simplicity or handle errors)
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        if (newPassword !== confirmPassword) {
            setError("Konfirmasi password tidak cocok");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password baru minimal 6 karakter");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/user/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Gagal mengubah password");
            }

            setSuccess(true);
            setTimeout(() => {
                onClose();
                // Reset form
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setSuccess(false);
            }, 2000);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden scale-100 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-pln-blue" />
                        Ganti Password
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:rotate-90 transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg flex items-center gap-2">
                            <CheckCircle2 size={16} />
                            Password berhasil diubah!
                        </div>
                    )}

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Password Saat Ini</label>
                        <div className="relative">
                            <input
                                type={showCurrent ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pln-blue/20 focus:border-pln-blue transition-all"
                                placeholder="Masukkan password lama"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Password Baru</label>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pln-blue/20 focus:border-pln-blue transition-all"
                                placeholder="Minimal 6 karakter"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Konfirmasi Password Baru</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-lg border focus:outline-none focus:ring-2 transition-all ${confirmPassword && newPassword !== confirmPassword
                                    ? "border-red-200 focus:border-red-500 focus:ring-red-200"
                                    : "border-gray-200 focus:border-pln-blue focus:ring-pln-blue/20"
                                }`}
                            placeholder="Ulangi password baru"
                            required
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading || success}
                            className="w-full bg-pln-blue text-white font-bold py-3 rounded-xl hover:bg-sky-600 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            {loading ? "Menyimpan..." : "Simpan Password Baru"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
