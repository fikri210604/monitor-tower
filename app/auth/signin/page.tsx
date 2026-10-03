"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import Link from "next/link";
import { Lock, User, Eye, EyeOff } from "lucide-react";
import logoPln from "../../../public/Logo_PLN.png";

export default function SignIn() {
    const router = useRouter();
    const { status } = useSession();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const result = await signIn("credentials", {
                redirect: false,
                username,
                password,
            });

            if (result?.error) {
                setError("Login gagal. Periksa kembali username dan password Anda.");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch (err) {
            setError("Terjadi kesalahan sistem.");
        } finally {
            setLoading(false);
        }
    };

    if (status === "authenticated") {
        return null; // Don't render form if already logged in (redirecting...)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-pln-gradient p-4 relative overflow-hidden">
            {/* Background Patterns */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-pln-yellow/20 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10">
                <div className="p-2 text-center bg-gray-50 border-b border-gray-100">
                    <div className="w-32 h-32 mx-auto relative flex items-center justify-center">
                        <NextImage src={logoPln} alt="Logo PLN" className="w-full h-full object-contain" priority />
                    </div>
                    <p className="text-pln-cyan tracking-wide uppercase">Digital - Tertib - Terpantau</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-start gap-2">
                            <span className="mt-0.5">⚠️</span>
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pln-blue/20 focus:border-pln-blue transition-all outline-none"
                                    required
                                    placeholder="Masukkan username"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="relative">
                                {/* Icon kiri */}
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock className="h-5 w-5" />
                                </div>

                                {/* Input */}
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl
               focus:ring-2 focus:ring-pln-blue/20 focus:border-pln-blue
               transition-all outline-none"
                                    required
                                    placeholder="Masukkan password"
                                />

                                {/* Eye toggle */}
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>

                        </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="rounded border-gray-300 text-pln-blue focus:ring-pln-blue" />
                            <span className="text-gray-600">Ingat saya</span>
                        </label>
                        <Link href="/auth/reset-password" className="text-pln-blue hover:text-pln-cyan font-medium transition-colors">
                            Lupa password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-pln-blue hover:bg-sky-600 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
                    >
                        {loading ? "Memproses..." : "Masuk Aplikasi"}
                    </button>
                </form>

                <div className="p-4 bg-gray-50 text-center text-xs text-gray-400 border-t border-gray-100">
                    &copy; {new Date().getFullYear()} PT PLN (Persero). All rights reserved.
                </div>
            </div>
        </div>
    );
}
