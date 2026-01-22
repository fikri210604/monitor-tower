import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { utils, write } from "xlsx";

export async function GET() {
    try {
        const assets = await prisma.asetTower.findMany({
            orderBy: { createdAt: "desc" }
        });

        // Format data for simpler Excel columns
        const data = assets.map((asset: any) => ({
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
        }));

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
