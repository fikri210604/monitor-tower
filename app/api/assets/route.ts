import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Extract query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 10000); // Max 10000
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause for search (only search string fields)
    const whereClause = search ? {
      OR: [
        { deskripsi: { contains: search, mode: 'insensitive' as const } },
        { alamat: { contains: search, mode: 'insensitive' as const } },
        { desa: { contains: search, mode: 'insensitive' as const } },
      ]
    } : {};

    // Fetch paginated assets and total count in parallel
    const [assets, totalCount] = await Promise.all([
      prisma.asetTower.findMany({
        where: whereClause,
        include: {
          fotoAset: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.asetTower.count({ where: whereClause }),
    ]);

    // Check role and filter photos
    const role = (session.user as any).role;

    const processedAssets = assets.map((asset: any) => {
      // If OPERATOR, filter out 'ASET' photos
      // We keep 'DOKUMENTASI' and others (like null/undefined if we want to be permissive, 
      // but based on plan we ONLY show DOKUMENTASI if we want strictness. 
      // Plan: "If OPERATOR, filter the fotoAset array to exclude kategori === 'ASET'"

      let visiblePhotos = asset.fotoAset;
      let maskedNomorSertifikat = asset.nomorSertifikat;
      let maskedLinkSertifikat = asset.linkSertifikat;

      if (role === 'OPERATOR') {
        visiblePhotos = asset.fotoAset.filter((f: any) => f.kategori !== 'ASET' && f.kategori !== null);
        maskedNomorSertifikat = null; // Mask sensitive data
        maskedLinkSertifikat = null; // Mask sensitive data
      }

      return {
        ...asset,
        fotoAset: visiblePhotos,
        nomorSertifikat: maskedNomorSertifikat,
        linkSertifikat: maskedLinkSertifikat
      };
    });

    const serializedAssets = JSON.parse(JSON.stringify(processedAssets, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value
    ));

    return NextResponse.json({
      data: serializedAssets,
      meta: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    });
  } catch (error) {
    console.error("GET Assets Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check role - MASTER and ADMIN can create assets
  const role = (session.user as any).role;
  if (role !== "MASTER" && role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Only Master and Admin can create assets" },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();

    // Helper: Normalize decimal separator and convert to number
    const normalizeDecimal = (value: any): number | null => {
      if (value === null || value === undefined || value === "") return null;

      const raw = String(value).trim();
      if (!raw || ["-", "N/A", "NULL"].includes(raw.toUpperCase())) return null;

      // If already a number, return it
      if (typeof value === "number") return value;

      // Convert string: remove spaces, replace comma with dot
      const strValue = String(value).trim().replace(/,/g, ".");
      const parsed = parseFloat(strValue);

      return isNaN(parsed) ? null : parsed;
    };

    const newAsset = await prisma.asetTower.create({
      data: {
        kodeSap: typeof body.kodeSap === "string" ? parseInt(body.kodeSap, 10) : (body.kodeSap || 10100),
        kodeUnit: typeof body.kodeUnit === "string" ? parseInt(body.kodeUnit, 10) : (body.kodeUnit || 3215),
        deskripsi: body.deskripsi || null,
        luasTanah: normalizeDecimal(body.luasTanah),
        tahunPerolehan: body.tahunPerolehan ? parseInt(String(body.tahunPerolehan), 10) : null,
        alamat: body.alamat || null,
        desa: body.desa || null,
        kecamatan: body.kecamatan || null,
        kabupaten: body.kabupaten || null,
        provinsi: body.provinsi || null,
        koordinatX: normalizeDecimal(body.koordinatX) as number,
        koordinatY: normalizeDecimal(body.koordinatY) as number,
        jenisDokumen: body.jenisDokumen || null,
        nomorSertifikat: body.nomorSertifikat || null,
        linkSertifikat: body.linkSertifikat || null,
        tanggalAwalSertifikat: body.tanggalAwalSertifikat ? new Date(body.tanggalAwalSertifikat) : null,
        tanggalAkhirSertifikat: body.tanggalAkhirSertifikat ? new Date(body.tanggalAkhirSertifikat) : null,
        penguasaanTanah: body.penguasaanTanah,
        jenisBangunan: body.jenisBangunan,
        permasalahanAset: body.permasalahanAset,
        fotoAset: body.fotoUrl
          ? {
            create: [
              {
                url: body.fotoUrl,
                deskripsi: "Foto Aset",
                kategori: "ASET" // Explicitly categorize
              }
            ]
          }
          : undefined,
      },
      include: {
        fotoAset: true,
      },
    });

    // Handle Documentation Photo if exists
    if (body.fotoDokumentasiUrl) {
      await prisma.fotoAset.create({
        data: {
          url: body.fotoDokumentasiUrl,
          deskripsi: "Foto Dokumentasi",
          kategori: "DOKUMENTASI",
          asetTowerId: newAsset.id
        }
      });
    }

    await logActivity((session.user as any).id, "CREATE_ASSET", {
      sap: newAsset.kodeSap,
      deskripsi: newAsset.deskripsi
    });

    const serializedAsset = JSON.parse(JSON.stringify(newAsset, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value
    ));

    return NextResponse.json(serializedAsset, { status: 201 });
  } catch (error: any) {
    console.error("POST Asset Error:", error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: "Kode SAP already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
