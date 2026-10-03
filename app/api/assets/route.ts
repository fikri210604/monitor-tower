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
    const requestedPage = Number.parseInt(searchParams.get('page') || '1', 10);
    const requestedLimit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(1, requestedLimit), 100) : 50;
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause for search (only search string fields)
    const whereClause = search ? {
      OR: [
        { deskripsi: { contains: search, mode: 'insensitive' as const } },
        { alamat: { contains: search, mode: 'insensitive' as const } },
        { desa: { contains: search, mode: 'insensitive' as const } },
        { kodeSap: !isNaN(Number(search)) ? parseInt(search) : undefined }, // Enable searching by SAP
      ]
    } : {};

    const role = (session.user as any).role;
    const photoFilter = role === 'OPERATOR'
      ? { OR: [{ kategori: { not: 'ASET' } }, { kategori: null }] }
      : undefined;

    // Fetch only fields used by the table and the photo metadata it displays.
    const [assets, totalCount] = await Promise.all([
      prisma.asetTower.findMany({
        where: whereClause,
        select: {
          id: true,
          kodeSap: true,
          kodeUnit: true,
          deskripsi: true,
          luasTanah: true,
          tahunPerolehan: true,
          alamat: true,
          desa: true,
          kecamatan: true,
          kabupaten: true,
          provinsi: true,
          koordinatX: true,
          koordinatY: true,
          jenisDokumen: true,
          nomorSertifikat: true,
          linkSertifikat: true,
          tanggalAwalSertifikat: true,
          tanggalAkhirSertifikat: true,
          penguasaanTanah: true,
          jenisBangunan: true,
          permasalahanAset: true,
          createdAt: true,
          updatedAt: true,
          fotoAset: {
            where: photoFilter,
            select: { id: true, url: true, kategori: true, deskripsi: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.asetTower.count({ where: whereClause }),
    ]);

    // Optimized Mapping without double serialization
    const serializedAssets = assets.map((asset: any) => {
      let maskedNomorSertifikat = asset.nomorSertifikat;
      let maskedLinkSertifikat = asset.linkSertifikat;

      if (role === 'OPERATOR') {
        maskedNomorSertifikat = null; // Mask sensitive data
        maskedLinkSertifikat = null; // Mask sensitive data
      }

      // Return plain object directly, converting BigInt to Number for JSON serialization
      return {
        ...asset,
        kodeSap: Number(asset.kodeSap), // Convert BigInt to Number
        nomorSertifikat: maskedNomorSertifikat,
        linkSertifikat: maskedLinkSertifikat
      };
    });

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
      return NextResponse.json({ error: "Nomor SAP already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
