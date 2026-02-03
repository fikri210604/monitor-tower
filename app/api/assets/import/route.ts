import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check role - Master and Admin can import
  const role = (session.user as any).role;
  if (role !== "MASTER" && role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Only Master and Admin can import assets" },
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
      await logActivity((session.user as any).id, "DELETE_ASSET", {
        action: "DELETE_ALL_BEFORE_IMPORT",
        count: deleteResult.count
      });
    }

    let successCount = 0;
    let errorCount = 0;
    let errors: Array<{ row: number, kodeSap?: any, reason: string }> = [];

    // 1. Fetch all existing IDs for mapping (Performance optimization)
    const existingAssets = await prisma.asetTower.findMany({
      select: { id: true, kodeSap: true }
    });

    // Improved Map: Store ARRAY of IDs for each kodeSap to handle duplicates
    // Map<kodeSap, string[]>
    const existingMap = new Map<number, string[]>();
    existingAssets.forEach((a: any) => {
      if (!existingMap.has(a.kodeSap)) {
        existingMap.set(a.kodeSap, []);
      }
      existingMap.get(a.kodeSap)?.push(a.id);
    });

    const toCreate: any[] = [];
    const toUpdate: any[] = [];

    // 2. Process rows and split into Create vs Update buckets
    for (let i = 0; i < rows.length; i++) {
      const item = rows[i];
      const rowNumber = i + 1;

      try {
        // Auto-generate kodeSap removed. If missing, it should be null.
        // if (!item.kodeSap) { ... }

        // Defaults
        if (!item.jenisBangunan) item.jenisBangunan = "TAPAK_TOWER";
        if (!item.penguasaanTanah) item.penguasaanTanah = "DIKUASAI";
        if (!item.permasalahanAset) item.permasalahanAset = "CLEAN_AND_CLEAR";

        // Coords
        if (item.koordinatX === "" || item.koordinatX == null) item.koordinatX = null;
        if (item.koordinatY === "" || item.koordinatY == null) item.koordinatY = null;

        // Enums
        const validJenisBangunan = ["GARDU_INDUK", "TAPAK_TOWER"];
        const validPenguasaanTanah = ["DIKUASAI", "TIDAK_DIKUASAI"];
        if (!validJenisBangunan.includes(item.jenisBangunan)) item.jenisBangunan = "TAPAK_TOWER";
        if (!validPenguasaanTanah.includes(item.penguasaanTanah)) item.penguasaanTanah = "DIKUASAI";

        // Date Parsing
        const parseExcelDate = (dateVal: any): Date | null => {
          if (!dateVal) return null;
          if (typeof dateVal === 'number') return new Date((dateVal - 25569) * 86400 * 1000);
          const strVal = String(dateVal).trim();
          const ddmmyyyy = strVal.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
          if (ddmmyyyy) {
            const day = parseInt(ddmmyyyy[1], 10);
            const month = parseInt(ddmmyyyy[2], 10) - 1;
            const year = parseInt(ddmmyyyy[3], 10);
            return new Date(year, month, day);
          }
          const isoDate = new Date(strVal);
          return !isNaN(isoDate.getTime()) ? isoDate : null;
        };

        const tanggalAwal = parseExcelDate(item.tanggalAwalSertifikat);
        const tanggalAkhir = parseExcelDate(item.tanggalAkhirSertifikat);

        const assetData = {
          kodeSap: item.kodeSap ? Number(item.kodeSap) : null,
          kodeUnit: item.kodeUnit ? Number(item.kodeUnit) : 3215,
          deskripsi: item.deskripsi || null,
          luasTanah: item.luasTanah ? parseFloat(item.luasTanah) : null,
          tahunPerolehan: item.tahunPerolehan ? parseInt(item.tahunPerolehan) : null,
          alamat: item.alamat || null,
          desa: item.desa || null,
          kecamatan: item.kecamatan || null,
          kabupaten: item.kabupaten || null,
          provinsi: item.provinsi || "LAMPUNG",
          koordinatX: item.koordinatX !== null ? parseFloat(item.koordinatX) : null,
          koordinatY: item.koordinatY !== null ? parseFloat(item.koordinatY) : null,
          jenisDokumen: item.jenisDokumen || null,
          nomorSertifikat: item.nomorSertifikat || null,
          linkSertifikat: item.linkSertifikat || null,
          tanggalAwalSertifikat: tanggalAwal,
          tanggalAkhirSertifikat: tanggalAkhir,
          penguasaanTanah: item.penguasaanTanah,
          jenisBangunan: item.jenisBangunan,
          permasalahanAset: item.permasalahanAset,
        };

        // Smart Matching Logic:
        // Check if there are any available IDs for this kodeSap
        let availableIds: string[] | undefined;
        if (assetData.kodeSap !== null) {
          availableIds = existingMap.get(assetData.kodeSap);
        }

        if (availableIds && availableIds.length > 0) {
          // CONSUME one ID from the queue
          const targetId = availableIds.shift(); // take the first one

          // Prepare update
          toUpdate.push({
            id: targetId,
            data: assetData
          });
        } else {
          // No existing ID matched (or all consumed), so CREATE new
          toCreate.push(assetData);
        }

      } catch (error: any) {
        errorCount++;
        const reason = error.message || "Data preparation error";
        console.error(`❌ Row ${rowNumber}: ${reason}`);
        errors.push({ row: rowNumber, kodeSap: item.kodeSap, reason });
      }
    }

    // 3. Execute Bulk Operations
    console.log(`⚡ Batch Processing: ${toCreate.length} Creates, ${toUpdate.length} Updates`);

    // A. Bulk Create
    if (toCreate.length > 0) {
      const createRes = await prisma.asetTower.createMany({
        data: toCreate,
        skipDuplicates: true // Safety
      });
      console.log(`✅ Created ${createRes.count} new assets`);
      successCount += createRes.count;
    }

    // B. Parallel Updates (Using Promise.all)
    if (toUpdate.length > 0) {
      // Process in chunks of 50 to avoid connection limits
      const chunkSize = 50;
      for (let i = 0; i < toUpdate.length; i += chunkSize) {
        const chunk = toUpdate.slice(i, i + chunkSize);
        await Promise.all(chunk.map(item =>
          prisma.asetTower.update({
            where: { id: item.id },
            data: item.data
          }).catch((e: any) => {
            console.error(`Update failed for ${item.data.kodeSap}:`, e);
            errorCount++;
            errors.push({ row: 0, kodeSap: item.data.kodeSap, reason: "Update Failed" });
          })
        ));
        successCount += chunk.length;
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

    // Log Activity
    if (successCount > 0) {
      await logActivity((session.user as any).id, "IMPORT_EXCEL", {
        action: replaceAll ? "REPLACE_ALL" : "UPDATE_EXISTING",
        success: successCount,
        created: toCreate.length,
        updated: toUpdate.length,
        failed: errorCount,
        totalRows: rows.length
      });
    }

    return NextResponse.json({
      message: "Import completed",
      successCount,
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
