import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import "dotenv/config";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const existingSchool = await prisma.school.findFirst();
  if (!existingSchool) {
    console.log('No school found. Skipping seed users creation.');
  } else {
    const schoolId = existingSchool.id;

    const adminEmail = 'admin@educiv.com';
    const adminPassword = await bcrypt.hash('Admin123!', 10);
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {},
      create: {
        email: adminEmail,
        password: adminPassword,
        name: 'Super Admin',
        role: 'BACKOFFICE',
        school_id: schoolId,
      },
    });
    await prisma.userSchool.upsert({
      where: { user_id_school_id_role: { user_id: admin.id, school_id: schoolId, role: 'BACKOFFICE' } },
      create: { user_id: admin.id, school_id: schoolId, role: 'BACKOFFICE', scope: 'SCHOOL' },
      update: {},
    });
    console.log('Super Admin created:', admin.email);

    const tcEmail = 'teacher-cashier@educiv.com';
    const tcPassword = await bcrypt.hash('TeacherCashier123!', 10);
    const teacherCashier = await prisma.user.upsert({
      where: { email: tcEmail },
      update: {},
      create: {
        email: tcEmail,
        password: tcPassword,
        name: 'M. Koné (Enseignant/Caissier)',
        role: 'TEACHER',
        school_id: schoolId,
      },
    });
    for (const role of ['TEACHER', 'CASHIER'] as const) {
      await prisma.userSchool.upsert({
        where: { user_id_school_id_role: { user_id: teacherCashier.id, school_id: schoolId, role } },
        create: { user_id: teacherCashier.id, school_id: schoolId, role, scope: 'SCHOOL' },
        update: {},
      });
    }
    console.log('Multi-role user created:', teacherCashier.email, '(TEACHER + CASHIER)');

    const dtEmail = 'director-teacher@educiv.com';
    const dtPassword = await bcrypt.hash('DirectorTeacher123!', 10);
    const directorTeacher = await prisma.user.upsert({
      where: { email: dtEmail },
      update: {},
      create: {
        email: dtEmail,
        password: dtPassword,
        name: 'Mme Diallo (Directrice/Enseignante)',
        role: 'DIRECTOR',
        school_id: schoolId,
      },
    });
    for (const role of ['DIRECTOR', 'TEACHER'] as const) {
      await prisma.userSchool.upsert({
        where: { user_id_school_id_role: { user_id: directorTeacher.id, school_id: schoolId, role } },
        create: { user_id: directorTeacher.id, school_id: schoolId, role, scope: 'SCHOOL' },
        update: {},
      });
    }
    console.log('Multi-role user created:', directorTeacher.email, '(DIRECTOR + TEACHER)');
  }

  const progressionOptions = [
    { from_class_level: '6ème', from_section: null, to_class_level: '5ème', to_section: null },
    { from_class_level: '5ème', from_section: null, to_class_level: '4ème', to_section: null },
    { from_class_level: '4ème', from_section: null, to_class_level: '3ème', to_section: null },
    { from_class_level: 'Seconde', from_section: 'A1', to_class_level: 'Première', to_section: 'A1' },
    { from_class_level: 'Seconde', from_section: 'A1', to_class_level: 'Première', to_section: 'A2' },
    { from_class_level: 'Seconde', from_section: 'A2', to_class_level: 'Première', to_section: 'A2' },
    { from_class_level: 'Seconde', from_section: 'C', to_class_level: 'Première', to_section: 'C' },
    { from_class_level: 'Seconde', from_section: 'C', to_class_level: 'Première', to_section: 'A1' },
    { from_class_level: 'Seconde', from_section: 'C', to_class_level: 'Première', to_section: 'A2' },
    { from_class_level: 'Seconde', from_section: 'C', to_class_level: 'Première', to_section: 'D' },
    { from_class_level: 'Première', from_section: 'A1', to_class_level: 'Terminale', to_section: 'A1' },
    { from_class_level: 'Première', from_section: 'A1', to_class_level: 'Terminale', to_section: 'A2' },
    { from_class_level: 'Première', from_section: 'A2', to_class_level: 'Terminale', to_section: 'A2' },
    { from_class_level: 'Première', from_section: 'C', to_class_level: 'Terminale', to_section: 'C' },
    { from_class_level: 'Première', from_section: 'C', to_class_level: 'Terminale', to_section: 'A1' },
    { from_class_level: 'Première', from_section: 'C', to_class_level: 'Terminale', to_section: 'A2' },
    { from_class_level: 'Première', from_section: 'C', to_class_level: 'Terminale', to_section: 'D' },
    { from_class_level: 'Première', from_section: 'D', to_class_level: 'Terminale', to_section: 'A1' },
    { from_class_level: 'Première', from_section: 'D', to_class_level: 'Terminale', to_section: 'A2' },
    { from_class_level: 'Première', from_section: 'D', to_class_level: 'Terminale', to_section: 'D' },
    { from_class_level: '2nde T1', from_section: null, to_class_level: '1ère', to_section: 'F1' },
    { from_class_level: '2nde T1', from_section: null, to_class_level: '1ère', to_section: 'F2' },
    { from_class_level: '2nde T1', from_section: null, to_class_level: '1ère', to_section: 'F3' },
    { from_class_level: '2nde T1', from_section: null, to_class_level: '1ère', to_section: 'F4' },
    { from_class_level: '2nde T1', from_section: null, to_class_level: '1ère', to_section: 'STIDD' },
    { from_class_level: '2nde T2', from_section: null, to_class_level: '1ère', to_section: 'STEG' },
    { from_class_level: '2nde T2', from_section: null, to_class_level: '1ère', to_section: 'G1' },
    { from_class_level: '2nde T2', from_section: null, to_class_level: '1ère', to_section: 'G2' },
    { from_class_level: '2nde T2', from_section: null, to_class_level: '1ère', to_section: 'G3' },
    { from_class_level: '1ère', from_section: 'F1', to_class_level: 'Terminale', to_section: 'F1' },
    { from_class_level: '1ère', from_section: 'F2', to_class_level: 'Terminale', to_section: 'F2' },
    { from_class_level: '1ère', from_section: 'F3', to_class_level: 'Terminale', to_section: 'F3' },
    { from_class_level: '1ère', from_section: 'F4', to_class_level: 'Terminale', to_section: 'F4' },
    { from_class_level: '1ère', from_section: 'STIDD', to_class_level: 'Terminale', to_section: 'STIDD' },
    { from_class_level: '1ère', from_section: 'STEG', to_class_level: 'Terminale', to_section: 'STEG' },
    { from_class_level: '1ère', from_section: 'G1', to_class_level: 'Terminale', to_section: 'G1' },
    { from_class_level: '1ère', from_section: 'G2', to_class_level: 'Terminale', to_section: 'G2' },
    { from_class_level: '1ère', from_section: 'G3', to_class_level: 'Terminale', to_section: 'G3' },
  ];

  const existing = await prisma.classProgressionOption.count();
  if (existing === 0) {
    await prisma.classProgressionOption.createMany({ data: progressionOptions });
    console.log(`Seeded ${progressionOptions.length} progression options`);
  } else {
    console.log(`Progression options already seeded (${existing} records found)`);
  }
  console.log(`Seeded ${progressionOptions.length} progression options`);

  // Seed cities and communes
  const existingCities = await prisma.city.count();
  if (existingCities === 0) {
    const cities = [
      { name: 'Abengourou' },
      { name: 'Abidjan' },
      { name: 'Agboville' },
      { name: 'Bondoukou' },
      { name: 'Bouaflé' },
      { name: 'Bouaké' },
      { name: 'Daloa' },
      { name: 'Daoukro' },
      { name: 'Dimbokro' },
      { name: 'Divo' },
      { name: 'Ferkessédougou' },
      { name: 'Gagnoa' },
      { name: 'Grand-Bassam' },
      { name: 'Korhogo' },
      { name: 'Man' },
      { name: 'Odienné' },
      { name: 'San-Pédro' },
      { name: 'Sassandra' },
      { name: 'Séguéla' },
      { name: 'Soubré' },
      { name: 'Yamoussoukro' },
    ];

    for (const city of cities) {
      await prisma.city.create({ data: city });
    }

    // Seed communes for Abidjan (id=2)
    const abidjan = await prisma.city.findUnique({ where: { name: 'Abidjan' } });
    if (abidjan) {
      const communes = [
        'Abobo', 'Adjamé', 'Attécoubé', 'Cocody', 'Koumassi',
        'Marcory', 'Plateau', 'Port-Bouët', 'Treichville', 'Yopougon',
        'Anyama', 'Songon', 'Bingerville',
      ];
      for (const name of communes) {
        await prisma.commune.create({ data: { name, city_id: abidjan.id } });
      }
    }

    console.log('Seeded 21 cities and 13 communes');
  } else {
    console.log(`Cities already seeded (${existingCities} records found)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
