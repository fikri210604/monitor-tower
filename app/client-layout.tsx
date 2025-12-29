"use client";

import { SessionProvider } from "next-auth/react";
import Sidebar from "./components/Sidebar";
import SplashScreen from "./components/SplashScreen";
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

            <div className="flex min-h-screen bg-gray-50 overflow-hidden">
                {/* Sidebar */}
                {!isAuthPage && !showSplash && (
                    <>
                        {/* Desktop & Tablet sidebar - Sticky */}
                        <div className="hidden md:block w-64 shrink-0 sticky top-0 h-screen">
                            <Sidebar />
                        </div>

                        {/* Mobile overlay sidebar - Fixed Drawer */}
                        {sidebarOpen && (
                            <div className="fixed inset-0 z-40 md:hidden">
                                <div
                                    className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                                    onClick={() => setSidebarOpen(false)}
                                />
                                <div className="relative z-50 w-72 h-full bg-white shadow-2xl animate-in slide-in-from-left duration-200">
                                    <Sidebar onClose={() => setSidebarOpen(false)} className="w-full" />
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Main Content */}
                <main
                    className={`
            flex-1 min-w-0 w-full
            transition-all duration-500 ease-out
            ${showSplash ? "opacity-0 scale-95" : "opacity-100 scale-100"}
            ${isAuthPage ? "p-0" : "p-4 sm:p-6 lg:p-8"}
          `}
                >
                    {/* Mobile Top Bar */}
                    {!isAuthPage && !showSplash && (
                        <div className="md:hidden mb-6 flex items-center justify-between">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 -ml-2 hover:bg-white/50 rounded-lg transition-colors text-slate-600"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div className="text-sm font-medium text-slate-500">
                                PLN Tower Asset
                            </div>
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </SessionProvider>
    );
}
