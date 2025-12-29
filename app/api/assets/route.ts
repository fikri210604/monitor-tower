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

  try {
    const body = await req.json();

    // Basic validation
    if (!body.koordinatX || !body.koordinatY) {
      return NextResponse.json({ error: "Koordinat X dan Y wajib diisi" }, { status: 400 });
    }

    const newAsset = await prisma.asetTower.create({
      data: {
        kodeSap: body.kodeSap,
        kodeUnit: body.kodeUnit,
        deskripsi: body.deskripsi,
        luasTanah: body.luasTanah ? parseFloat(body.luasTanah) : null,
        tahunPerolehan: body.tahunPerolehan ? parseInt(body.tahunPerolehan) : null,

        // Location
        alamat: body.alamat,
        desa: body.desa,
        kecamatan: body.kecamatan,
        kabupaten: body.kabupaten,
        provinsi: body.provinsi,
        koordinatX: Number(body.koordinatX),
        koordinatY: Number(body.koordinatY),

        // Legal
        jenisDokumen: body.jenisDokumen,
        nomorSertifikat: body.nomorSertifikat,
        linkSertifikat: body.linkSertifikat,
        tanggalAwalSertifikat: body.tanggalAwalSertifikat ? new Date(body.tanggalAwalSertifikat) : null,
        tanggalAkhirSertifikat: body.tanggalAkhirSertifikat ? new Date(body.tanggalAkhirSertifikat) : null,

        // Physical & Issues
        penguasaanTanah: body.penguasaanTanah,
        jenisBangunan: body.jenisBangunan,
        permasalahanAset: body.permasalahanAset,

        // Foto Relation
        fotoAset: {
          create: [
            ...(body.fotoUrl ? [{ url: body.fotoUrl, kategori: "TAMPAK DEPAN", deskripsi: "Foto Aset Utama" }] : []),
          ]
        }
      },
      include: {
        fotoAset: true
      }
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
