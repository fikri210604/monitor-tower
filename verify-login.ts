import { PrismaClient } from './app/generated/prisma/client';
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const envPath = path.resolve(process.cwd(), '.env');
let dbUrl = process.env.DATABASE_URL;

if (!dbUrl && fs.existsSync(envPath)) {
    console.log("Reading configuration from .env...");
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(/DATABASE_URL=["']?([^"'\n\r]+)["']?/);
    if (match) {
        dbUrl = match[1];
    }
}

if (!dbUrl) {
    console.error("❌ DATABASE_URL not found.");
    process.exit(1);
}

const prisma = new PrismaClient({
    datasources: { db: { url: dbUrl } }
});

async function main() {
    console.log("Verifying 'master' user...");
    const user = await prisma.user.findUnique({ where: { username: 'master' } });

    if (!user) {
        console.error("❌ User 'master' NOT FOUND in database!");
        return;
    }

    console.log(`✅ User found: id=${user.id}, username=${user.username}, role=${user.role}`);

    const isValid = await bcrypt.compare("master123", user.password);

    if (isValid) {
        console.log("✅ Password 'master123' is CORRECT.");
    } else {
        console.error("❌ Password 'master123' is INCORRECT.");
        console.log("Stored Hash:", user.password);

        // Test hashing
        const testHash = await bcrypt.hash("master123", 10);
        console.log("Test Hash:", testHash);
    }
}

main().finally(() => prisma.$disconnect());
