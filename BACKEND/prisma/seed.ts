import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import "dotenv/config";

const prisma = new PrismaClient({});

async function main() {
  const email = 'admin@educiv.com';
  const password = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password,
      school_id: 'SYSTEM_ADMIN', // Identifiant spécial pour le super admin
    },
  });

  console.log('Super Admin created:', admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
