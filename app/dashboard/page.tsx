import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Shield, TrendingUp, AlertTriangle, FileText, MapPin, Clock } from "lucide-react";

export default async function Dashboard() {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    // Redirect OPERATOR to /maps
    if (userRole === "OPERATOR") {
        redirect("/maps");
    }

    // 1. Fetch Basic Stats (Parallel)
    const [
        totalAset,
        sertifikasiSelesai,
        asetAman,
        recentAssets
    ] = await Promise.all([
        prisma.asetTower.count(),
        prisma.asetTower.count({ where: { nomorSertifikat: { not: null } } }),
        prisma.asetTower.count({
            where: {
                OR: [
                    { permasalahanAset: null },
                    { permasalahanAset: { contains: "clean", mode: "insensitive" } }
                ]
            }
        }),
        // Fetch 5 most recent assets
        prisma.asetTower.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                deskripsi: true,
                alamat: true,
                createdAt: true,
                permasalahanAset: true
            }
        })
    ]);

    const masalahAktif = totalAset - asetAman;
    const sertifikasiPercentage = totalAset > 0 ? Math.round((sertifikasiSelesai / totalAset) * 100) : 0;

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                    <p className="text-gray-500">Selamat datang kembali, <span className="font-semibold text-pln-blue">{session?.user?.name}</span>!</p>
                </div>
                <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-full border border-gray-200">
                    <Shield className="w-4 h-4 text-pln-blue" />
                    <span className="text-sm font-medium text-gray-600">{userRole} Access</span>
                </div>
            </div>

            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Aset"
                    value={totalAset}
                    subtitle="Unit Aset Terdaftar"
                    color="text-gray-800"
                />
                <StatCard
                    title="Sertifikasi Selesai"
                    value={sertifikasiSelesai}
                    subtitle={`${sertifikasiPercentage}% telah bersertifikat`}
                    color="text-pln-blue"
                />
                <StatCard
                    title="Aset Aman"
                    value={asetAman}
                    subtitle="Clean and Clear"
                    color="text-green-600"
                />
                <StatCard
                    title="Masalah Aktif"
                    value={masalahAktif}
                    subtitle="Perlu Tindak Lanjut"
                    color="text-red-500"
                />
            </div>

            {/* --- Executive Dashboard (Master & Admin Only) --- */}
            {(userRole === "MASTER" || userRole === "ADMIN") && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 pt-4">
                        <TrendingUp className="w-5 h-5 text-pln-blue" />
                        Statistik & Aktivitas
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 1. Pie Chart: Status Sertifikasi (REPLACEMENT) */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                            <h3 className="font-semibold text-gray-700 mb-6 w-full text-center">Status Sertifikasi Aset</h3>

                            <div className="relative w-48 h-48 rounded-full shadow-inner flex items-center justify-center transition-all hover:scale-105 duration-500"
                                style={{
                                    background: `conic-gradient(
                                        #10b981 0% ${(sertifikasiSelesai / totalAset) * 100}%, 
                                        #f59e0b ${(sertifikasiSelesai / totalAset) * 100}% 100%
                                    )`
                                }}
                            >
                                {/* Inner Circle */}
                                <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                    <span className="text-3xl font-bold text-gray-800">{sertifikasiPercentage}%</span>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Bersertifikat</span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex gap-6 mt-8">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></span>
                                    <div className="text-xs text-gray-600">
                                        <p className="font-bold">{sertifikasiSelesai}</p>
                                        <p>Sudah</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-200"></span>
                                    <div className="text-xs text-gray-600">
                                        <p className="font-bold">{totalAset - sertifikasiSelesai}</p>
                                        <p>Belum</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. Pie Chart: Distribusi Kesehatan Aset (EXISTING, MOVED) */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center">
                            <h3 className="font-semibold text-gray-700 mb-6 w-full text-center">Kesehatan Aset</h3>

                            <div className="relative w-48 h-48 rounded-full shadow-inner flex items-center justify-center transition-all hover:scale-105 duration-500"
                                style={{
                                    background: `conic-gradient(
                                            #3b82f6 0% ${(asetAman / totalAset) * 100}%, 
                                            #ef4444 ${(asetAman / totalAset) * 100}% 100%
                                        )`
                                }}
                            >
                                {/* Inner Circle */}
                                <div className="w-32 h-32 bg-white rounded-full flex flex-col items-center justify-center shadow-sm">
                                    <span className="text-3xl font-bold text-gray-800">{Math.round((asetAman / totalAset) * 100)}%</span>
                                    <span className="text-[10px] text-gray-400 uppercase tracking-wider">Aset Aman</span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="flex gap-6 mt-8">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></span>
                                    <div className="text-xs text-gray-600">
                                        <p className="font-bold">{asetAman}</p>
                                        <p>Aman</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-200"></span>
                                    <div className="text-xs text-gray-600">
                                        <p className="font-bold">{masalahAktif}</p>
                                        <p>Masalah</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Recent Activity Table (Full Width) */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm md:col-span-2">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-700 font-medium flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    Aset Terbaru Ditambahkan
                                </h3>
                                <a href="/assets" className="text-sm text-pln-blue hover:underline">Lihat Semua</a>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                                        <tr>
                                            <th className="px-4 py-3 rounded-l-lg">Deskripsi / Nama</th>
                                            <th className="px-4 py-3">Lokasi</th>
                                            <th className="px-4 py-3">Tanggal Input</th>
                                            <th className="px-4 py-3 rounded-r-lg">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {recentAssets.map(asset => (
                                            <tr key={asset.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="px-4 py-3 font-medium text-gray-800">
                                                    {asset.deskripsi || "Tanpa Nama"}
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                                                        {asset.alamat || "-"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500">
                                                    {new Date(asset.createdAt).toLocaleDateString("id-ID", {
                                                        day: "numeric", month: "short", year: "numeric"
                                                    })}
                                                </td>
                                                <td className="px-4 py-3">
                                                    {asset.permasalahanAset && !asset.permasalahanAset.toLowerCase().includes("clean") ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            Masalah
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600 border border-green-100">
                                                            <Shield className="w-3 h-3" />
                                                            Aman
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Simple internal component for stat cards to reduce clutter
function StatCard({ title, value, subtitle, color }: { title: string, value: number, subtitle: string, color: string }) {
    return (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
            <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
            <p className={`text-3xl font-bold mt-2 ${color} group-hover:scale-105 transition-transform origin-left duration-300`}>
                {value.toLocaleString("id-ID")}
            </p>
            <div className={`mt-4 text-xs font-medium ${color} opacity-80`}>
                {subtitle}
            </div>
        </div>
    );
}
