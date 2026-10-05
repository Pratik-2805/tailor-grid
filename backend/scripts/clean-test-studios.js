#!/usr/bin/env node
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { prisma } = require('../lib/prisma');

async function cleanTestStudios() {
  console.log('🧹 Cleaning up 500 test Maharashtra studios (ID starting with test-mh-studio-)...');

  // Also remove any test orders attached to these test studios
  const deletedOrders = await prisma.order.deleteMany({
    where: {
      OR: [
        { storeId: { startsWith: 'test-mh-studio-' } },
        { id: { startsWith: 'LOAD-' } },
      ],
    },
  });
  console.log(`✅ Deleted ${deletedOrders.count} test order(s).`);

  const deletedStores = await prisma.partnerStore.deleteMany({
    where: {
      id: { startsWith: 'test-mh-studio-' },
    },
  });
  console.log(`✅ Deleted ${deletedStores.count} test studio(s).`);

  const remaining = await prisma.partnerStore.count();
  console.log(`✨ Remaining real studios in database: ${remaining}`);
}

cleanTestStudios()
  .catch((err) => {
    console.error('❌ Error cleaning test studios:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
