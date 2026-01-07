import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Password validation helper
 */
function validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
        return { valid: false, message: "Password minimal 8 karakter" };
    }

    const hasNumber = /\d/.test(password);
    if (!hasNumber) {
        return { valid: false, message: "Password harus mengandung minimal 1 angka" };
    }

    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    if (!hasSymbol) {
        return { valid: false, message: "Password harus mengandung minimal 1 simbol (!@#$%^&* dll)" };
    }

    return { valid: true };
}

/**
 * GET /api/users/[id]
 * Get single user by ID (Super Admin only)
 */
export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if ((session.user as any).role !== "MASTER") {
            return NextResponse.json(
                { error: "Forbidden: Only Master can access user management" },
                { status: 403 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                name: true,
                username: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching user:", error);
        return NextResponse.json(
            { error: "Failed to fetch user" },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/users/[id]
 * Update user (Super Admin only)
 */
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if ((session.user as any).role !== "MASTER") {
            return NextResponse.json(
                { error: "Forbidden: Only Master can update users" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { name, username, password, role } = body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: params.id },
        });

        if (!existingUser) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // If username is being changed, check if new username is already taken
        if (username && username !== existingUser.username) {
            const usernameTaken = await prisma.user.findUnique({
                where: { username },
            });

            if (usernameTaken) {
                return NextResponse.json(
                    { error: "Username sudah digunakan" },
                    { status: 400 }
                );
            }
        }

        // Prepare update data
        const updateData: any = {};

        if (name) updateData.name = name;
        if (username) updateData.username = username;
        if (role) updateData.role = role;

        // If password is provided, validate and hash it
        if (password) {
            const passwordValidation = validatePassword(password);
            if (!passwordValidation.valid) {
                return NextResponse.json(
                    { error: passwordValidation.message },
                    { status: 400 }
                );
            }

            updateData.password = await bcrypt.hash(password, 10);
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: updateData,
            select: {
                id: true,
                name: true,
                username: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
            { error: "Failed to update user" },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/users/[id]
 * Delete user (Super Admin only)
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if ((session.user as any).role !== "MASTER") {
            return NextResponse.json(
                { error: "Forbidden: Only Master can delete users" },
                { status: 403 }
            );
        }

        // Prevent deleting own account
        if ((session.user as any).id === params.id) {
            return NextResponse.json(
                { error: "Tidak dapat menghapus akun sendiri" },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: params.id },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Delete user
        await prisma.user.delete({
            where: { id: params.id },
        });

        return NextResponse.json({ message: "User berhasil dihapus" });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json(
            { error: "Failed to delete user" },
            { status: 500 }
        );
    }
}
