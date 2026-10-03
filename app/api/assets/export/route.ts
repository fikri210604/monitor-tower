import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { utils, write } from "xlsx";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== "MASTER" && role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const data: Record<string, unknown>[] = [];
        const batchSize = 500;
        let skip = 0;
        let batch;

        do {
            batch = await prisma.asetTower.findMany({
                skip,
                take: batchSize,
                orderBy: { createdAt: "desc" },
                select: {
                    kodeSap: true,
                    kodeUnit: true,
                    deskripsi: true,
                    alamat: true,
                    desa: true,
                    kecamatan: true,
                    kabupaten: true,
                    provinsi: true,
                    tahunPerolehan: true,
                    luasTanah: true,
                    koordinatX: true,
                    koordinatY: true,
                    jenisBangunan: true,
                    nomorSertifikat: true,
                    tanggalAwalSertifikat: true,
                    tanggalAkhirSertifikat: true,
                    penguasaanTanah: true,
                    permasalahanAset: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });

            data.push(...batch.map((asset) => ({
            "Nomor SAP": Number(asset.kodeSap),
            "Kode Unit": Number(asset.kodeUnit),
            "Deskripsi": asset.deskripsi,
            "Alamat": asset.alamat,
            "Desa": asset.desa,
            "Kecamatan": asset.kecamatan,
            "Kabupaten": asset.kabupaten,
            "Provinsi": asset.provinsi,
            "Tahun Perolehan": asset.tahunPerolehan,
            "Luas Tanah (m2)": asset.luasTanah,
            "Koordinat X": asset.koordinatX,
            "Koordinat Y": asset.koordinatY,
            "Jenis Bangunan": asset.jenisBangunan,
            "Nomor Sertifikat": asset.nomorSertifikat,
            "Tanggal Terbit Sertifikat": asset.tanggalAwalSertifikat ? new Date(asset.tanggalAwalSertifikat).toLocaleDateString("id-ID") : "-",
            "Tanggal Berakhir Sertifikat": asset.tanggalAkhirSertifikat ? new Date(asset.tanggalAkhirSertifikat).toLocaleDateString("id-ID") : "-",
            "Status Penguasaan": asset.penguasaanTanah,
            "Permasalahan": asset.permasalahanAset,
            "Dibuat Pada": asset.createdAt ? new Date(asset.createdAt).toLocaleDateString("id-ID") : "-",
            "Update Terakhir": asset.updatedAt ? new Date(asset.updatedAt).toLocaleDateString("id-ID") : "-",
            })));
            skip += batch.length;
        } while (batch.length === batchSize);

        const worksheet = utils.json_to_sheet(data);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, "Data Aset");

        // Generate buffer
        const buf = write(workbook, { type: "buffer", bookType: "xlsx" });

        return new Response(buf, {
            status: 200,
            headers: {
                "Content-Disposition": `attachment; filename="data-aset-pln-${new Date().toISOString().split('T')[0]}.xlsx"`,
                "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            },
        });

    } catch (error) {
        console.error("Export Error:", error);
        return NextResponse.json(
            { error: "Gagal mengekspor data" },
            { status: 500 }
        );
    }
}
