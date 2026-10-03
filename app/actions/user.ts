"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function verifyCurrentPassword(password: string) {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }

    const userId = (session.user as any).id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const { isBcryptHash, decrypt } = await import("@/lib/crypto");
    
    if (isBcryptHash(user.password)) {
        return await bcrypt.compare(password, user.password);
    } else {
        try {
            const decrypted = decrypt(user.password);
            const isValid = password === decrypted;
            if (isValid) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { password: await bcrypt.hash(password, 10) },
                });
            }
            return isValid;
        } catch {
            return false;
        }
    }
}

export async function getUserWithSecrets(userId: string) {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user || (session.user as any).role !== "MASTER") {
        throw new Error("Unauthorized");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
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
        throw new Error("User not found");
    }

    return {
        ...user,
        password: null,
        isEncrypted: false,
    };
}
