import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    // Fetch statistics database parallel
    const [totalAset, sertifikasiSelesai, masalahAktif] = await Promise.all([
        prisma.asetTower.count(),
        prisma.asetTower.count({
            where: {
                nomorSertifikat: { not: null }
            }
        }),
        prisma.asetTower.count({
            where: {
                permasalahanAset: { not: "CLEAN_AND_CLEAR" }
            }
        })
    ]);

    // Calculate percentage
    const sertifikasiPercentage = totalAset > 0
        ? Math.round((sertifikasiSelesai / totalAset) * 100)
        : 0;

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
                <p className="text-gray-500">Selamat datang kembali, <span className="font-semibold text-pln-blue">{session?.user?.name}</span>!</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Total Aset</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{totalAset.toLocaleString("id-ID")}</p>
                    <div className="mt-4 text-xs text-green-600 font-medium flex items-center gap-1">
                        <span>↑ 12%</span>
                        <span className="text-gray-400">dari bulan lalu</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Sertifikasi Selesai</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{sertifikasiSelesai.toLocaleString("id-ID")}</p>
                    <div className="mt-4 text-xs text-pln-blue font-medium flex items-center gap-1">
                        <span>{sertifikasiPercentage}%</span>
                        <span className="text-gray-400">total progress</span>
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <h3 className="text-gray-500 text-sm font-medium">Masalah Aktif</h3>
                    <p className="text-3xl font-bold text-gray-800 mt-2">{masalahAktif.toLocaleString("id-ID")}</p>
                    <div className="mt-4 text-xs text-red-500 font-medium flex items-center gap-1">
                        <span>↓ 2</span>
                        <span className="text-gray-400">dari minggu lalu</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
