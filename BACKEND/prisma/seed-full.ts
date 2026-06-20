import { PrismaClient, UserRole, Sexe, UserSchoolScope } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import "dotenv/config";

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL || '';
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const SCHOOL_ID = 2;
const PASSWORD = '123456';

async function main() {
  console.log('=== FULL SEED START ===');

  // 1. SchoolYear
  let year = await prisma.schoolYear.findFirst({ where: { school_id: SCHOOL_ID, year_range: '2025-2026' } });
  if (!year) {
    year = await prisma.schoolYear.create({ data: { year_range: '2025-2026', school_id: SCHOOL_ID } });
    console.log('Created SchoolYear:', year.id);
  } else {
    console.log('SchoolYear exists:', year.id);
  }

  // 2. Link periods to school year
  const periods = await prisma.academicPeriod.findMany({ where: { school_id: SCHOOL_ID } });
  for (const p of periods) {
    if (!p.school_year_id) {
      await prisma.academicPeriod.update({ where: { id: p.id }, data: { school_year_id: year.id } });
      console.log('Linked period', p.id, 'to year', year.id);
    }
  }

  const hash = await bcrypt.hash(PASSWORD, 10);

  // 3. Users
  interface UserSeed { email: string; name: string; role: string; phone?: string; }
  const staffUsers: UserSeed[] = [
    { email: 'director@school.com', name: 'M. Kouamé Directeur', role: 'DIRECTOR' },
    { email: 'accountant@school.com', name: 'Mme. Koné Comptable', role: 'ACCOUNTANT' },
    { email: 'cashier@school.com', name: 'M. Traoré Caissier', role: 'CASHIER' },
  ];
  const teacherUsers: UserSeed[] = [
    { email: 'teacher1@school.com', name: 'M. N\'Guessan', role: 'TEACHER' },
    { email: 'teacher2@school.com', name: 'Mme. Bamba', role: 'TEACHER' },
    { email: 'teacher3@school.com', name: 'M. Konaté', role: 'TEACHER' },
    { email: 'teacher4@school.com', name: 'Mme. Touré', role: 'TEACHER' },
    { email: 'teacher5@school.com', name: 'M. Coulibaly', role: 'TEACHER' },
    { email: 'teacher6@school.com', name: 'Mme. Diarra', role: 'TEACHER' },
    { email: 'teacher7@school.com', name: 'M. Soro', role: 'TEACHER' },
  ];
  const parentUsers: UserSeed[] = [
    { email: 'parent1@school.com', name: 'Mme. Mambo Parent', phone: '0101010101', role: 'PARENT' },
    { email: 'parent2@school.com', name: 'M. Yao Parent', phone: '0101010102', role: 'PARENT' },
    { email: 'parent3@school.com', name: 'Mme. Koffi Parent', phone: '0101010103', role: 'PARENT' },
    { email: 'parent4@school.com', name: 'M. Diallo Parent', phone: '0101010104', role: 'PARENT' },
  ];
  const allUsers = [...staffUsers, ...teacherUsers, ...parentUsers];
  const createdUsers: Record<string, number> = {};
  for (const u of allUsers) {
    const existing = await prisma.user.findFirst({ where: { email: u.email } });
    if (existing) {
      createdUsers[u.email] = existing.id;
      console.log('User exists:', u.email, 'id:', existing.id);
    } else {
      const user = await prisma.user.create({
        data: { email: u.email, name: u.name, password: hash, phone: u.phone, role: u.role as UserRole, school_id: SCHOOL_ID },
      });
      await prisma.userSchool.create({
        data: { user_id: user.id, school_id: SCHOOL_ID, role: u.role as UserRole, scope: 'PRIMARY' as UserSchoolScope },
      });
      createdUsers[u.email] = user.id;
      console.log('Created user:', u.email, 'id:', user.id, 'role:', u.role);
    }
  }

  // 4. Teachers table (for teacher users only)
  const teacherData = [
    { name: 'M. N\'Guessan', email: 'teacher1@school.com', specialty: 'Mathématiques' },
    { name: 'Mme. Bamba', email: 'teacher2@school.com', specialty: 'Français' },
    { name: 'M. Konaté', email: 'teacher3@school.com', specialty: 'Anglais' },
    { name: 'Mme. Touré', email: 'teacher4@school.com', specialty: 'Histoire-Géographie' },
    { name: 'M. Coulibaly', email: 'teacher5@school.com', specialty: 'Sciences' },
    { name: 'Mme. Diarra', email: 'teacher6@school.com', specialty: 'Éducation Physique' },
    { name: 'M. Soro', email: 'teacher7@school.com', specialty: 'Arts Plastiques' },
  ];
  const createdTeachers: Record<string, number> = {};
  for (const t of teacherData) {
    let teacher = await prisma.teacher.findFirst({ where: { email: t.email, school_id: SCHOOL_ID } });
    if (!teacher) {
      teacher = await prisma.teacher.create({ data: { name: t.name, email: t.email, specialty: t.specialty, school_id: SCHOOL_ID } });
      console.log('Created teacher:', t.name, 'id:', teacher.id);
    } else {
      console.log('Teacher exists:', t.name, 'id:', teacher.id);
    }
    createdTeachers[t.email] = teacher.id;
  }

  // 5. Students
  const classIds = [8, 9, 10, 11, 12, 13]; // 6A,6B,5A,5B,4A,3A
  const studentNames = [
    { name: 'Kouassi Olivier', sexe: 'M', classIdx: 0 },
    { name: 'Koffi Awa', sexe: 'F', classIdx: 0 },
    { name: 'N\'Guessan Yann', sexe: 'M', classIdx: 0 },
    { name: 'Koné Fatoumata', sexe: 'F', classIdx: 0 },
    { name: 'Traoré Moussa', sexe: 'M', classIdx: 0 },
    { name: 'Bamba Inès', sexe: 'F', classIdx: 1 },
    { name: 'Coulibaly Adama', sexe: 'M', classIdx: 1 },
    { name: 'Diarra Mariam', sexe: 'F', classIdx: 1 },
    { name: 'Soro Ibrahim', sexe: 'M', classIdx: 1 },
    { name: 'Yao Amoin', sexe: 'F', classIdx: 1 },
    { name: 'Konaté Issa', sexe: 'M', classIdx: 2 },
    { name: 'Ouattara Salimata', sexe: 'F', classIdx: 2 },
    { name: 'Tuho Fidèle', sexe: 'M', classIdx: 2 },
    { name: 'Gnahoré Ruth', sexe: 'F', classIdx: 2 },
    { name: 'Béhibro Yves', sexe: 'M', classIdx: 2 },
    { name: 'Kouakou Kévin', sexe: 'M', classIdx: 3 },
    { name: 'Affoué Prisca', sexe: 'F', classIdx: 3 },
    { name: 'Ahoussi Joel', sexe: 'M', classIdx: 3 },
    { name: 'Kra Estelle', sexe: 'F', classIdx: 3 },
    { name: 'Tanoh Arnaud', sexe: 'M', classIdx: 3 },
    { name: 'Soumahoro Lamine', sexe: 'M', classIdx: 4 },
    { name: 'Bohoussou Sarah', sexe: 'F', classIdx: 4 },
    { name: 'Zadi Pacôme', sexe: 'M', classIdx: 4 },
    { name: 'N\'dri Honorine', sexe: 'F', classIdx: 4 },
    { name: 'Kouamé Serge', sexe: 'M', classIdx: 4 },
    { name: 'Ekra Martine', sexe: 'F', classIdx: 5 },
    { name: 'Dagrou Jean', sexe: 'M', classIdx: 5 },
    { name: 'Loba Christiane', sexe: 'F', classIdx: 5 },
    { name: 'Aka Landry', sexe: 'M', classIdx: 5 },
    { name: 'Yoboué Nadège', sexe: 'F', classIdx: 5 },
  ];
  const createdStudents: { id: number; name: string; class_id: number }[] = [];
  for (const s of studentNames) {
    let student = await prisma.student.findFirst({ where: { name: s.name, school_id: SCHOOL_ID } });
    if (!student) {
      student = await prisma.student.create({
        data: { name: s.name, sexe: s.sexe as Sexe, class_id: classIds[s.classIdx], school_id: SCHOOL_ID, is_repeater: false, is_internal: true, is_affected: true },
      });
      console.log('Created student:', s.name, 'in class', classIds[s.classIdx]);
    }
    createdStudents.push({ id: student.id, name: student.name, class_id: classIds[s.classIdx] });
  }

  // 6. TeacherSubject assignments (each teacher teaches their specialty to some classes)
  const subjects = await prisma.subject.findMany({ where: { school_id: SCHOOL_ID } });
  const subjectMap: Record<string, number> = {};
  for (const sub of subjects) {
    const key = sub.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (key.includes('mathematique')) subjectMap['math'] = sub.id;
    else if (key.includes('francais')) subjectMap['francais'] = sub.id;
    else if (key.includes('anglais')) subjectMap['anglais'] = sub.id;
    else if (key.includes('histoire') || key.includes('geographie')) subjectMap['hg'] = sub.id;
    else if (key.includes('science')) subjectMap['sciences'] = sub.id;
    else if (key.includes('physique') || key.includes('eps')) subjectMap['eps'] = sub.id;
    else if (key.includes('art')) subjectMap['arts'] = sub.id;
  }
  const assignments: { teacherEmail: string; classIds: number[]; subjectKey: string }[] = [
    { teacherEmail: 'teacher1@school.com', classIds: [8, 9, 10, 11, 12, 13], subjectKey: 'math' },
    { teacherEmail: 'teacher2@school.com', classIds: [8, 9, 10, 11, 12, 13], subjectKey: 'francais' },
    { teacherEmail: 'teacher3@school.com', classIds: [8, 9, 10, 11, 12, 13], subjectKey: 'anglais' },
    { teacherEmail: 'teacher4@school.com', classIds: [10, 11, 12, 13], subjectKey: 'hg' },
    { teacherEmail: 'teacher5@school.com', classIds: [8, 9, 10, 11, 12, 13], subjectKey: 'sciences' },
    { teacherEmail: 'teacher6@school.com', classIds: [8, 9, 10, 11, 12, 13], subjectKey: 'eps' },
    { teacherEmail: 'teacher7@school.com', classIds: [8, 9, 10, 11], subjectKey: 'arts' },
  ];
  for (const a of assignments) {
    const teacherId = createdTeachers[a.teacherEmail];
    const subjectId = subjectMap[a.subjectKey];
    if (!teacherId || !subjectId) { console.log('Skipping assignment:', a.teacherEmail, a.subjectKey); continue; }
    for (const cid of a.classIds) {
      const existing = await prisma.teacherSubject.findFirst({
        where: { teacher_id: teacherId, subject_id: subjectId, class_id: cid, school_id: SCHOOL_ID },
      });
      if (!existing) {
        await prisma.teacherSubject.create({
          data: { teacher_id: teacherId, subject_id: subjectId, class_id: cid, school_id: SCHOOL_ID },
        });
      }
    }
  }
  console.log('TeacherSubject assignments done');

  // 7. Grades (notes) - batch insert for speed
  const gradeTypes = ['INTERROGATION', 'DEVOIR', 'EXAMEN'] as const;
  const periodsList = await prisma.academicPeriod.findMany({ where: { school_id: SCHOOL_ID, school_year_id: year.id } });
  const existingGrades = await prisma.grade.findMany({ where: { school_id: SCHOOL_ID }, select: { student_id: true, subject_id: true, period_id: true } });
  const gradeKeySet = new Set(existingGrades.map(g => `${g.student_id}-${g.subject_id}-${g.period_id}`));
  const gradeBatch: any[] = [];
  for (const student of createdStudents) {
    for (const a of assignments) {
      const subjectId = subjectMap[a.subjectKey];
      if (!subjectId || !a.classIds.includes(student.class_id)) continue;
      for (const period of periodsList) {
        const key = `${student.id}-${subjectId}-${period.id}`;
        if (!gradeKeySet.has(key)) {
          gradeBatch.push({
            student_id: student.id,
            subject_id: subjectId,
            period_id: period.id,
            value: Math.floor(Math.random() * 11) + 10,
            type: gradeTypes[Math.floor(Math.random() * gradeTypes.length)],
            status: 'VALIDE',
            school_id: SCHOOL_ID,
          });
        }
      }
    }
  }
  if (gradeBatch.length > 0) {
    for (let i = 0; i < gradeBatch.length; i += 100) {
      await prisma.grade.createMany({ data: gradeBatch.slice(i, i + 100) });
    }
  }
  console.log('Grades created:', gradeBatch.length);

  // 8. Attendance
  const attendanceStatuses = ['PRESENT', 'ABSENT', 'LATE'] as const;
  const existingAttSessions = await prisma.attendanceSession.findMany({ where: { school_id: SCHOOL_ID }, select: { id: true, class_id: true } });
  const existingAttMap = new Map<number, number[]>();
  for (const s of existingAttSessions) {
    if (!existingAttMap.has(s.class_id)) existingAttMap.set(s.class_id, []);
    existingAttMap.get(s.class_id)!.push(s.id);
  }
  // Create missing attendance sessions (1 per class)
  for (const cid of [...new Set(createdStudents.map(s => s.class_id))]) {
    if (!existingAttMap.has(cid) || existingAttMap.get(cid)!.length === 0) {
      for (let i = 0; i < 3; i++) {
        const date = new Date(2025, 9, 15 + i);
        const session = await prisma.attendanceSession.create({
          data: {
            class_id: cid,
            subject_id: subjectMap['math'] || 9,
            timetable_id: 1,
            teacher_id: createdTeachers['teacher1@school.com'],
            date,
            school_id: SCHOOL_ID,
          },
        });
        if (!existingAttMap.has(cid)) existingAttMap.set(cid, []);
        existingAttMap.get(cid)!.push(session.id);
      }
    }
  }
  // Create attendance records in batch
  const existingAttRecs = await prisma.attendance.findMany({ where: { school_id: SCHOOL_ID }, select: { student_id: true, session_id: true } });
  const attKeySet = new Set(existingAttRecs.map(a => `${a.student_id}-${a.session_id}`));
  const attBatch: any[] = [];
  for (const student of createdStudents) {
    const sessionIds = existingAttMap.get(student.class_id) || [];
    for (const sid of sessionIds) {
      const key = `${student.id}-${sid}`;
      if (!attKeySet.has(key)) {
        attBatch.push({
          session_id: sid,
          student_id: student.id,
          status: attendanceStatuses[Math.floor(Math.random() * attendanceStatuses.length)],
          school_id: SCHOOL_ID,
        });
      }
    }
  }
  if (attBatch.length > 0) {
    for (let i = 0; i < attBatch.length; i += 100) {
      await prisma.attendance.createMany({ data: attBatch.slice(i, i + 100) });
    }
  }
  console.log('Attendance created:', attBatch.length);

  // 9. Parent links
  const parentStudentMapping = [
    { parentEmail: 'parent1@school.com', studentName: 'Kouassi Olivier', relation: 'Mère' },
    { parentEmail: 'parent1@school.com', studentName: 'Koffi Awa', relation: 'Mère' },
    { parentEmail: 'parent2@school.com', studentName: 'N\'Guessan Yann', relation: 'Père' },
    { parentEmail: 'parent2@school.com', studentName: 'Koné Fatoumata', relation: 'Père' },
    { parentEmail: 'parent3@school.com', studentName: 'Traoré Moussa', relation: 'Mère' },
    { parentEmail: 'parent3@school.com', studentName: 'Bamba Inès', relation: 'Mère' },
    { parentEmail: 'parent4@school.com', studentName: 'Coulibaly Adama', relation: 'Père' },
    { parentEmail: 'parent4@school.com', studentName: 'Diarra Mariam', relation: 'Père' },
  ];
  for (const psm of parentStudentMapping) {
    const parentUserId = createdUsers[psm.parentEmail];
    const studentObj = createdStudents.find(s => s.name === psm.studentName);
    if (parentUserId && studentObj) {
      const existing = await prisma.studentParent.findFirst({
        where: { parent_user_id: parentUserId, student_id: studentObj.id },
      });
      if (!existing) {
        await prisma.studentParent.create({
          data: { parent_user_id: parentUserId, student_id: studentObj.id, relation: psm.relation, school_id: SCHOOL_ID },
        });
        console.log('Linked parent', psm.parentEmail, 'to student', psm.studentName);
      }
    }
  }

  // 10. Payment plans + payments
  const planNames = ['Scolarité Annuelle', 'Cantine', 'Transport'];
  const planAmounts = [150000, 50000, 30000];
  for (let i = 0; i < planNames.length; i++) {
    const existingPlan = await prisma.paymentPlan.findFirst({ where: { name: planNames[i], school_id: SCHOOL_ID } });
    if (!existingPlan) {
      await prisma.paymentPlan.create({
        data: { name: planNames[i], total_amount: planAmounts[i], school_id: SCHOOL_ID },
      });
      console.log('Created payment plan:', planNames[i]);
    }
  }
  const plans = await prisma.paymentPlan.findMany({ where: { school_id: SCHOOL_ID } });
  // Create payments for some students
  for (let i = 0; i < Math.min(15, createdStudents.length); i++) {
    const student = createdStudents[i];
    const existingPayment = await prisma.payment.findFirst({ where: { student_id: student.id } });
    if (!existingPayment) {
      const plan = plans[i % plans.length];
      await prisma.payment.create({
        data: {
          student_id: student.id,
          payment_type: 'SCOLARITE',
          amount_fcfa: Math.floor(plan.total_amount / 2),
          payment_date: new Date(2025, 9, 5 + i).toISOString(),
          receipt_number: `REC-2025-${String(1000 + i).padStart(4, '0')}`,
          status: 'VALIDE',
          plan_id: plan.id,
          school_id: SCHOOL_ID,
        },
      });
      console.log('Created payment for student', student.name);
    }
  }

  // 11. Student user accounts (for student login)
  const studentLoginMapping = [
    { studentName: 'Kouassi Olivier', email: 'student1@school.com' },
    { studentName: 'Koffi Awa', email: 'student2@school.com' },
    { studentName: 'N\'Guessan Yann', email: 'student3@school.com' },
  ];
  for (const slm of studentLoginMapping) {
    const existingUser = await prisma.user.findFirst({ where: { email: slm.email } });
    if (!existingUser) {
      const studentObj = createdStudents.find(s => s.name === slm.studentName);
      const user = await prisma.user.create({
        data: { email: slm.email, name: slm.studentName, password: hash, role: 'STUDENT', school_id: SCHOOL_ID },
      });
      await prisma.userSchool.create({
        data: { user_id: user.id, school_id: SCHOOL_ID, role: 'STUDENT', scope: 'PRIMARY' },
      });
      if (studentObj) {
        await prisma.student.update({ where: { id: studentObj.id }, data: { user_id: user.id } });
      }
      console.log('Created student user:', slm.email);
    }
  }

  // 12. User-school assignments for BACKOFFICE role
  const boUser = await prisma.user.findFirst({ where: { email: 'admin@educiv.com' } });
  if (boUser) {
    const existing = await prisma.userSchool.findFirst({ where: { user_id: boUser.id, school_id: SCHOOL_ID } });
    if (!existing) {
      await prisma.userSchool.create({
        data: { user_id: boUser.id, school_id: SCHOOL_ID, role: 'BACKOFFICE', scope: 'PRIMARY' },
      });
    }
  }

  console.log('=== SEED COMPLETE ===');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
