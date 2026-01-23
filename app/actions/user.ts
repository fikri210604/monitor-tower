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
        // AES Verify
        try {
            const decrypted = decrypt(user.password);
            return password === decrypted;
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
    });

    if (!user) {
        throw new Error("User not found");
    }

    // Decrypt password if possible
    const { isBcryptHash, decrypt } = await import("@/lib/crypto");
    let passwordDisplay = user.password;
    let isEncrypted = true;

    try {
        if (isBcryptHash(user.password)) {
            isEncrypted = false; // Legacy mode (cannot view)
        } else {
            passwordDisplay = decrypt(user.password);
        }
    } catch (e) {
        console.error("Decryption failed", e);
        passwordDisplay = "Error Decrypting";
    }

    // Return extended user object
    return {
        ...user,
        password: passwordDisplay,
        isEncrypted, // Flag to tell frontend if it's a real password or just a hash
    };
}
