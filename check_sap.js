const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  const nullCount = await prisma.asetTower.count({ where: { kodeSap: null } });
  const defaultCount = await prisma.asetTower.count({ where: { kodeSap: 10100 } });
  const total = await prisma.asetTower.count();

  console.log(`Total Assets: ${total}`);
  console.log(`Assets with kodeSap = null: ${nullCount}`);
  console.log(`Assets with kodeSap = 10100: ${defaultCount}`);
}

checkData()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
