#!/usr/bin/env node
require('dotenv').config();
const readline = require('readline');
const { prisma } = require('../lib/prisma');
const { hashPassword } = require('../lib/password');

function createPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return {
    ask: (q) => new Promise((resolve) => rl.question(q, resolve)),
    close: () => rl.close(),
  };
}

async function main() {
  const args = process.argv.slice(2);
  let emailInput = args[0];
  let passwordInput = args[1];
  let nameInput = args[2];

  console.log('\n========================================================');
  console.log('⚡ TAILORGRID SUPER ADMIN CREATOR ⚡');
  console.log('========================================================');

  // If arguments were not passed via CLI, prompt interactively in the terminal
  if (!emailInput || !passwordInput) {
    const prompt = createPrompt();
    try {
      if (!emailInput) {
        emailInput = await prompt.ask('👉 Enter Super Admin ID / Email: ');
      }
      while (!emailInput || !emailInput.trim()) {
        console.log('⚠️ ID / Email cannot be empty.');
        emailInput = await prompt.ask('👉 Enter Super Admin ID / Email: ');
      }

      if (!passwordInput) {
        passwordInput = await prompt.ask('🔑 Enter Super Admin Password (min 6 chars): ');
      }
      while (!passwordInput || passwordInput.trim().length < 6) {
        console.log('⚠️ Password must be at least 6 characters long.');
        passwordInput = await prompt.ask('🔑 Enter Super Admin Password: ');
      }

      if (!nameInput) {
        nameInput = await prompt.ask('👤 Enter Admin Name (optional, press Enter for default): ');
      }
    } finally {
      prompt.close();
    }
  }

  const cleanEmail = emailInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();
  const cleanName = (nameInput && nameInput.trim()) || 'Master Super Admin';

  const hashedPassword = hashPassword(cleanPassword);

  // Check if user already exists with this email or contact or ID
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: cleanEmail },
        { contact: cleanEmail },
        { id: cleanEmail },
      ],
    },
  });

  let adminUser;
  if (existingUser) {
    adminUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: cleanName,
        role: 'ADMIN',
        status: 'ACTIVE',
        password: hashedPassword,
        method: 'email',
      },
    });
    console.log(`\n✅ Updated account "${cleanEmail}" with your new Super Admin password!`);
  } else {
    const adminId = `admin_${Date.now()}_${Math.floor(100 + Math.random() * 900)}`;
    adminUser = await prisma.user.create({
      data: {
        id: adminId,
        name: cleanName,
        email: cleanEmail,
        contact: cleanEmail,
        role: 'ADMIN',
        status: 'ACTIVE',
        password: hashedPassword,
        method: 'email',
      },
    });
    console.log(`\n🎉 Created new Super Admin account: "${cleanEmail}"!`);
  }

  console.log('--------------------------------------------------------');
  console.log('🔑 SUPER ADMIN CREDENTIALS CONFIGURED:');
  console.log(`   ID / Email : ${adminUser.email}`);
  console.log(`   Password   : ${cleanPassword}`);
  console.log(`   Role       : ${adminUser.role}`);
  console.log(`   Status     : ${adminUser.status}`);
  const adminBaseUrl = process.env.ADMIN_URL || (process.env.ADMIN_PORT ? `http://localhost:${process.env.ADMIN_PORT}` : 'http://localhost:3002');
  console.log(`👉 Login now at: ${adminBaseUrl}/admin`);
  console.log('========================================================\n');
}

main()
  .catch((err) => {
    console.error('❌ Failed to create super admin:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
