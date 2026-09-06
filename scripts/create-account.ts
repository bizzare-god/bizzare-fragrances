import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const type = args[0]?.toLowerCase(); // 'admin' or 'buyer'
  const email = args[1]?.toLowerCase();
  const password = args[2] || process.env.ADMIN_BOOTSTRAP_PASSWORD;
  const name = args[3] || (type === 'admin' ? 'Bizzare Admin' : 'Valued Client');

  if (!type || !email || !password || !['admin', 'buyer'].includes(type)) {
    console.log(`
Usage:
  npx tsx scripts/create-account.ts admin <email> [password] [name]
  npx tsx scripts/create-account.ts buyer <email> [password] [name]

Examples:
  ADMIN_BOOTSTRAP_PASSWORD=Password123456 npx tsx scripts/create-account.ts admin admin@bizzare.ng
  npx tsx scripts/create-account.ts admin admin@bizzare.ng Password123456 "Bizzare Boutique"
    `);
    process.exit(1);
  }

  if (password.length < 12) {
    console.error('❌ Password must be at least 12 characters.');
    process.exit(1);
  }

  console.log(`Creating / Updating ${type.toUpperCase()} account for: ${email}...`);

  const passwordHash = await bcrypt.hash(password, 12);
  const targetRole = type === 'admin' ? UserRole.ADMIN : UserRole.BUYER;

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role: targetRole,
      passwordHash,
    },
    create: {
      email,
      name,
      passwordHash,
      role: targetRole,
    },
  });

  console.log(`✅ Success! ${type.toUpperCase()} account is ready.`);
  console.log(`   Email: ${email}`);
  console.log(`   Role:  ${user.role}`);
  console.log(`   Login URL: http://localhost:3000/login`);
  console.log(`   Dashboard: http://localhost:3000/${type === 'admin' ? 'admin' : 'shop'}\n`);
}

main()
  .catch((e) => {
    console.error('❌ Error creating account:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
