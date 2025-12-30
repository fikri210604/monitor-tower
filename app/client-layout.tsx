"use client";

import { SessionProvider } from "next-auth/react";
import Sidebar from "./components/Sidebar"; // Sesuaikan path jika perlu
import SplashScreen from "./components/SplashScreen"; // Sesuaikan path jika perlu
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function ClientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith("/auth");
    const [showSplash, setShowSplash] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <SessionProvider>
            {showSplash && (
                <SplashScreen onFinish={() => setShowSplash(false)} />
            )}

            {/* PARENT: h-screen (tinggi fix seukuran layar) & overflow-hidden (hilangkan scroll window) */}
            <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
                
                {/* 1. SIDEBAR AREA */}
                {!isAuthPage && !showSplash && (
                    <>
                        {/* Desktop Sidebar: Tidak perlu sticky lagi, cukup h-full */}
                        <div className="hidden md:block w-64 shrink-0 h-full border-r border-gray-200">
                            <Sidebar />
                        </div>

                        {/* Mobile Overlay Sidebar (Drawer) */}
                        {sidebarOpen && (
                            <div className="fixed inset-0 z-50 md:hidden">
                                <div
                                    className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                                    onClick={() => setSidebarOpen(false)}
                                />
                                <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl animate-in slide-in-from-left duration-200">
                                    <Sidebar onClose={() => setSidebarOpen(false)} className="w-full" />
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* 2. MAIN CONTENT AREA */}
                <main
                    className={`
                        flex-1 flex flex-col h-full min-w-0
                        transition-all duration-500 ease-out
                        ${showSplash ? "opacity-0 scale-95" : "opacity-100 scale-100"}
                    `}
                >
                    {/* Mobile Top Bar (Hanya muncul di mobile) */}
                    {!isAuthPage && !showSplash && (
                        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shrink-0">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors text-slate-600"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div className="text-sm font-medium text-slate-700">
                                PLN Tower Asset
                            </div>
                            <div className="w-8" /> {/* Spacer biar judul di tengah */}
                        </div>
                    )}

                    {/* Scrollable Content Wrapper */}
                    {/* Bagian ini yang membuat konten bisa discroll, sementara sidebar diam */}
                    <div className={`flex-1 overflow-y-auto custom-scrollbar ${isAuthPage ? "p-0" : "p-4 sm:p-6 lg:p-8"}`}>
                        {children}
                    </div>
                </main>
            </div>
        </SessionProvider>
    );
}