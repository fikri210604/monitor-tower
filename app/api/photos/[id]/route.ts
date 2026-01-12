import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== "MASTER" && role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    try {
        await prisma.fotoAset.delete({
            where: { id }
        });

        return NextResponse.json({ message: "Photo deleted" });
    } catch (error) {
        console.error("Error deleting photo:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
