"use client";

import { useSession } from "next-auth/react";
import { User, Shield, Calendar, Mail } from "lucide-react";

export default function ProfilePage() {
    const { data: session } = useSession();

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="text-gray-500">Memuat data profil...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                {/* Header Background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-pln-gradient opacity-10"></div>

                <div className="relative flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-gray-100">
                    <div className="w-24 h-24 rounded-2xl bg-pln-yellow flex items-center justify-center text-pln-blue font-bold text-4xl shadow-xl ring-4 ring-white">
                        {session.user?.name?.[0] || "U"}
                    </div>
                    <div className="flex-1 text-center md:text-left mb-2">
                        <h1 className="text-2xl font-bold text-gray-800">{session.user?.name}</h1>
                        <p className="text-pln-blue font-medium flex items-center justify-center md:justify-start gap-2">
                            <Shield className="w-4 h-4" />
                            {session.user?.role}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-4 hover:border-pln-cyan/30 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-pln-blue shadow-sm group-hover:scale-110 transition-transform">
                            <Mail className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Username / Email</p>
                            <p className="font-medium text-gray-800 mt-1">{session.user?.email}</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-4 hover:border-pln-cyan/30 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-pln-blue shadow-sm group-hover:scale-110 transition-transform">
                            <User className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Role Pengguna</p>
                            <p className="font-medium text-gray-800 mt-1">{session.user?.role || "-"}</p>
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-4 hover:border-pln-cyan/30 transition-colors group">
                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-pln-blue shadow-sm group-hover:scale-110 transition-transform">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Status Akun</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <p className="font-medium text-gray-800">Aktif</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* <div className="mt-8 flex justify-end">
                    <button className="px-4 py-2 bg-pln-blue text-white rounded-lg hover:bg-sky-600 transition-colors text-sm font-medium shadow-sm">
                        Edit Profil
                    </button>
                </div> */}
            </div>
        </div>
    );
}
