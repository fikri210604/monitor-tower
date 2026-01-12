const { PrismaClient } = require('./app/generated/prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUsers() {
    console.log('\n📋 Checking all users in database...\n');

    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            name: true,
            role: true,
            password: true
        }
    });

    if (users.length === 0) {
        console.log('❌ No users found in database!');
        console.log('💡 Run: npx prisma db seed');
        return;
    }

    console.log(`✅ Found ${users.length} user(s):\n`);

    for (const user of users) {
        console.log(`═══════════════════════════════════════`);
        console.log(`👤 User: ${user.username}`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Role: ${user.role}`);

        // Test common passwords
        const testPasswords = ['master123', 'admin123', 'operator123', user.username + '123'];

        for (const testPass of testPasswords) {
            const isValid = await bcrypt.compare(testPass, user.password);
            if (isValid) {
                console.log(`   ✅ Password: ${testPass}`);
                break;
            }
        }
    }

    console.log(`═══════════════════════════════════════\n`);
    console.log('💡 Try these credentials:');
    console.log('   Username: master   | Password: master123');
    console.log('   Username: admin    | Password: admin123');
    console.log('   Username: operator | Password: operator123');
}

checkUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
