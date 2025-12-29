"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Home, User, LogOut, FileText, AlertTriangle, MapPinned, Image as ImageIcon } from "lucide-react";

export default function Sidebar({ className = "", onClose }: { className?: string; onClose?: () => void }) {
    const pathname = usePathname();
    const { data: session, status } = useSession();

    const links = [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/maps", label: "Peta", icon: MapPinned },
        { href: "/assets", label: "Data Aset", icon: FileText },
        { href: "/issues", label: "Permasalahan", icon: AlertTriangle },
        { href: "/profile", label: "Profile", icon: User },
    ];

    if (status === "unauthenticated") return null;

    return (
        <aside className={`w-64 bg-pln-blue text-white flex flex-col shadow-xl h-full overflow-hidden ${className}`}>
            <div className="p-6 border-b border-pln-cyan/30 flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 bg-pln-yellow rounded-lg flex items-center justify-center text-pln-blue font-bold text-xl shadow-lg">
                    ⚡
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Sertifikasi</h1>
                    <p className="text-xs text-pln-cyan font-medium">PLN Tower Asset</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                {links.map((link) => {
                    const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                    const Icon = link.icon;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? "bg-pln-cyan text-white shadow-md font-medium"
                                : "hover:bg-white/10 text-white/80 hover:text-white"
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-white/70 group-hover:text-pln-yellow transition-colors"}`} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-pln-cyan/30 bg-pln-blue/50 shrink-0">
                {status === "loading" ? (
                    <div className="animate-pulse flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-white/20"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-white/20 rounded w-20"></div>
                            <div className="h-2 bg-white/20 rounded w-12"></div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-pln-yellow flex items-center justify-center text-pln-blue font-bold text-xs">
                            {session?.user?.name?.[0] || "U"}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{session?.user?.name}</p>
                            <p className="text-xs text-white/70 truncate">{session?.user?.role}</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500 text-red-100 hover:text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
