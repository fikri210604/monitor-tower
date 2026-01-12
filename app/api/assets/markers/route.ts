import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

// Lightweight endpoint for map markers - only essential fields
export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const markers = await prisma.asetTower.findMany({
            select: {
                id: true,
                kodeSap: true,
                koordinatX: true,
                koordinatY: true,
                jenisBangunan: true,
                permasalahanAset: true,
                deskripsi: true,
                alamat: true,
                nomorSertifikat: true,
                tahunPerolehan: true,
                luasTanah: true,
                // Include minimal photo data (just first photo for preview)
                fotoAset: {
                    take: 1,
                    select: {
                        id: true,
                        url: true,
                    }
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const serializedMarkers = JSON.parse(JSON.stringify(markers, (key, value) =>
            typeof value === 'bigint'
                ? value.toString()
                : value
        ));

        return NextResponse.json(serializedMarkers);
    } catch (error) {
        console.error("GET Markers Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
