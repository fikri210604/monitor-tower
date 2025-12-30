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

    console.log("📥 Received import request with", data?.length || 0, "rows");

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    if (data.length === 0) {
      return NextResponse.json({ error: "No data to import" }, { status: 400 });
    }

    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let errors: Array<{ row: number, kodeSap?: any, reason: string }> = [];

    for (let i = 0; i < data.length; i++) {
      const item = data[i];
      const rowNumber = i + 1;

      try {
        // ============================================
        // DEFAULT VALUES & AUTO-GENERATION
        // ============================================

        // Auto-generate kodeSap if missing (use row number + base value)
        if (!item.kodeSap) {
          item.kodeSap = 10000 + rowNumber;
          console.log(`📝 Auto-generated kodeSap for row ${rowNumber}: ${item.kodeSap}`);
        }

        // Set default enum values if missing or invalid
        if (!item.jenisBangunan) {
          item.jenisBangunan = "TAPAK_TOWER";
          console.log(`📝 Using default jenisBangunan for row ${rowNumber}: TAPAK_TOWER`);
        }

        if (!item.penguasaanTanah) {
          item.penguasaanTanah = "DIKUASAI";
          console.log(`📝 Using default penguasaanTanah for row ${rowNumber}: DIKUASAI`);
        }

        if (!item.permasalahanAset) {
          item.permasalahanAset = "CLEAN_AND_CLEAR";
          console.log(`📝 Using default permasalahanAset for row ${rowNumber}: CLEAN_AND_CLEAR`);
        }

        // ============================================
        // REQUIRED FIELDS VALIDATION (Only coordinates!)
        // ============================================
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

        // ============================================
        // ENUM VALIDATION & AUTO-CORRECTION
        // ============================================
        const validJenisBangunan = ["GARDU_INDUK", "TAPAK_TOWER"];
        const validPenguasaanTanah = ["DIKUASAI", "TIDAK_DIKUASAI"];
        const validPermasalahanAset = ["CLEAN_AND_CLEAR", "TUMPAK_TINDIH"];

        // Auto-correct invalid enum values instead of rejecting
        if (!validJenisBangunan.includes(item.jenisBangunan)) {
          console.warn(`⚠️  Row ${rowNumber}: Invalid jenisBangunan "${item.jenisBangunan}", using default: TAPAK_TOWER`);
          item.jenisBangunan = "TAPAK_TOWER";
        }

        if (!validPenguasaanTanah.includes(item.penguasaanTanah)) {
          console.warn(`⚠️  Row ${rowNumber}: Invalid penguasaanTanah "${item.penguasaanTanah}", using default: DIKUASAI`);
          item.penguasaanTanah = "DIKUASAI";
        }

        if (!validPermasalahanAset.includes(item.permasalahanAset)) {
          console.warn(`⚠️  Row ${rowNumber}: Invalid permasalahanAset "${item.permasalahanAset}", using default: CLEAN_AND_CLEAR`);
          item.permasalahanAset = "CLEAN_AND_CLEAR";
        }

        console.log(`✅ Row ${rowNumber} (KodeSap: ${item.kodeSap}): Valid, attempting to save...`);

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

            // Enum sudah divalidasi di atas
            penguasaanTanah: item.penguasaanTanah,
            jenisBangunan: item.jenisBangunan,
            permasalahanAset: item.permasalahanAset,
          }
        });

        console.log(`✅ Row ${rowNumber} (KodeSap: ${item.kodeSap}): Successfully saved!`);
        successCount++;
      } catch (error: any) {
        errorCount++;
        const reason = error.message || "Database error";
        console.error(`❌ Row ${rowNumber} (KodeSap: ${item.kodeSap || "N/A"}): ${reason}`);
        console.error("Full error:", error);
        errors.push({ row: rowNumber, kodeSap: item.kodeSap, reason });
      }
    }

    console.log(`\n📊 Import Summary: ${successCount} success, ${skippedCount} skipped, ${errorCount} errors\n`);

    // Return appropriate status code
    if (successCount === 0 && errors.length > 0) {
      return NextResponse.json({
        error: "All rows failed to import",
        successCount: 0,
        failedCount: errors.length,
        errors: errors.slice(0, 10) // Limit error details to first 10
      }, { status: 400 });
    }

    return NextResponse.json({
      message: "Import completed",
      successCount,
      skippedCount,
      errorCount,
      totalRows: data.length,
      errors: errors.length > 0 ? errors.slice(0, 10) : [] // Limit to first 10 errors
    });

  } catch (error: any) {
    console.error("❌ Import Error:", error);
    return NextResponse.json({
      error: error.message || "Internal Server Error",
      details: error.toString()
    }, { status: 500 });
  }
}
