import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    // Allow Operator to upload? Maybe yes for documentation. 
    // Usually only Master/Admin can edit, but Operators might need to upload evidence.
    // Let's restrict to Master/Admin for consistency with other Edit ops, or allow all authenticated users?
    // Based on `canEdit` variable in page.tsx, it seems only Master/Admin can edit.
    if (role !== "MASTER" && role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
    const { url, deskripsi } = await req.json();

    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
        const newPhoto = await prisma.fotoAset.create({
            data: {
                url,
                deskripsi: deskripsi || "Foto Aset",
                asetTowerId: id,
                kategori: "DOKUMENTASI" // Default category
            }
        });

        return NextResponse.json(newPhoto);
    } catch (error) {
        console.error("Error adding photo:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
