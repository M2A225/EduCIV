const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
require('dotenv/config');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.$connect();
  console.log('connected');
  const users = await prisma.user.findMany({ where: { school_id: { not: null } } });
  console.log('users found: ' + users.length);
  for (const u of users) {
    await prisma.userSchool.upsert({
      where: { user_id_school_id: { user_id: u.id, school_id: u.school_id } },
      update: { role: u.role },
      create: { user_id: u.id, school_id: u.school_id, role: u.role },
    });
  }
  console.log('Populated ' + users.length + ' UserSchool records');
  await prisma.$disconnect();
  await pool.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });