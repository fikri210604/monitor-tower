import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const password = await bcrypt.hash("master123", 10);

        // Upsert Master User
        const user = await prisma.user.upsert({
            where: { username: "master" },
            update: {
                password,
                role: "MASTER"
            },
            create: {
                username: "master",
                name: "Master Account (Fixed)",
                password,
                role: "MASTER"
            }
        });

        // Also fix Admin just in case
        const adminPassword = await bcrypt.hash("admin123", 10);
        const admin = await prisma.user.upsert({
            where: { username: "admin" },
            update: { password: adminPassword, role: "ADMIN" },
            create: { username: "admin", name: "Admin (Fixed)", password: adminPassword, role: "ADMIN" }
        });

        return NextResponse.json({
            success: true,
            message: "Users updated successfully",
            users: [user.username, admin.username],
            info: "Try login with master/master123 or admin/admin123"
        });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 });
    }
}
