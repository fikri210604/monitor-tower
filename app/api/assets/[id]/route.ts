import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Helper for BigInt serialization
const json = (param: any, status = 200) => {
    const serialized = JSON.stringify(param, (key, value) =>
        typeof value === "bigint" ? value.toString() : value
    );
    return new NextResponse(serialized, {
        status,
        headers: { "Content-Type": "application/json" },
    });
};

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    try {
        const asset = await prisma.asetTower.findUnique({
            where: { id },
            include: {
                fotoAset: true,
            },
        });

        if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

        return json(asset);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check role - only Super Admin can update assets
    if ((session.user as any).role !== "SUPER_ADMIN") {
        return NextResponse.json(
            { error: "Forbidden: Only Super Admin can update assets" },
            { status: 403 }
        );
    }

    const { id } = await params;
    const body = await req.json();

    try {
        const updatedAsset = await prisma.asetTower.update({
            where: { id },
            data: {
                kodeSap: body.kodeSap ? parseInt(body.kodeSap) : undefined,
                kodeUnit: body.kodeUnit ? parseInt(body.kodeUnit) : undefined,
                deskripsi: body.deskripsi,
                luasTanah: body.luasTanah ? parseFloat(body.luasTanah) : null,
                tahunPerolehan: body.tahunPerolehan ? parseInt(body.tahunPerolehan) : null,

                alamat: body.alamat,
                desa: body.desa,
                kecamatan: body.kecamatan,
                kabupaten: body.kabupaten,
                provinsi: body.provinsi,
                koordinatX: Number(body.koordinatX),
                koordinatY: Number(body.koordinatY),

                jenisDokumen: body.jenisDokumen,
                nomorSertifikat: body.nomorSertifikat,
                linkSertifikat: body.linkSertifikat,
                tanggalAwalSertifikat: body.tanggalAwalSertifikat ? new Date(body.tanggalAwalSertifikat) : null,
                tanggalAkhirSertifikat: body.tanggalAkhirSertifikat ? new Date(body.tanggalAkhirSertifikat) : null,

                penguasaanTanah: body.penguasaanTanah,
                jenisBangunan: body.jenisBangunan,
                permasalahanAset: body.permasalahanAset,
            },
            include: {
                fotoAset: true
            }
        });

        // Update Photos separately if needed or handle via separate endpoint, 
        // but for now assume metadata update is primary here.
        // If photos are sent, we can handle them similarly to POST or separate route.

        return json(updatedAsset);
    } catch (error) {
        console.error("Update Error:", error);
        return NextResponse.json({ error: "Failed to update asset" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check role - only Super Admin can delete assets
    if ((session.user as any).role !== "SUPER_ADMIN") {
        return NextResponse.json(
            { error: "Forbidden: Only Super Admin can delete assets" },
            { status: 403 }
        );
    }

    const { id } = await params;

    try {
        await prisma.asetTower.delete({
            where: { id },
        });

        return NextResponse.json({ message: "Asset deleted successfully" });
    } catch (error) {
        console.error("Delete Error:", error);
        return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
    }
}
