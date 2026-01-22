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
                fotoAset: {
                    take: 1,
                    select: { url: true }
                }
            },
            // Order by ID is faster than CreatedAt for large datasets if order doesn't strictly matter for markers
            orderBy: { id: "asc" },
        });

        // Optimize Serialization: Avoid JSON.parse(JSON.stringify)
        // Manually map to plain objects and handle BigInt if necessary (though none of the selected fields seem to be BigInt except maybe ID?)
        // If ID is BigInt, we convert it.
        const serializedMarkers = markers.map(m => ({
            id: m.id,
            kodeSap: Number(m.kodeSap), // Convert BigInt to Number
            koordinatX: m.koordinatX,
            koordinatY: m.koordinatY,
            jenisBangunan: m.jenisBangunan,
            permasalahanAset: m.permasalahanAset, // 'CLEAN_AND_CLEAR', etc.
            deskripsi: m.deskripsi,
            alamat: m.alamat,
            nomorSertifikat: m.nomorSertifikat,
            tahunPerolehan: m.tahunPerolehan,
            luasTanah: m.luasTanah,
            fotoAset: m.fotoAset,
            // Pre-compute handy flags for frontend
            hasCertificate: !!(m.nomorSertifikat && m.nomorSertifikat !== "-" && m.nomorSertifikat !== "")
        }));

        return NextResponse.json(serializedMarkers, {
            headers: {
                // Cache for 1 minute to reduce DB load on frequent map refreshes
                'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
            }
        });
    } catch (error) {
        console.error("GET Markers Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
