import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

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

        // Check role and filter photos
        const role = (session.user as any).role;
        let visiblePhotos = asset.fotoAset;
        let maskedNomorSertifikat = asset.nomorSertifikat;
        let maskedLinkSertifikat = asset.linkSertifikat;

        if (role === 'OPERATOR') {
            visiblePhotos = asset.fotoAset.filter((f: any) => f.kategori !== 'ASET' && f.kategori !== null);
            maskedNomorSertifikat = null;
            maskedLinkSertifikat = null;
        }

        const filteredAsset = {
            ...asset,
            fotoAset: visiblePhotos,
            nomorSertifikat: maskedNomorSertifikat,
            linkSertifikat: maskedLinkSertifikat
        };

        return json(filteredAsset);
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

    // Check role - MASTER and ADMIN can update assets
    const role = (session.user as any).role;
    if (role !== "MASTER" && role !== "ADMIN") {
        return NextResponse.json(
            { error: "Forbidden: Only Master and Admin can update assets" },
            { status: 403 }
        );
    }

    const { id } = await params;
    const body = await req.json();

    try {
        // ... existing update code ...
        const updatedAsset = await prisma.asetTower.update({
            where: { id },
            // ...
            data: {
                // ... (retaining all existing data fields logic from original file)
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

                fotoAset: {
                    deleteMany: {
                        OR: [
                            ...(body.fotoUrl ? [{ kategori: 'ASET' }] : []),
                            ...(body.fotoUrl ? [{ kategori: null }] : []),
                            ...(body.fotoDokumentasiUrl ? [{ kategori: 'DOKUMENTASI' }] : [])
                        ]
                    },
                    create: [
                        ...(body.fotoUrl ? [{
                            url: body.fotoUrl,
                            deskripsi: "Foto Aset",
                            kategori: "ASET"
                        }] : []),
                        ...(body.fotoDokumentasiUrl ? [{
                            url: body.fotoDokumentasiUrl,
                            deskripsi: "Foto Dokumentasi",
                            kategori: "DOKUMENTASI"
                        }] : [])
                    ]
                }
            },
            include: {
                fotoAset: true
            }
        });

        await logActivity((session.user as any).id, "UPDATE_ASSET", {
            sap: updatedAsset.kodeSap,
            id: updatedAsset.id,
            deskripsi: updatedAsset.deskripsi
        });

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

    // Check role - MASTER and ADMIN can delete assets
    const role = (session.user as any).role;
    if (role !== "MASTER" && role !== "ADMIN") {
        return NextResponse.json(
            { error: "Forbidden: Only Master and Admin can delete assets" },
            { status: 403 }
        );
    }

    const { id } = await params;

    try {
        const asset = await prisma.asetTower.delete({
            where: { id },
        });

        await logActivity((session.user as any).id, "DELETE_ASSET", {
            sap: asset.kodeSap,
            deskripsi: asset.deskripsi
        });

        return NextResponse.json({ message: "Asset deleted successfully" });
    } catch (error) {
        console.error("Delete Error:", error);
        return NextResponse.json({ error: "Failed to delete asset" }, { status: 500 });
    }
}
