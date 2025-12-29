import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { data } = await req.json();

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    let successCount = 0;
    let errors = [];

    for (const item of data) {
      try {
        // Validate mandatory fields
        if (!item.kodeSap || !item.koordinatX || !item.koordinatY) {
          continue; // Skip invalid rows
        }

        await prisma.asetTower.create({
          data: {
            kodeSap: Number(item.kodeSap),
            kodeUnit: item.kodeUnit ? Number(item.kodeUnit) : 3215,
            deskripsi: item.deskripsi,
            luasTanah: item.luasTanah ? parseFloat(item.luasTanah) : null,
            tahunPerolehan: item.tahunPerolehan ? parseInt(item.tahunPerolehan) : null,

            alamat: item.alamat,
            desa: item.desa,
            kecamatan: item.kecamatan,
            kabupaten: item.kabupaten,
            provinsi: item.provinsi || "LAMPUNG",
            koordinatX: Number(item.koordinatX),
            koordinatY: Number(item.koordinatY),

            jenisDokumen: item.jenisDokumen,
            nomorSertifikat: item.nomorSertifikat,

            // Map Enums with fallbacks
            penguasaanTanah: item.penguasaanTanah || "DIKUASAI",
            jenisBangunan: item.jenisBangunan || "TAPAK_TOWER",
            permasalahanAset: item.permasalahanAset || "CLEAN_AND_CLEAR",
          }
        });
        successCount++;
      } catch (error: any) {
        console.error(`Error importing row ${item.kodeSap}:`, error);
        errors.push({ kodeSap: item.kodeSap, error: error.message });
      }
    }

    return NextResponse.json({
      message: "Import processing finished",
      successCount,
      errors
    });

  } catch (error) {
    console.error("Import Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
