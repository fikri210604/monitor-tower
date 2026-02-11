"use client";

import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Home, User, LogOut, FileText, AlertTriangle, MapPinned, Users, History } from "lucide-react";
import logoPln from "../../public/Logo_PLN.png";

export default function Sidebar({ className = "", onClose }: { className?: string; onClose?: () => void }) {
    const pathname = usePathname();
    const { data: session, status } = useSession();

    // User role
    const userRole = (session?.user as any)?.role;

    const baseLinks = [
        { href: "/dashboard", label: "Dashboard", icon: Home },
        { href: "/maps", label: "Peta", icon: MapPinned },
        { href: "/assets", label: "Data Aset", icon: FileText },
        { href: "/profile", label: "Profile", icon: User },
    ];

    // Filter links based on role (Immutable way)
    const links = baseLinks.filter(link => {
        if (link.href === "/dashboard" && userRole === "OPERATOR") return false;
        return true;
    });

    // Add Users menu only for MASTER
    if (userRole === "MASTER") {
        links.push({ href: "/users", label: "Manajemen User", icon: Users });
    }

    // Add Audit Log for MASTER and ADMIN
    if (userRole === "MASTER" || userRole === "ADMIN") {
        links.push({ href: "/history", label: "Riwayat Aktivitas", icon: History });
    }

    if (status === "unauthenticated") return null;

    return (
        <aside className={`w-64 bg-pln-light/80 text-white flex flex-col shadow-xl h-full overflow-hidden ${className}`}>
            <div className="p-4 border-b border-pln-cyan/30 flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 relative flex-shrink-0 bg-white/20 rounded-lg p-1.5">
                    <NextImage src={logoPln} alt="Logo PLN" className="w-full h-full object-contain" priority />
                </div>
                <div className="min-w-0">
                    <h1 className="text-lg font-bold tracking-tight leading-tight text-pln-blue">DIMATA</h1>
                    <p className="text-[10px] text-pln-cyan font-medium leading-tight">Digitalisasi Monitoring Aset Tanah</p>
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
                                : "hover:bg-white/10 text-pln-cyan hover:text-pln-blue"
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-pln-cyan group-hover:text-pln-blue transition-colors"}`} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-pln-cyan/30 bg-pln-light shrink-0">
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
                            <p className="text-sm font-semibold truncate text-pln-cyan">{session?.user?.name}</p>
                            <p className="text-xs text-pln-cyan font-medium truncate">{session?.user?.role}</p>
                        </div>
                    </div>
                )}

                <button
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white hover:text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
}
