"use client";

import { useState, useEffect } from "react";
import { X, Save, Eye, EyeOff } from "lucide-react";

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    initialData?: any;
}

export default function UserFormModal({ isOpen, onClose, onSave, initialData }: UserFormModalProps) {
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        password: "",
        role: "OPERATOR" as "MASTER" | "ADMIN" | "OPERATOR",
    });

    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || "",
                username: initialData.username || "",
                password: "", // Always empty for edit mode
                role: initialData.role || "OPERATOR",
            });
        } else {
            setFormData({
                name: "",
                username: "",
                password: "",
                role: "OPERATOR",
            });
        }
        setPasswordError("");
        setShowPassword(false);
    }, [initialData, isOpen]);

    // Client-side password validation
    const validatePassword = (password: string): string => {
        if (!password && !initialData) {
            return "Password wajib diisi";
        }

        if (password) { // Only validate if password is provided
            if (password.length < 8) {
                return "Password minimal 8 karakter";
            }

            const hasNumber = /\d/.test(password);
            if (!hasNumber) {
                return "Password harus mengandung minimal 1 angka";
            }

            const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
            if (!hasSymbol) {
                return "Password harus mengandung minimal 1 simbol (!@#$%^&* dll)";
            }
        }

        return "";
    };

    // Handle password change with real-time validation
    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPassword = e.target.value;
        setFormData({ ...formData, password: newPassword });

        if (newPassword) {
            const error = validatePassword(newPassword);
            setPasswordError(error);
        } else {
            setPasswordError("");
        }
    };

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate password before submit
        if (formData.password) {
            const error = validatePassword(formData.password);
            if (error) {
                setPasswordError(error);
                return;
            }
        } else if (!initialData) {
            // Password required for new user
            setPasswordError("Password wajib diisi");
            return;
        }

        setLoading(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 sticky top-0 z-10 backdrop-blur-md">
                    <h3 className="font-bold text-gray-800">
                        {initialData ? "Edit User" : "Tambah User Baru"}
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Name Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Nama Lengkap <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 focus:border-pln-blue outline-none"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="John Doe"
                        />
                    </div>

                    {/* Username Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Username <span className="text-red-500">*</span>
                        </label>
                        <input
                            required
                            type="text"
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 focus:border-pln-blue outline-none"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            placeholder="johndoe"
                            autoComplete="username"
                        />
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Password {!initialData && <span className="text-red-500">*</span>}
                            {initialData && <span className="text-gray-400 text-xs ml-1">(Kosongkan jika tidak ingin ubah)</span>}
                        </label>
                        <div className="relative">
                            <input
                                required={!initialData}
                                type={showPassword ? "text" : "password"}
                                className={`w-full px-3 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-pln-blue/20 outline-none ${passwordError ? "border-red-300 focus:border-red-500" : "border-gray-200 focus:border-pln-blue"
                                    }`}
                                value={formData.password}
                                onChange={handlePasswordChange}
                                placeholder="Min. 8 karakter, 1 angka, 1 simbol"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {/* Password Requirements */}
                        <div className="mt-2 text-xs space-y-1">
                            <p className={formData.password.length >= 8 ? "text-green-600" : "text-gray-500"}>
                                ✓ Minimal 8 karakter
                            </p>
                            <p className={/\d/.test(formData.password) ? "text-green-600" : "text-gray-500"}>
                                ✓ Mengandung minimal 1 angka
                            </p>
                            <p className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? "text-green-600" : "text-gray-500"}>
                                ✓ Mengandung minimal 1 simbol (!@#$%^&* dll)
                            </p>
                        </div>

                        {/* Error Message */}
                        {passwordError && (
                            <p className="mt-2 text-xs text-red-600 font-medium">
                                {passwordError}
                            </p>
                        )}
                    </div>

                    {/* Role Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Role <span className="text-red-500">*</span>
                        </label>
                        <select
                            required
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pln-blue/20 focus:border-pln-blue outline-none bg-white"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as "MASTER" | "ADMIN" | "OPERATOR" })}
                        >
                            <option value="OPERATOR">Operator</option>
                            <option value="ADMIN">Admin</option>
                            <option value="MASTER">Master</option>
                            <option value="SUPER_ADMIN" disabled hidden>Super Admin (Legacy)</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 flex gap-3 justify-end border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !!passwordError}
                            className="px-4 py-2 bg-pln-blue hover:bg-sky-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-lg shadow-pln-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Simpan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
