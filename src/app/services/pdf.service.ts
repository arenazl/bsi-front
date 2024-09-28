import { Injectable } from '@angular/core';
import { FileService } from './file.service'; // Importar el servicio de archivos
import jsPDF from 'jspdf';
import { PdfConfig, PdfConfigContrato } from '../models/Model';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor(private fileService: FileService) { }

  generateGenericPdf(config: PdfConfig): void {
    const pdf = new jsPDF();
    const startX = 14;
    const startY = 20;
    const rowHeight = 8; 
    const pageHeight = pdf.internal.pageSize.height;
    const pageWidth = pdf.internal.pageSize.width;
    const margin = 10;
    const headerColor = { r: 41, g: 128, b: 185 };
    const alternateRowColor = { r: 240, g: 240, b: 240 }; 
    const textColor = { r: 0, g: 0, b: 0 }; 
  
    // Título centrado
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(config.titleColor.r, config.titleColor.g, config.titleColor.b);
    pdf.setFontSize(18); 
    pdf.text(config.title, pageWidth / 2, startY - 10, { align: 'center' });
  
    const headerSectionY = startY + 5;
  
    // Encabezado de la sección de información (dividido en dos líneas)
    pdf.setFontSize(config.headerFontSize);
    pdf.setFont('helvetica', 'normal');
    pdf.setFillColor(220, 220, 220); 
    pdf.rect(startX - 2, headerSectionY - 4, pageWidth - margin * 2 + 4, rowHeight * 2.5, 'F'); 
  
    let lineOffset = 0;
    const headerLine1Y = headerSectionY + 2;
    const headerLine2Y = headerSectionY + 12; 
  
    pdf.setTextColor(textColor.r, textColor.g, textColor.b);
  
    // Línea 1 del encabezado
    config.headerFields.slice(0, 3).forEach((field) => {
      const labelText = field.label + ':';
      let dataText = String(config.headerData[field.key] || '');
      if (field.key === 'importe_total') {
        const numericValue = Number(config.headerData[field.key]);
        dataText = numericValue.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
      }
      pdf.text(labelText, startX + lineOffset, headerLine1Y);
      pdf.text(dataText, startX + lineOffset + pdf.getTextWidth(labelText) + 1, headerLine1Y);
      lineOffset += 60;
    });
  
    // Línea 2 del encabezado 
    lineOffset = 0;
    config.headerFields.slice(3, 6).forEach((field) => {
      const labelText = field.label + ':';
      let dataText = String(config.headerData[field.key] || '');
      pdf.text(labelText, startX + lineOffset, headerLine2Y);
      pdf.text(dataText, startX + lineOffset + pdf.getTextWidth(labelText) + 1, headerLine2Y);
      lineOffset += 60;
    });
  
    // Iniciar la tabla de datos
    const tableStartY = headerSectionY + 25;
    let y = tableStartY + rowHeight;

    pdf.setFontSize(config.headerFontSize);
    pdf.setTextColor(255, 255, 255); 
    pdf.setFont('helvetica', 'bold');
    pdf.setFillColor(headerColor.r, headerColor.g, headerColor.b); 
    pdf.rect(startX, tableStartY, pageWidth - margin * 2, rowHeight, 'F'); 
  
    config.detailFields.forEach((field, index) => {
      const fieldX = startX + (index * (pageWidth - margin * 2) / config.detailFields.length);
      pdf.text(field.label, fieldX, tableStartY + 6); 
    });
  
    // Dibujar las filas de la tabla
    pdf.setFontSize(config.detailFontSize);
    pdf.setFont('helvetica', 'normal');
    let alternate = false;
  
    config.detailData.forEach((item, rowIndex) => {
      if (y + rowHeight > pageHeight - 10) {
        pdf.addPage();
        y = startY;
      }
  
      if (alternate) {
        pdf.setFillColor(alternateRowColor.r, alternateRowColor.g, alternateRowColor.b);
        pdf.rect(startX, y, pageWidth - margin * 2, rowHeight, 'F');
      }
      alternate = !alternate;
  
      config.detailFields.forEach((field, index) => {
        const fieldX = startX + (index * (pageWidth - margin * 2) / config.detailFields.length);
        let cellText = String(item[field.key] || '');
        if (field.key === 'importe') {
          const numericValue = Number(item[field.key]);
          cellText = `$${numericValue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
        }
        pdf.setTextColor(textColor.r, textColor.g, textColor.b);
        pdf.text(cellText, fieldX, y + 6);
      });

      y += rowHeight;
    });

    // Añadir un pie de página con numeración de página
    const totalPages = pdf.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Página ${i} de ${totalPages}`, pageWidth - margin - 20, pageHeight - 10, { align: 'right' });
    }
  
    pdf.save(`${config.title}.pdf`);
  }
  
  

  // Método para generar PDF de contrato
  generateContratoPdf(config: PdfConfigContrato): void {
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const marginLeft = 20;
    const marginRight = 20;
    const pageWidth = pdf.internal.pageSize.width;
    let yPosition = 20;
  
    pdf.setFont("helvetica");
    pdf.setFontSize(13);
    pdf.text(config.municipio, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
  
    pdf.setDrawColor(0); 
    pdf.setLineWidth(0.5);
    pdf.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
    yPosition += 7;
  
    pdf.setFontSize(12); 
    pdf.text(`Buenos Aires, ${config.fecha}`, pageWidth - marginRight, yPosition, { align: 'right' });
    yPosition += 10;
  
    const fecha = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    const contenido = `
      Señor gerente del 
      Banco de la Provincia de Buenos Aires
      
      De nuestra consideración:
      
      Ref.: CONVENIO DE PAGOS
      
      Tengo el agrado de dirigirme a Ud. con relación al tema de referencia.
      
      Sobre el particular, adjunto archivo y listado de respaldo conteniendo los pagos a abonar de acuerdo al siguiente detalle:
      
      Cantidad de pagos: ${config.cantidadTransferencias}
      Total general a acreditar en Pesos: ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(config.totalImporte)}
      
      Asimismo, autorizo al Banco a debitar de nuestra cuenta corriente radicada en esa sucursal, los fondos necesarios para atender los pagos y la comisión del servicio.
      
      Los pagos deben estar disponibles en las cajas de ahorros de nuestros beneficiarios el día ${config.fecha}.
      
      Saluda a Ud. muy atentamente.
    `;

    pdf.setFontSize(12);
    yPosition = this.justifyText(pdf, contenido, marginLeft, yPosition, pageWidth - marginLeft - marginRight, 12, 0.50); 

    yPosition += 70; 
    pdf.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
    yPosition += 10;
    pdf.text('Firma y sello del titular de la cuenta corriente', pageWidth / 2, yPosition, { align: 'center' });

    pdf.save('contrato.pdf');
  }
  
  justifyText(pdf: jsPDF, text: string, x: number, y: number, maxWidth: number, fontSize: number, lineHeightMultiplier: number): number {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    lines.forEach((line: string) => {
      pdf.text(line, x, y);
      y += fontSize * lineHeightMultiplier;
    });
    return y;
  }
  

  // Método para descargar un archivo
  getFile(tipoModulo: string, id: number, rotulo: string): void {
    this.fileService.downloadOutputFile(tipoModulo, id).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${rotulo}.txt`); // Nombre del archivo a descargar
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); // Eliminar el enlace después de descargar
    }, error => {
      console.error('Error al descargar el archivo:', error);
    });
  }
  
}
