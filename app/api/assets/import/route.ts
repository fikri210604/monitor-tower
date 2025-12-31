import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check role - only Super Admin can import assets
  if ((session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Only Super Admin can import assets" },
      { status: 403 }
    );
  }

  try {
    const { rows, replaceAll } = await req.json();

    console.log("📥 Received import request with", rows?.length || 0, "rows");
    console.log("🔄 Replace all mode:", replaceAll);

    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: "Invalid data format - expected 'rows' array" }, { status: 400 });
    }

    if (rows.length === 0) {
      return NextResponse.json({ error: "No data to import" }, { status: 400 });
    }

    // If replaceAll is true, delete all existing assets
    if (replaceAll) {
      console.log("🗑️  Deleting all existing assets...");
      const deleteResult = await prisma.asetTower.deleteMany({});
      console.log(`✅ Deleted ${deleteResult.count} existing assets`);
    }

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let errors: Array<{ row: number, kodeSap?: any, reason: string }> = [];

    for (let i = 0; i < rows.length; i++) {
      const item = rows[i];
      const rowNumber = i + 1;

      try {
        // Auto-generate kodeSap if missing
        if (!item.kodeSap) {
          item.kodeSap = 10000 + rowNumber;
          console.log(`📝 Auto-generated kodeSap for row ${rowNumber}: ${item.kodeSap}`);
        }

        // Set default enum values
        if (!item.jenisBangunan) item.jenisBangunan = "TAPAK_TOWER";
        if (!item.penguasaanTanah) item.penguasaanTanah = "DIKUASAI";
        if (!item.permasalahanAset) item.permasalahanAset = "CLEAN_AND_CLEAR";

        // Required fields validation
        const missingFields = [];
        if (!item.koordinatX) missingFields.push("koordinatX");
        if (!item.koordinatY) missingFields.push("koordinatY");

        if (missingFields.length > 0) {
          const reason = `Missing required coordinates: ${missingFields.join(", ")}`;
          console.warn(`⚠️  Row ${rowNumber} (KodeSap: ${item.kodeSap}): ${reason}`);
          errors.push({ row: rowNumber, kodeSap: item.kodeSap, reason });
          skippedCount++;
          continue;
        }

        // Enum validation
        const validJenisBangunan = ["GARDU_INDUK", "TAPAK_TOWER"];
        const validPenguasaanTanah = ["DIKUASAI", "TIDAK_DIKUASAI"];
        const validPermasalahanAset = ["CLEAN_AND_CLEAR", "TUMPAK_TINDIH"];

        if (!validJenisBangunan.includes(item.jenisBangunan)) item.jenisBangunan = "TAPAK_TOWER";
        if (!validPenguasaanTanah.includes(item.penguasaanTanah)) item.penguasaanTanah = "DIKUASAI";
        if (!validPermasalahanAset.includes(item.permasalahanAset)) item.permasalahanAset = "CLEAN_AND_CLEAR";

        await prisma.asetTower.create({
          data: {
            kodeSap: Number(item.kodeSap),
            kodeUnit: item.kodeUnit ? Number(item.kodeUnit) : 3215,
            deskripsi: item.deskripsi || null,
            luasTanah: item.luasTanah ? parseFloat(item.luasTanah) : null,
            tahunPerolehan: item.tahunPerolehan ? parseInt(item.tahunPerolehan) : null,
            alamat: item.alamat || null,
            desa: item.desa || null,
            kecamatan: item.kecamatan || null,
            kabupaten: item.kabupaten || null,
            provinsi: item.provinsi || "LAMPUNG",
            koordinatX: parseFloat(item.koordinatX),
            koordinatY: parseFloat(item.koordinatY),
            jenisDokumen: item.jenisDokumen || null,
            nomorSertifikat: item.nomorSertifikat || null,
            penguasaanTanah: item.penguasaanTanah,
            jenisBangunan: item.jenisBangunan,
            permasalahanAset: item.permasalahanAset,
          }
        });

        successCount++;
      } catch (error: any) {
        errorCount++;
        const reason = error.message || "Database error";
        console.error(`❌ Row ${rowNumber}: ${reason}`);
        errors.push({ row: rowNumber, kodeSap: item.kodeSap, reason });
      }
    }

    if (successCount === 0 && errors.length > 0) {
      return NextResponse.json({
        error: "All rows failed to import",
        successCount: 0,
        failedCount: errors.length,
        errors: errors.slice(0, 10)
      }, { status: 400 });
    }

    return NextResponse.json({
      message: "Import completed",
      successCount,
      skippedCount,
      errorCount,
      totalRows: rows.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : []
    });

  } catch (error: any) {
    console.error("❌ Import Error:", error);
    return NextResponse.json({
      error: error.message || "Internal Server Error",
      details: error.toString()
    }, { status: 500 });
  }
}
