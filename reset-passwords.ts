import { PrismaClient } from './src/generated/client';
import { Role } from './src/generated/enums';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const users = [
  { name: 'Master Account',    username: 'master',   password: 'master123',   role: Role.MASTER },
  { name: 'Admin Pusat',       username: 'admin',    password: 'admin123',    role: Role.ADMIN },
  { name: 'Operator Wilayah',  username: 'operator', password: 'operator123', role: Role.OPERATOR },
];

async function main() {
  console.log('🔑 Memulai reset password...\n');

  for (const user of users) {
    const hashed = await bcrypt.hash(user.password, 10);

    const result = await prisma.user.upsert({
      where: { username: user.username },
      update: { password: hashed, name: user.name, role: user.role },
      create: { name: user.name, username: user.username, password: hashed, role: user.role },
    });

    console.log(`✅ [${result.role.padEnd(10)}]  username: ${result.username.padEnd(12)}  password: ${user.password}`);
  }

  console.log('\n✔️  Semua akun berhasil di-reset!');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error('❌ Error:', e); await prisma.$disconnect(); process.exit(1); });
