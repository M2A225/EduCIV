import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import "dotenv/config";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const schools = await prisma.school.findMany({ select: { id: true, name: true, school_type: true } });
  const classes = await prisma.class.findMany({ select: { id: true, name: true, level: true } });
  const subjects = await prisma.subject.findMany({ select: { id: true, name: true } });
  const teachers = await prisma.teacher.findMany({ select: { id: true, name: true } });
  const students = await prisma.student.findMany({ select: { id: true, name: true, class_id: true } });
  const users = await prisma.user.findMany({ select: { id: true, email: true, role: true } });
  const years = await prisma.schoolYear.findMany({ select: { id: true, year_range: true } });
  const periods = await prisma.academicPeriod.findMany({ select: { id: true, name: true } });
  console.log('Schools:', schools.length);
  console.log('Classes:', classes.length);
  console.log('Subjects:', subjects.length);
  console.log('Teachers:', teachers.length);
  console.log('Students:', students.length);
  console.log('Users:', users.length);
  console.log('SchoolYears:', years.length);
  console.log('Periods:', periods.length);
  if (schools.length > 0) {
    console.log('--- School 1 info ---');
    console.log(JSON.stringify(schools[0]));
    const s = schools[0];
    console.log('School classes:', classes.filter(c => c.level).map(c => c.level + ' - ' + c.name).join(', '));
  }
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
