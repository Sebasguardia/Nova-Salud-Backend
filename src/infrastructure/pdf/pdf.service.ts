import { Injectable, Logger } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import { ReceiptData } from './templates/receipt.template';

@Injectable()
export class PdfService {
  private readonly logger = new Logger(PdfService.name);

  async generateReceipt(data: ReceiptData): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadsDir = process.env.UPLOADS_DIR ?? './uploads';
      const receiptsDir = path.join(uploadsDir, 'receipts');

      if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir, { recursive: true });
      }

      const fileName = `receipt_${data.saleNumber}_${Date.now()}.pdf`;
      const filePath = path.join(receiptsDir, fileName);
      const doc      = new PDFDocument({ margin: 40, size: 'A5' });
      const stream   = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // Encabezado
      doc.fontSize(16).font('Helvetica-Bold').text(data.boticaName, { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(`RUC: ${data.ruc}`, { align: 'center' });
      doc.text(data.address, { align: 'center' });
      doc.moveDown(0.5);
      doc.moveTo(40, doc.y).lineTo(375, doc.y).stroke();
      doc.moveDown(0.5);

      // Datos de la venta
      doc.fontSize(11).font('Helvetica-Bold').text(`Comprobante: ${data.saleNumber}`);
      doc.fontSize(10).font('Helvetica');
      doc.text(`Fecha:       ${data.date}`);
      doc.text(`Atendido por: ${data.userName}`);
      if (data.clientName) doc.text(`Cliente:     ${data.clientName} — DNI: ${data.clientDni}`);
      doc.moveDown(0.5);

      // Tabla de items
      doc.font('Helvetica-Bold').fontSize(9);
      doc.text('Producto',    40,  doc.y, { width: 160, continued: false });
      const headerY = doc.y - 12;
      doc.text('Cant.',  205, headerY, { width: 35 });
      doc.text('P.Unit', 245, headerY, { width: 55 });
      doc.text('Total',  305, headerY, { width: 55 });
      doc.moveDown(0.3);
      doc.moveTo(40, doc.y).lineTo(375, doc.y).stroke();
      doc.font('Helvetica').fontSize(9);

      for (const item of data.items) {
        const rowY = doc.y + 2;
        doc.text(item.name,                    40,  rowY, { width: 160 });
        doc.text(String(item.quantity),        205, rowY, { width: 35 });
        doc.text(`S/. ${item.unitPrice.toFixed(2)}`, 245, rowY, { width: 55 });
        doc.text(`S/. ${item.subtotal.toFixed(2)}`,  305, rowY, { width: 55 });
        doc.moveDown(0.4);
      }

      doc.moveTo(40, doc.y).lineTo(375, doc.y).stroke();
      doc.moveDown(0.5);

      // Totales
      doc.fontSize(10);
      doc.text(`Subtotal:`,   240, doc.y, { continued: true, width: 65 });
      doc.text(`S/. ${data.subtotal.toFixed(2)}`, { align: 'right', width: 90 });

      if (data.discountAmount > 0) {
        doc.text(`Descuento:`, 240, doc.y, { continued: true, width: 65 });
        doc.text(`-S/. ${data.discountAmount.toFixed(2)}`, { align: 'right', width: 90 });
      }

      doc.text(`IGV (18%):`, 240, doc.y, { continued: true, width: 65 });
      doc.text(`S/. ${data.taxAmount.toFixed(2)}`, { align: 'right', width: 90 });

      doc.font('Helvetica-Bold').fontSize(12);
      doc.text(`TOTAL:`, 240, doc.y, { continued: true, width: 65 });
      doc.text(`S/. ${data.total.toFixed(2)}`, { align: 'right', width: 90 });

      if (data.pointsEarned > 0) {
        doc.font('Helvetica').fontSize(9);
        doc.moveDown(0.5);
        doc.text(`Puntos ganados: ${data.pointsEarned}`, { align: 'right' });
      }

      doc.end();

      stream.on('finish', () => {
        this.logger.log(`PDF generado: ${fileName}`);
        resolve(fileName);
      });
      stream.on('error', reject);
    });
  }
}