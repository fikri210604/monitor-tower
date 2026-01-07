const { PrismaClient } = require('./app/generated/prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const username = 'master';
    const password = 'master123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Creating/Updating Master account: ${username}...`);

    try {
        const user = await prisma.user.upsert({
            where: { username },
            update: {
                role: 'MASTER',
                password: hashedPassword,
            },
            create: {
                username,
                name: 'Master Account',
                password: hashedPassword,
                role: 'MASTER',
            },
        });

        console.log(`✅ Success! User '${user.username}' is now a MASTER.`);
        console.log(`🔑 Password: ${password}`);
    } catch (e) {
        console.error("❌ Error creating master account:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
