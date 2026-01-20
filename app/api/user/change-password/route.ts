import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        // Uses username logic if email is not available or mapped to username
        const username = session?.user?.name || (session?.user as any)?.username;

        if (!username) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { currentPassword, newPassword } = await request.json();

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: "Password lama dan baru harus diisi" },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { username: username },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Password lama salah" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { username: username },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ message: "Password berhasil diubah" });

    } catch (error) {
        console.error("Change Password Error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan internal" },
            { status: 500 }
        );
    }
}
