import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Password validation helper
 * Password must contain:
 * - Minimum 8 characters
 * - At least 1 number
 * - At least 1 symbol/special character
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
 * GET /api/users
 * Fetch all users (Super Admin only)
 */
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check authentication
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check role - only Master can access
        if ((session.user as any).role !== "MASTER") {
            return NextResponse.json(
                { error: "Forbidden: Only Master can access user management" },
                { status: 403 }
            );
        }

        // Fetch all users without password field
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                username: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}

/**
 * POST /api/users
 * Create new user (Super Admin only)
 */
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        // Check authentication
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check role - only Master can create users
        if ((session.user as any).role !== "MASTER") {
            return NextResponse.json(
                { error: "Forbidden: Only Master can create users" },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { name, username, password, role } = body;

        // Validation
        if (!name || !username || !password) {
            return NextResponse.json(
                { error: "Name, username, dan password wajib diisi" },
                { status: 400 }
            );
        }

        // Validate password strength
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return NextResponse.json(
                { error: passwordValidation.message },
                { status: 400 }
            );
        }

        // Check if username already exists
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "Username sudah digunakan" },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name,
                username,
                password: hashedPassword,
                role: role || "OPERATOR", // default to OPERATOR if not specified
            },
            select: {
                id: true,
                name: true,
                username: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json(
            { error: "Failed to create user" },
            { status: 500 }
        );
    }
}
