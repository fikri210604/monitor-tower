import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Shield, TrendingUp, AlertTriangle, FileText, MapPin, Clock } from "lucide-react";
import ExpiryWidget from "../components/Dashboard/ExpiryWidget";
import DashboardCharts from "../components/Dashboard/DashboardCharts";

export default async function Dashboard() {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;

    // Redirect OPERATOR to /maps
    if (userRole === "OPERATOR") {
        redirect("/maps");
    }

    // Calculate Date 30 days from now
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // 1. Fetch Basic Stats (Parallel)
    const [
        totalAset,
        sertifikasiSelesai,
        asetAman,
        recentAssets,
        expiringAssets
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
        }),
        // Fetch Expiring Certificates (End Date <= 30 Days from now AND End Date >= Today)
        prisma.asetTower.findMany({
            where: {
                tanggalAkhirSertifikat: {
                    lte: thirtyDaysFromNow,
                    gte: today // Optional: Don't show already expired? Or maybe show them too? Let's show all upcoming + expired for now.
                }
            },
            take: 10,
            orderBy: { tanggalAkhirSertifikat: 'asc' },
            select: {
                id: true,
                kodeSap: true,
                deskripsi: true,
                tanggalAkhirSertifikat: true
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

            {/* Expiry Notification Widget */}
            <ExpiryWidget expiringAssets={expiringAssets} />

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
                        {/* Interactive Charts */}
                        <div className="md:col-span-2">
                            <DashboardCharts
                                total={totalAset}
                                certified={sertifikasiSelesai}
                                safe={asetAman}
                            />
                        </div>

                        {/* 3. Recent Activity Table (Full Width) */}
                        {/* Note: I moved this out of grid-cols-2 to be full width below if desired, but let's keep it in flow */}
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
