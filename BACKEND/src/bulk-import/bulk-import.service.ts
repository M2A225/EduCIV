import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { InvitationsService } from '../invitations/invitations.service';
import * as ExcelJS from 'exceljs';
import * as crypto from 'crypto';

export interface ImportResult {
  imported: number;
  errors: { row: number; message: string }[];
  invitations: { type: string; nom: string; token?: string; lien?: string }[];
}

interface StudentRow {
  nom: string;
  matricule: string | null;
  date_naissance: string | null;
  lieu_naissance: string | null;
  sexe: string | null;
  nationalite: string | null;
  redoublant: string | null;
  regime: string | null;
  interne: string | null;
  classe: string | null;
  nom_parent: string | null;
  tel_parent: string | null;
}

interface TeacherRow {
  nom: string;
  email: string | null;
  telephone: string | null;
  grade: string | null;
  specialite: string | null;
  date_embauche: string | null;
  adresse: string | null;
}

interface ParentRow {
  nom: string;
  email: string | null;
  telephone: string | null;
  eleves_matricules: string | null;
}

@Injectable()
export class BulkImportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invitationsService: InvitationsService,
  ) {}

  async generateTemplate(type: string): Promise<ExcelJS.Workbook> {
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Import');

    const columns: { header: string; key: string; width: number }[] = [];

    if (type === 'students') {
      columns.push(
        { header: 'nom', key: 'nom', width: 30 },
        { header: 'matricule', key: 'matricule', width: 20 },
        { header: 'date_naissance', key: 'date_naissance', width: 18 },
        { header: 'lieu_naissance', key: 'lieu_naissance', width: 25 },
        { header: 'sexe', key: 'sexe', width: 8 },
        { header: 'nationalite', key: 'nationalite', width: 20 },
        { header: 'redoublant', key: 'redoublant', width: 12 },
        { header: 'regime', key: 'regime', width: 18 },
        { header: 'interne', key: 'interne', width: 10 },
        { header: 'classe', key: 'classe', width: 20 },
        { header: 'nom_parent', key: 'nom_parent', width: 30 },
        { header: 'tel_parent', key: 'tel_parent', width: 18 },
      );
    } else if (type === 'teachers') {
      columns.push(
        { header: 'nom', key: 'nom', width: 30 },
        { header: 'email', key: 'email', width: 30 },
        { header: 'telephone', key: 'telephone', width: 18 },
        { header: 'grade', key: 'grade', width: 20 },
        { header: 'specialite', key: 'specialite', width: 25 },
        { header: 'date_embauche', key: 'date_embauche', width: 18 },
        { header: 'adresse', key: 'adresse', width: 30 },
      );
    } else if (type === 'parents') {
      columns.push(
        { header: 'nom', key: 'nom', width: 30 },
        { header: 'email', key: 'email', width: 30 },
        { header: 'telephone', key: 'telephone', width: 18 },
        { header: 'eleves_matricules', key: 'eleves_matricules', width: 40 },
      );
    } else {
      throw new BadRequestException(
        `Type invalide: ${type}. Types: students, teachers, parents`,
      );
    }

    ws.columns = columns;

    const headerRow = ws.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' },
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    if (type === 'students') {
      ws.addRow([]);
      ws.addRow([
        '',
        '',
        'ex: 15/09/2010',
        '',
        'M/F',
        '',
        'OUI/NON',
        'Interne/Demi-pension/Externe',
        'OUI/NON',
        'ex: 6ème A',
        '',
        '',
      ]);
      const noteRow = ws.getRow(3);
      noteRow.font = { italic: true, color: { argb: 'FF6B7280' }, size: 10 };
    } else if (type === 'teachers') {
      ws.addRow([]);
      ws.addRow([
        '',
        'ex: jean@mail.com',
        'ex: 0102030405',
        '',
        '',
        'ex: 01/09/2020',
        '',
      ]);
      const noteRow = ws.getRow(3);
      noteRow.font = { italic: true, color: { argb: 'FF6B7280' }, size: 10 };
    } else if (type === 'parents') {
      ws.addRow([]);
      ws.addRow([
        '',
        'ex: parent@mail.com',
        'ex: 0102030405',
        'ex: MAT001,MAT002',
      ]);
      const noteRow = ws.getRow(3);
      noteRow.font = { italic: true, color: { argb: 'FF6B7280' }, size: 10 };
    }

    return wb;
  }

  async importStudents(
    fileBuffer: Uint8Array,
    schoolId: number,
    userId: number,
  ): Promise<ImportResult> {
    const result: ImportResult = { imported: 0, errors: [], invitations: [] };
    const wb = new ExcelJS.Workbook();
    await (wb.xlsx.load as unknown as (data: Uint8Array) => Promise<void>)(fileBuffer);
    const ws = wb.worksheets[0];

    if (!ws) {
      throw new BadRequestException('Fichier Excel vide');
    }

    const rows: StudentRow[] = [];
    ws.eachRow((row: ExcelJS.Row, rowNumber: number) => {
      if (rowNumber === 1) return;
      const raw = row.values;
      const values = Array.isArray(raw) ? raw : [];
      const nom = values[1]?.toString().trim();
      if (!nom) return;
      rows.push({
        nom,
        matricule: values[2]?.toString().trim() || null,
        date_naissance: values[3]?.toString().trim() || null,
        lieu_naissance: values[4]?.toString().trim() || null,
        sexe: values[5]?.toString().trim() || null,
        nationalite: values[6]?.toString().trim() || null,
        redoublant: values[7]?.toString().trim() || null,
        regime: values[8]?.toString().trim() || null,
        interne: values[9]?.toString().trim() || null,
        classe: values[10]?.toString().trim() || null,
        nom_parent: values[11]?.toString().trim() || null,
        tel_parent: values[12]?.toString().trim() || null,
      });
    });

    const classes = await this.prisma.class.findMany({
      where: { school_id: schoolId },
      select: { id: true, name: true },
    });
    const classMap = new Map(classes.map((c) => [c.name.toLowerCase(), c.id]));

    const existingMatricules = new Set<string>();
    const existingMatriculesDb = await this.prisma.student.findMany({
      where: { school_id: schoolId, matricule: { not: null } },
      select: { matricule: true },
    });
    for (const s of existingMatriculesDb) {
      if (s.matricule) existingMatricules.add(s.matricule);
    }

    const parentPhones = [
      ...new Set(rows.filter((r) => r.tel_parent).map((r) => r.tel_parent)),
    ].filter((p): p is string => p !== null);
    const existingParents =
      parentPhones.length > 0
        ? await this.prisma.user.findMany({
            where: { phone: { in: parentPhones } },
            select: { id: true, phone: true },
          })
        : [];
    const parentPhoneMap = new Map(existingParents.map((p) => [p.phone, p.id]));

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        if (!row.classe) {
          result.errors.push({
            row: rowNum,
            message: 'La colonne "classe" est obligatoire',
          });
          continue;
        }
        if (row.nom_parent && !row.tel_parent) {
          result.errors.push({
            row: rowNum,
            message:
              '"tel_parent" est obligatoire si "nom_parent" est renseigné',
          });
          continue;
        }

        const classId = classMap.get(row.classe.toLowerCase());
        if (!classId) {
          result.errors.push({
            row: rowNum,
            message: `Classe "${row.classe}" introuvable`,
          });
          continue;
        }

        if (row.matricule) {
          if (existingMatricules.has(row.matricule)) {
            result.errors.push({
              row: rowNum,
              message: `Matricule "${row.matricule}" existe déjà`,
            });
            continue;
          }
          existingMatricules.add(row.matricule);
        }

        const dob = row.date_naissance
          ? this.parseDate(row.date_naissance)
          : null;

        let newParentId: number | undefined;

        await this.prisma.$transaction(async (tx) => {
          const student = await tx.student.create({
            data: {
              name: row.nom,
              matricule: row.matricule,
              dob,
              place_birth: row.lieu_naissance || null,
              sexe: (row.sexe?.toUpperCase() as 'M' | 'F') || null,
              nationality: row.nationalite || null,
              is_repeater: row.redoublant?.toUpperCase() === 'OUI',
              regime: row.regime || null,
              is_internal: row.interne?.toUpperCase() === 'OUI',
              is_affected: true,
              class_id: classId,
              school_id: schoolId,
            },
          });

          if (row.nom_parent && row.tel_parent) {
            const existingParentId = parentPhoneMap.get(row.tel_parent);
            let parentUserId: number;

            if (existingParentId) {
              parentUserId = existingParentId;
            } else {
              const tempPassword = crypto.randomBytes(16).toString('hex');
              const newParent = await tx.user.create({
                data: {
                  phone: row.tel_parent,
                  password: tempPassword,
                  name: row.nom_parent!,
                  role: 'PARENT',
                },
              });
              parentUserId = newParent.id;
              parentPhoneMap.set(row.tel_parent, parentUserId);

              await tx.userSchool.create({
                data: {
                  user_id: parentUserId,
                  school_id: schoolId,
                  role: 'PARENT',
                  scope: 'SCHOOL',
                },
              });

              newParentId = parentUserId;
            }

            const existingLink = await tx.studentParent.findUnique({
              where: {
                student_id_parent_user_id: {
                  student_id: student.id,
                  parent_user_id: parentUserId,
                },
              },
            });

            if (!existingLink) {
              await tx.studentParent.create({
                data: {
                  student_id: student.id,
                  parent_user_id: parentUserId,
                  school_id: schoolId,
                },
              });
            }
          }
        });

        if (newParentId) {
          const inv = await this.invitationsService.generateTeacherToken(
            newParentId,
            schoolId,
            userId,
          );
          result.invitations.push({
            type: 'PARENT',
            nom: row.nom_parent!,
            token: inv.token,
            lien: inv.registrationLink,
          });
        }

        result.imported++;
      } catch (err: unknown) {
        result.errors.push({
          row: rowNum,
          message: err instanceof Error ? err.message : 'Erreur inconnue',
        });
      }
    }

    return result;
  }

  async importTeachers(
    fileBuffer: Uint8Array,
    schoolId: number,
    userId: number,
  ): Promise<ImportResult> {
    const result: ImportResult = { imported: 0, errors: [], invitations: [] };
    const wb = new ExcelJS.Workbook();
    await (wb.xlsx.load as unknown as (data: Uint8Array) => Promise<void>)(fileBuffer);
    const ws = wb.worksheets[0];

    if (!ws) throw new BadRequestException('Fichier Excel vide');

    const rows: TeacherRow[] = [];
    ws.eachRow((row: ExcelJS.Row, rowNumber: number) => {
      if (rowNumber === 1) return;
      const raw = row.values;
      const values = Array.isArray(raw) ? raw : [];
      const nom = values[1]?.toString().trim();
      if (!nom) return;
      rows.push({
        nom,
        email: values[2]?.toString().trim() || null,
        telephone: values[3]?.toString().trim() || null,
        grade: values[4]?.toString().trim() || null,
        specialite: values[5]?.toString().trim() || null,
        date_embauche: values[6]?.toString().trim() || null,
        adresse: values[7]?.toString().trim() || null,
      });
    });

    const existingEmails = new Set<string>();
    const existingPhones = new Set<string>();
    const existingUsers = await this.prisma.user.findMany({
      where: { OR: [{ email: { not: null } }, { phone: { not: null } }] },
      select: { email: true, phone: true },
    });
    for (const u of existingUsers) {
      if (u.email) existingEmails.add(u.email.toLowerCase());
      if (u.phone) existingPhones.add(u.phone);
    }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        if (!row.email && !row.telephone) {
          result.errors.push({
            row: rowNum,
            message: 'Au moins un des deux (email/telephone) est requis',
          });
          continue;
        }

        if (row.email && existingEmails.has(row.email.toLowerCase())) {
          result.errors.push({
            row: rowNum,
            message: `Email "${row.email}" déjà utilisé`,
          });
          continue;
        }
        if (row.telephone && existingPhones.has(row.telephone)) {
          result.errors.push({
            row: rowNum,
            message: `Téléphone "${row.telephone}" déjà utilisé`,
          });
          continue;
        }

        if (row.email) existingEmails.add(row.email.toLowerCase());
        if (row.telephone) existingPhones.add(row.telephone);

        let teacherId: number;

        await this.prisma.$transaction(async (tx) => {
          const teacher = await tx.teacher.create({
            data: {
              name: row.nom,
              phone: row.telephone,
              email: row.email,
              grade: row.grade,
              specialty: row.specialite,
              hire_date: row.date_embauche
                ? this.parseDate(row.date_embauche)
                : null,
              address: row.adresse,
              school_id: schoolId,
            },
          });

          teacherId = teacher.id;

          const tempPassword = crypto.randomBytes(16).toString('hex');
          const user = await tx.user.create({
            data: {
              email: row.email,
              phone: row.telephone,
              password: tempPassword,
              name: row.nom,
              role: 'TEACHER',
              school_id: schoolId,
            },
          });

          await tx.userSchool.create({
            data: {
              user_id: user.id,
              school_id: schoolId,
              role: 'TEACHER',
              scope: 'SCHOOL',
            },
          });
        });

        const inv = await this.invitationsService.generateTeacherToken(
          teacherId!,
          schoolId,
          userId,
        );

        result.invitations.push({
          type: 'TEACHER',
          nom: row.nom,
          token: inv.token,
          lien: inv.registrationLink,
        });

        result.imported++;
      } catch (err: unknown) {
        result.errors.push({
          row: rowNum,
          message: err instanceof Error ? err.message : 'Erreur inconnue',
        });
      }
    }

    return result;
  }

  async importParents(
    fileBuffer: Uint8Array,
    schoolId: number,
    userId: number,
  ): Promise<ImportResult> {
    const result: ImportResult = { imported: 0, errors: [], invitations: [] };
    const wb = new ExcelJS.Workbook();
    await (wb.xlsx.load as unknown as (data: Uint8Array) => Promise<void>)(fileBuffer);
    const ws = wb.worksheets[0];

    if (!ws) throw new BadRequestException('Fichier Excel vide');

    const rows: ParentRow[] = [];
    ws.eachRow((row: ExcelJS.Row, rowNumber: number) => {
      if (rowNumber === 1) return;
      const raw = row.values;
      const values = Array.isArray(raw) ? raw : [];
      const nom = values[1]?.toString().trim();
      if (!nom) return;
      rows.push({
        nom,
        email: values[2]?.toString().trim() || null,
        telephone: values[3]?.toString().trim() || null,
        eleves_matricules: values[4]?.toString().trim() || null,
      });
    });

    const studentsByMatricule = new Map<string, number>();
    const students = await this.prisma.student.findMany({
      where: { school_id: schoolId, matricule: { not: null } },
      select: { id: true, matricule: true },
    });
    for (const s of students) {
      if (s.matricule) studentsByMatricule.set(s.matricule, s.id);
    }

    const parentEmails = [
      ...new Set(
        rows.filter((r) => r.email).map((r) => r.email!.toLowerCase()),
      ),
    ];
    const parentPhones = [
      ...new Set(rows.filter((r) => r.telephone).map((r) => r.telephone)),
    ].filter((p): p is string => p !== null);
    const existingParents = await this.prisma.user.findMany({
      where: {
        OR: [
          ...(parentEmails.length ? [{ email: { in: parentEmails } }] : []),
          ...(parentPhones.length ? [{ phone: { in: parentPhones } }] : []),
        ],
      },
      select: { id: true, email: true, phone: true },
    });
    const parentByEmail = new Map(
      existingParents
        .filter((p) => p.email)
        .map((p) => [p.email!.toLowerCase(), p.id]),
    );
    const parentByPhone = new Map(
      existingParents.filter((p) => p.phone).map((p) => [p.phone, p.id]),
    );

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        if (!row.email && !row.telephone) {
          result.errors.push({
            row: rowNum,
            message: 'Au moins un des deux (email/telephone) est requis',
          });
          continue;
        }

        if (!row.eleves_matricules) {
          result.errors.push({
            row: rowNum,
            message: 'La colonne "eleves_matricules" est obligatoire',
          });
          continue;
        }

        const matricules = row.eleves_matricules
          .split(',')
          .map((m: string) => m.trim())
          .filter(Boolean);
        const validStudentIds: number[] = [];
        const missingMatricules: string[] = [];

        for (const mat of matricules) {
          const studentId = studentsByMatricule.get(mat);
          if (studentId) {
            validStudentIds.push(studentId);
          } else {
            missingMatricules.push(mat);
          }
        }

        if (missingMatricules.length > 0) {
          result.errors.push({
            row: rowNum,
            message: `Matricules introuvables: ${missingMatricules.join(', ')}`,
          });
        }

        if (validStudentIds.length === 0) continue;

        let parentUserId = row.email
          ? parentByEmail.get(row.email.toLowerCase())
          : row.telephone
            ? parentByPhone.get(row.telephone)
            : undefined;

        let isNewUser = false;

        if (!parentUserId) {
          const tempPassword = crypto.randomBytes(16).toString('hex');

          await this.prisma.$transaction(async (tx) => {
            const parentUser = await tx.user.create({
              data: {
                email: row.email,
                phone: row.telephone,
                password: tempPassword,
                name: row.nom,
                role: 'PARENT',
              },
            });
            parentUserId = parentUser.id;

            await tx.userSchool.create({
              data: {
                user_id: parentUser.id,
                school_id: schoolId,
                role: 'PARENT',
                scope: 'SCHOOL',
              },
            });

            for (const studentId of validStudentIds) {
              const existingLink = await tx.studentParent.findUnique({
                where: {
                  student_id_parent_user_id: {
                    student_id: studentId,
                    parent_user_id: parentUser.id,
                  },
                },
              });

              if (!existingLink) {
                await tx.studentParent.create({
                  data: {
                    student_id: studentId,
                    parent_user_id: parentUser.id,
                    school_id: schoolId,
                  },
                });
              }
            }
          });

          if (row.email)
            parentByEmail.set(row.email.toLowerCase(), parentUserId!);
          if (row.telephone) parentByPhone.set(row.telephone, parentUserId!);

          isNewUser = true;
        } else {
          await this.prisma.$transaction(async (tx) => {
            for (const studentId of validStudentIds) {
              const existingLink = await tx.studentParent.findUnique({
                where: {
                  student_id_parent_user_id: {
                    student_id: studentId,
                    parent_user_id: parentUserId!,
                  },
                },
              });

              if (!existingLink) {
                await tx.studentParent.create({
                  data: {
                    student_id: studentId,
                    parent_user_id: parentUserId!,
                    school_id: schoolId,
                  },
                });
              }
            }
          });
        }

        if (isNewUser) {
          const inv = await this.invitationsService.generateTeacherToken(
            parentUserId!,
            schoolId,
            userId,
          );
          result.invitations.push({
            type: 'PARENT',
            nom: row.nom,
            token: inv.token,
            lien: inv.registrationLink,
          });
        }

        result.imported++;
      } catch (err: unknown) {
        result.errors.push({
          row: rowNum,
          message: err instanceof Error ? err.message : 'Erreur inconnue',
        });
      }
    }

    return result;
  }

  private async linkOrCreateParent(
    studentId: number,
    parentName: string,
    parentEmail: string | null,
    parentPhone: string | null,
    schoolId: number,
    userId: number,
    result: ImportResult,
  ): Promise<void> {
    let parentUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          ...(parentEmail ? [{ email: parentEmail }] : []),
          ...(parentPhone ? [{ phone: parentPhone }] : []),
        ],
      },
    });

    let isNewUser = false;
    if (!parentUser) {
      const tempPassword = crypto.randomBytes(16).toString('hex');
      parentUser = await this.prisma.user.create({
        data: {
          email: parentEmail,
          phone: parentPhone,
          password: tempPassword,
          name: parentName,
          role: 'PARENT',
        },
      });
      isNewUser = true;

      await this.prisma.userSchool.create({
        data: {
          user_id: parentUser.id,
          school_id: schoolId,
          role: 'PARENT',
          scope: 'SCHOOL',
        },
      });
    }

    const existingLink = await this.prisma.studentParent.findUnique({
      where: {
        student_id_parent_user_id: {
          student_id: studentId,
          parent_user_id: parentUser.id,
        },
      },
    });

    if (!existingLink) {
      await this.prisma.studentParent.create({
        data: {
          student_id: studentId,
          parent_user_id: parentUser.id,
          school_id: schoolId,
        },
      });
    }

    if (isNewUser) {
      const inv = await this.invitationsService.generateTeacherToken(
        parentUser.id,
        schoolId,
        userId,
      );
      result.invitations.push({
        type: 'PARENT',
        nom: parentName,
        token: inv.token,
        lien: inv.registrationLink,
      });
    }
  }

  private parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    const parts = dateStr.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const year = parseInt(parts[2], 10);
      if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
        return new Date(year, month, day);
      }
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  }
}
