"use client";

import { X, Copy, Check, Info, ShieldAlert, Unlock, Lock } from "lucide-react";
import { useState } from "react";
import { User } from "@/types/user";

// Extended interface to include password
interface UserWithSecret extends User {
    password?: string;
    isEncrypted?: boolean;
}

interface UserDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserWithSecret | null;
}

export default function UserDetailModal({ isOpen, onClose, user }: UserDetailModalProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    if (!isOpen || !user) return null;

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const isActuallyEncrypted = user.isEncrypted;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Detail Pengguna</h3>
                        <p className="text-xs text-gray-500">Informasi lengkap kredensial pengguna</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    
                    {/* Security Notice */}
                    <div className={`border rounded-lg p-3 flex gap-3 text-sm ${isActuallyEncrypted ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
                        {isActuallyEncrypted ? (
                             <Unlock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        ) : (
                            <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                            <span className="font-semibold">{isActuallyEncrypted ? 'Password Terdekripsi' : 'Password Legacy (Hash)'}</span>
                            <p className="mt-1 text-xs opacity-90">
                                {isActuallyEncrypted 
                                    ? "Password ini tersimpan dengan enkripsi yang dapat dikembalikan (AES). Anda dapat melihatnya." 
                                    : "Password ini menggunakan hash satu arah (Legacy). User harus reset/update password agar bisa dilihat."}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Name */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nama Lengkap</label>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 font-medium">
                                {user.name}
                            </div>
                        </div>

                        {/* Username */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Username</label>
                            <div className="flex gap-2">
                                <div className="flex-1 p-3 bg-gray-50 rounded-lg border border-gray-200 text-gray-800 font-mono text-sm break-all">
                                    {user.username}
                                </div>
                                <button
                                    onClick={() => handleCopy(user.username, "username")}
                                    className="p-3 text-gray-500 hover:text-pln-blue bg-white border border-gray-200 hover:border-pln-blue rounded-lg transition-colors"
                                    title="Salin Username"
                                >
                                    {copiedField === "username" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                Password
                                {!isActuallyEncrypted && (
                                    <div className="group relative">
                                        <Info className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-48 p-2 bg-gray-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                                            Password lama masih menggunakan hash. Update password user ini untuk mengaktifkan fitur lihat password.
                                        </div>
                                    </div>
                                )}
                            </label>
                            <div className="flex gap-2">
                                <div className={`flex-1 p-3 rounded-lg border text-sm font-mono break-all leading-relaxed ${isActuallyEncrypted ? 'bg-white border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'}`}>
                                    {isActuallyEncrypted ? user.password : "**************** (Hash Hidden)"}
                                </div>
                                {isActuallyEncrypted && (
                                    <button
                                        onClick={() => handleCopy(user.password || "", "password")}
                                        className="p-3 text-gray-500 hover:text-pln-blue bg-white border border-gray-200 hover:border-pln-blue rounded-lg transition-colors self-start"
                                        title="Salin Password"
                                    >
                                        {copiedField === "password" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 shadow-sm text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
