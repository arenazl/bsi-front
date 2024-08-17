import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { PdfConfig } from '../models/Model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }
  
  generateGenericPdf(config: PdfConfig): void {
    const pdf = new jsPDF();
    const startX = 14;
    const startY = 20;
    const rowHeight = 6;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 10;
    const pageWidth = pdf.internal.pageSize.width;
  
    const leftX = startX;
    const centerX = pageWidth / 2;
    const rightX = pageWidth - startX;
  
    pdf.setFontSize(config.headerFontSize);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(config.headerColor.r, config.headerColor.g, config.headerColor.b);
    pdf.text(config.title, pageWidth / 2, startY - 10, { align: 'center' });
  
    pdf.setDrawColor(config.headerColor.r, config.headerColor.g, config.headerColor.b);
    pdf.setLineWidth(0.5);
    pdf.line(startX, startY - 5, pageWidth - startX, startY - 5);
  
    const headerSectionY = startY + 5;
  
    pdf.setFontSize(config.headerFontSize);
    pdf.setFont('helvetica', 'normal');
    
    pdf.setFillColor(config.headerColor.r, config.headerColor.g, config.headerColor.b);
    pdf.rect(leftX - 2, headerSectionY - 4, pageWidth - leftX * 2 + 4, 12, 'F');
    
    pdf.setTextColor(0, 0, 0);
    config.headerFields.forEach((field:any, index:any) => {
      const fieldX = leftX + (index * 60); // Ajusta el espaciado según sea necesario
      pdf.text(field.label + ':', fieldX, headerSectionY);
      pdf.text(String(config.headerData[field.key] || ''), fieldX + 25, headerSectionY);
    });
  
    pdf.setLineWidth(0.5);
    pdf.line(startX, startY + 18, pageWidth - startX, startY + 18);
  
    const tableStartY = headerSectionY + 25;
    let y = tableStartY + rowHeight;
    let pageNumber = 1;
    const totalPages = Math.ceil(config.detailData.length * rowHeight / (pageHeight - margin - tableStartY));
  
    pdf.setFontSize(config.detailFontSize);
    pdf.setTextColor(config.headerColor.r, config.headerColor.g, config.headerColor.b);
    config.detailFields.forEach((field:any, index:any) => {
      const fieldX = leftX + (index * 60);
      pdf.text(field.label, fieldX, tableStartY);
    });
  
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);
  
    config.detailData.forEach((item:any, rowIndex:any) => {
      if (y + rowHeight > pageHeight - margin) {
        pdf.setFontSize(10);
        pdf.setTextColor(config.headerColor.r, config.headerColor.g, config.headerColor.b);
        pdf.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 40, pageHeight - margin + 5, { align: 'right' });
  
        pdf.addPage();
        y = startY;
  
        pdf.setFontSize(config.detailFontSize);
        pdf.setTextColor(config.headerColor.r, config.headerColor.g, config.headerColor.b);
        config.detailFields.forEach((field:any, index:any) => {
          const fieldX = leftX + (index * 60);
          pdf.text(field.label, fieldX, y);
        });
        y += rowHeight;
  
        pageNumber++;
      }
  
      if (rowIndex % 2 === 0) {
        pdf.setFillColor(config.detailColor.r, config.detailColor.g, config.detailColor.b);
        pdf.rect(leftX - 2, y - rowHeight + 1, pageWidth - leftX * 2 + 4, rowHeight, 'F');
      }
  
      config.detailFields.forEach((field:any, index:any) => {
        const fieldX = leftX + (index * 60);
        pdf.text(String(item[field.key] || ''), fieldX, y);
      });
  
      y += rowHeight;
    });
  
    pdf.setFontSize(10);
    pdf.setTextColor(config.headerColor.r, config.headerColor.g, config.headerColor.b);
    pdf.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 40, pageHeight - margin + 5, { align: 'right' });
  
    pdf.save(`${config.title}.pdf`);
  }

  


}





