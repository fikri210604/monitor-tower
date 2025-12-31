import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const assets = await prisma.asetTower.findMany({
      include: {
        fotoAset: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const serializedAssets = JSON.parse(JSON.stringify(assets, (key, value) =>
      typeof value === 'bigint'
        ? value.toString()
        : value
    ));

    return NextResponse.json(serializedAssets);
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

  // Check role - only Super Admin can create assets
  if ((session.user as any).role !== "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Only Super Admin can create assets" },
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
        fotoAset: body.fotoAset
          ? {
            create: body.fotoAset.map((url: string) => ({
              url,
              keterangan: null,
            })),
          }
          : undefined,
      },
      include: {
        fotoAset: true,
      },
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
