import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { school_id: { not: null } } });
  for (const u of users) {
    const existing = await prisma.userSchool.findFirst({
      where: { user_id: u.id, school_id: u.school_id!, role: u.role },
    });
    if (existing) {
      await prisma.userSchool.update({ where: { id: existing.id }, data: { role: u.role } });
    } else {
      await prisma.userSchool.create({ data: { user_id: u.id, school_id: u.school_id!, role: u.role } });
    }
  }
  console.log('Populated ' + users.length + ' UserSchool records');
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });