"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft } from "lucide-react";

export default function ResetPassword() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setTimeout(() => {
            setSubmitted(true);
        }, 1000);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-pln-gradient p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-pln-yellow/20 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden relative z-10">
                <div className="p-8 text-center bg-gray-50 border-b border-gray-100">
                    <div className="w-16 h-16 bg-pln-cyan mx-auto rounded-xl flex items-center justify-center shadow-lg mb-4">
                        <Mail className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Reset Password</h2>
                    <p className="text-gray-500 text-sm mt-1">
                        {!submitted ? "Masukkan email/username Anda untuk reset password" : "Periksa email Anda"}
                    </p>
                </div>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email / Username</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pln-blue/20 focus:border-pln-blue transition-all outline-none"
                                    required
                                    placeholder="admin"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-pln-blue hover:bg-sky-600 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                        >
                            Kirim Link Reset
                        </button>
                    </form>
                ) : (
                    <div className="p-8 text-center space-y-6">
                        <div className="p-4 bg-green-50 text-green-700 rounded-xl border border-green-100 text-sm">
                            Link reset password telah dikirim ke <strong>{email}</strong> (Simulasi). Silakan cek inbox Anda.
                        </div>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="text-pln-blue hover:text-pln-cyan font-medium text-sm underline"
                        >
                            Kirim ulang
                        </button>
                    </div>
                )}

                <div className="p-4 bg-gray-50 text-center border-t border-gray-100">
                    <Link href="/auth/signin" className="inline-flex items-center gap-2 text-gray-600 hover:text-pln-blue transition-colors text-sm font-medium">
                        <ArrowLeft className="w-4 h-4" />
                        Kembali ke Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
