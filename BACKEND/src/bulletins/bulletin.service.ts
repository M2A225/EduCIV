import { Injectable } from '@nestjs/common';
import { PrismaService } from '../core/prisma.service';
import { StorageService } from '../storage/storage.service';
import { TDocumentDefinitions } from 'pdfmake/interfaces';
const PdfPrinter = require('pdfmake');

@Injectable()
export class BulletinService {
  private printer: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService
  ) {
    const fonts = {
      Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
      }
    };
    this.printer = new PdfPrinter(fonts);
  }

  async generateBulletin(studentId: number, trimester: number): Promise<string> {
    const student = await this.prisma.student.findUnique({
      where: { id: studentId },
    });

    if (!student) throw new Error('Student not found');

    const grades = await this.prisma.grade.findMany({
      where: { student_id: studentId, trimester },
      include: { subject: true },
    });

    const docDefinition: TDocumentDefinitions = {
      defaultStyle: { font: 'Helvetica' },
      content: [
        { text: 'BULLETIN DE NOTES', style: 'header' },
        { text: `Trimestre ${trimester}`, style: 'subheader' },
        { text: 'Identité de l\'élève', style: 'sectionTitle' },
        { text: `Nom: ${student.name}`, margin: [0, 5] },
        { text: 'Notes:', style: 'sectionTitle' },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto'],
            body: [
              ['Matière', 'Note'],
              ...grades.map((g) => [g.subject.name, g.value.toString()]),
            ],
          },
        },
      ],
      styles: {
        header: { fontSize: 20, bold: true, alignment: 'center' },
        subheader: { fontSize: 16, alignment: 'center', margin: [0, 10] },
        sectionTitle: { fontSize: 14, bold: true, margin: [0, 15, 0, 5] }
      }
    };

    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const pdfDoc = this.printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });

    const path = `bulletins/student_${studentId}_trimester_${trimester}.pdf`;
    await this.storage.uploadFile('documents', path, pdfBuffer, 'application/pdf');
    
    return await this.storage.getSignedUrl('documents', path);
  }
}
