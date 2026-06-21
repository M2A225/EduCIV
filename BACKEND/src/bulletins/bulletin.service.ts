import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { StorageService } from '../storage/storage.service';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
import type {
  Student,
  Class,
  School,
  AcademicPeriod,
  ReportCard,
  Grade,
  Subject,
} from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfMake = require('pdfmake/build/pdfmake');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const vfs = require('pdfmake/build/vfs_fonts');
pdfMake.vfs = vfs;
pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf',
  },
};

type StudentWithRelations = Student & { class: Class | null; school: School };
type GradeWithSubject = Grade & { subject: Subject };

@Injectable()
export class BulletinService {
  private readonly logger = new Logger(BulletinService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  async generateBulletin(
    studentId: number,
    periodId: number,
    year: string,
  ): Promise<string> {
    const [student, period] = await Promise.all([
      this.prisma.student.findUnique({
        where: { id: studentId },
        include: { class: true, school: true },
      }),
      this.prisma.academicPeriod.findUnique({ where: { id: periodId } }),
    ]);

    if (!student) throw new NotFoundException('Élève non trouvé');
    if (!period) throw new NotFoundException('Période introuvable');

    const [reportCard, grades] = await Promise.all([
      this.prisma.reportCard.findFirst({
        where: { student_id: studentId, period_id: periodId, year },
      }),
      this.prisma.grade.findMany({
        where: { student_id: studentId, period_id: periodId },
        include: { subject: true },
      }),
    ]);

    if (!reportCard) throw new NotFoundException('Bulletin non encore généré');

    return (
      (await this.generateSingleBulletin(
        student,
        period,
        grades,
        reportCard,
      )) || ''
    );
  }

  async generateBatchBulletins(
    classId: number,
    periodId: number,
    year: string,
  ): Promise<string[]> {
    const students = await this.prisma.student.findMany({
      where: { class_id: classId },
      include: { class: true, school: true },
    });
    if (students.length === 0) return [];

    const studentIds = students.map((s) => s.id);
    const [period, allGrades, allReportCards] = await Promise.all([
      this.prisma.academicPeriod.findUnique({ where: { id: periodId } }),
      this.prisma.grade.findMany({
        where: { student_id: { in: studentIds }, period_id: periodId },
        include: { subject: true },
      }),
      this.prisma.reportCard.findMany({
        where: { student_id: { in: studentIds }, period_id: periodId, year },
      }),
    ]);

    if (!period) throw new NotFoundException('Période introuvable');

    const gradesByStudent = new Map<number, GradeWithSubject[]>();
    for (const g of allGrades) {
      const list = gradesByStudent.get(g.student_id) || [];
      list.push(g);
      gradesByStudent.set(g.student_id, list);
    }

    const reportCardsByStudent = new Map(
      allReportCards.map((rc) => [rc.student_id, rc]),
    );

    const results = await Promise.allSettled(
      students.map((student) =>
        this.generateSingleBulletin(
          student,
          period,
          gradesByStudent.get(student.id) || [],
          reportCardsByStudent.get(student.id) ?? null,
        ),
      ),
    );

    const urls: string[] = [];
    for (let i = 0; i < results.length; i++) {
      const r = results[i];
      if (r.status === 'fulfilled' && r.value) {
        urls.push(r.value);
      } else if (r.status === 'rejected') {
        this.logger.warn(
          `Bulletin generation failed for student ${students[i].id}: ${r.reason}`,
        );
      }
    }
    return urls;
  }

  private async generateSingleBulletin(
    student: StudentWithRelations,
    period: AcademicPeriod,
    grades: GradeWithSubject[],
    reportCard: ReportCard | null,
  ): Promise<string | null> {
    if (!reportCard || grades.length === 0) return null;

    const isPrimary = student.class?.grade_total_max != null;
    const avgScale = student.class?.grade_avg_scale || 20;

    let docDefinition: TDocumentDefinitions;

    if (isPrimary) {
      const totalMax = student.class?.grade_total_max || 0;

      docDefinition = {
        defaultStyle: { font: 'Roboto' },
        content: [
          {
            text: student.school.name.toUpperCase(),
            style: 'schoolName',
            alignment: 'center',
          },
          {
            text: `Année Scolaire ${period.name}`,
            style: 'republic',
            alignment: 'center',
          },
          { text: '\n' },
          { text: 'BULLETIN DE NOTES', style: 'header' },
          {
            text: `${period.name} - ${student.class?.name || 'N/A'}`,
            style: 'subheader',
          },
          { text: '\n' },
          {
            columns: [
              [
                { text: `NOM ET PRÉNOMS: ${student.name}`, bold: true },
                { text: `MATRICULE: ${student.matricule || 'N/A'}` },
              ],
              [
                {
                  text: `NÉ(E) LE: ${student.dob ? student.dob.toLocaleDateString('fr-FR') : 'N/A'}`,
                },
                { text: `SEXE: ${student.sexe || 'N/A'}` },
              ],
            ],
          },
          { text: '\n' },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'MATIÈRES', style: 'tableHeader' },
                  { text: 'NOTE', style: 'tableHeader' },
                  { text: '/MAX', style: 'tableHeader' },
                  { text: 'APPRÉCIATION', style: 'tableHeader' },
                ],
                ...grades.map((g) => [
                  g.subject.name,
                  g.value.toFixed(2),
                  (g.max_score || g.subject.max_score || '').toString(),
                  g.comment ||
                    this.getAppreciation(
                      (g.value / (g.max_score || 10)) * avgScale,
                    ),
                ]),
              ],
            },
          },
          { text: '\n' },
          {
            table: {
              widths: ['*', '*'],
              body: [
                [
                  {
                    text: `TOTAL: ${reportCard.total_points.toFixed(2)} / ${totalMax}`,
                  },
                  {
                    text: `MOYENNE: ${(reportCard.average * avgScale).toFixed(2)} / ${avgScale}`,
                    style: 'finalAverage',
                  },
                ],
                [
                  { text: '' },
                  {
                    text: `RANG: ${reportCard.rank}${reportCard.rank === 1 ? 'er' : 'ème'}`,
                    bold: true,
                  },
                ],
              ],
            },
          },
          { text: '\n\n' },
          {
            columns: [
              { text: 'Le Parent', alignment: 'center' },
              {
                text: `Fait à ${student.school.city || '......'}, le ${new Date().toLocaleDateString('fr-FR')}`,
                alignment: 'center',
              },
              { text: 'Le Directeur', alignment: 'center' },
            ],
          },
        ],
        styles: {
          schoolName: { fontSize: 14, bold: true },
          republic: { fontSize: 9 },
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            decoration: 'underline',
          },
          subheader: { fontSize: 14, alignment: 'center', margin: [0, 5] },
          tableHeader: {
            fillColor: '#eeeeee',
            bold: true,
            alignment: 'center',
          },
          finalAverage: { fontSize: 14, bold: true, color: 'blue' },
        },
      };
    } else {
      docDefinition = {
        defaultStyle: { font: 'Roboto' },
        content: [
          {
            columns: [
              { text: student.school.name.toUpperCase(), style: 'schoolName' },
              {
                text: "RÉPUBLIQUE DE CÔTE D'IVOIRE\nUnion - Discipline - Travail",
                style: 'republic',
                alignment: 'right',
              },
            ],
          },
          { text: '\n' },
          { text: 'BULLETIN DE NOTES', style: 'header' },
          { text: `${period.name} - Année Scolaire`, style: 'subheader' },
          { text: '\n' },
          {
            columns: [
              [
                { text: `NOM ET PRÉNOMS: ${student.name}`, bold: true },
                { text: `MATRICULE: ${student.matricule || 'N/A'}` },
                { text: `CLASSE: ${student.class?.name || 'N/A'}` },
              ],
              [
                {
                  text: `NÉ(E) LE: ${student.dob ? student.dob.toLocaleDateString('fr-FR') : 'N/A'}`,
                },
                { text: `À: ${student.place_birth || 'N/A'}` },
                { text: `SEXE: ${student.sexe || 'N/A'}` },
              ],
            ],
          },
          { text: '\n' },
          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'MATIÈRES', style: 'tableHeader' },
                  { text: 'COEF', style: 'tableHeader' },
                  { text: 'MOYENNE', style: 'tableHeader' },
                  { text: 'APPRÉCIATION', style: 'tableHeader' },
                ],
                ...this.groupGradesBySubject(grades).map((s) => [
                  s.name,
                  s.coef.toString(),
                  s.average.toFixed(2),
                  this.getAppreciation(s.average),
                ]),
              ],
            },
          },
          { text: '\n' },
          {
            table: {
              widths: ['*', '*'],
              body: [
                [
                  {
                    stack: [
                      {
                        text: `TOTAL POINTS: ${reportCard.total_points.toFixed(2)}`,
                      },
                      { text: `TOTAL COEF: ${reportCard.total_coef}` },
                    ],
                  },
                  {
                    stack: [
                      {
                        text: `MOYENNE GÉNÉRALE: ${reportCard.average.toFixed(2)} / 20`,
                        style: 'finalAverage',
                      },
                      {
                        text: `RANG: ${reportCard.rank === 0 ? 'N/A' : reportCard.rank}${reportCard.rank === 1 ? 'er' : 'ème'}`,
                        bold: true,
                      },
                    ],
                  },
                ],
              ],
            },
          },
          { text: '\n\n' },
          {
            columns: [
              { text: 'Le Parent', alignment: 'center' },
              { text: 'Le Professeur Principal', alignment: 'center' },
              { text: "Le Chef d'Établissement", alignment: 'center' },
            ],
          },
        ],
        styles: {
          schoolName: { fontSize: 12, bold: true },
          republic: { fontSize: 8 },
          header: {
            fontSize: 18,
            bold: true,
            alignment: 'center',
            decoration: 'underline',
          },
          subheader: { fontSize: 14, alignment: 'center', margin: [0, 5] },
          tableHeader: {
            fillColor: '#eeeeee',
            bold: true,
            alignment: 'center',
          },
          finalAverage: { fontSize: 14, bold: true, color: 'blue' },
        },
      };
    }

    const pdfDoc = pdfMake.createPdf(docDefinition);
    const blob = await pdfDoc.getBlob();
    const arrayBuffer = await blob.arrayBuffer();
    const pdfBuffer: Buffer<ArrayBufferLike> = Buffer.from(arrayBuffer);

    const path = `bulletins/${student.school.school_id}/${period.name}/${period.id}/student_${student.id}.pdf`;
    await this.storage.uploadFile(
      'documents',
      path,
      pdfBuffer,
      'application/pdf',
    );

    return await this.storage.getSignedUrl('documents', path);
  }

  private groupGradesBySubject(grades: (GradeWithSubject & { subject: Subject })[]) {
    const subjects = new Map<
      number,
      { name: string; coef: number; sum: number; count: number }
    >();
    grades.forEach((g) => {
      const current = subjects.get(g.subject_id) || {
        name: g.subject.name,
        coef: g.subject.coefficient,
        sum: 0,
        count: 0,
      };
      current.sum += g.value;
      current.count += 1;
      subjects.set(g.subject_id, current);
    });

    return Array.from(subjects.values()).map((s) => ({
      name: s.name,
      coef: s.coef,
      average: s.sum / s.count,
    }));
  }

  private getAppreciation(average: number): string {
    if (average >= 16) return 'Excellent';
    if (average >= 14) return 'Très Bien';
    if (average >= 12) return 'Bien';
    if (average >= 10) return 'Passable';
    return 'Insuffisant';
  }
}
