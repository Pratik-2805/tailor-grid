#!/usr/bin/env node
require('dotenv').config();
const { prisma } = require('../lib/prisma');

async function main() {
  console.log('🧹 Cleaning dummy data from TailorGrid database...\n');

  // 1. Remove dummy user(s)
  const dummyUserIds = ['usr_demo_sarah'];
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      OR: [
        { id: { in: dummyUserIds } },
        { email: 'sarah.jenkins@example.com' },
      ],
    },
  });
  console.log(`✅ Removed ${deletedUsers.count} dummy user(s) (Sarah Jenkins / demo).`);

  // 2. Remove dummy stores (international placeholder stores with 0 orders)
  const dummyStoreIds = [
    'atelier-soho',
    'stitch-beverly',
    'the-hem-room',
    'kensington-atelier',
    'atelier-mayfair',
  ];

  // Check if any dummy store has orders first
  for (const sId of dummyStoreIds) {
    const orderCount = await prisma.order.count({ where: { storeId: sId } });
    if (orderCount === 0) {
      await prisma.partnerStore.deleteMany({ where: { id: sId } });
      console.log(`✅ Removed dummy store: ${sId}`);
    } else {
      console.log(`⚠️ Store ${sId} has ${orderCount} active orders, skipping delete.`);
    }
  }

  // 3. Remove any demo orders not belonging to actual users (if any)
  const dummyOrderIds = ['TG-849201', 'TG-392810', 'TG-572194', 'TG-615409'];
  const deletedOrders = await prisma.order.deleteMany({
    where: {
      id: { in: dummyOrderIds },
    },
  });
  if (deletedOrders.count > 0) {
    console.log(`✅ Removed ${deletedOrders.count} legacy dummy order(s).`);
  }

  console.log('\n✨ Database cleanup complete! Only actual users, studios, and orders remain.');

  const remainingUsers = await prisma.user.count();
  const remainingStores = await prisma.partnerStore.count();
  const remainingOrders = await prisma.order.count();
  console.log({
    activeUsers: remainingUsers,
    activeStudios: remainingStores,
    activeOrders: remainingOrders,
  });
}

main()
  .catch((e) => {
    console.error('❌ Error during cleanup:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
