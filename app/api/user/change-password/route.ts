import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id;

        if (!userId) {
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
            where: { id: userId },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        let isPasswordValid = false;
        if (user.password.startsWith("$2a$") || user.password.startsWith("$2b$") || user.password.startsWith("$2y$")) {
            isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        } else {
            const { decrypt } = await import("@/lib/crypto");
            try {
                isPasswordValid = decrypt(user.password) === currentPassword;
            } catch {
                isPasswordValid = false;
            }
        }

        if (!isPasswordValid) {
            return NextResponse.json(
                { error: "Password lama salah" },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
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
