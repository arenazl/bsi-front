import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import { PdfConfig, PdfConfigContrato } from '../models/Model';
import { textAlign } from 'html2canvas/dist/types/css/property-descriptors/text-align';

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
    
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(config.titleColor.r, config.titleColor.g, config.titleColor.b);
    pdf.text(config.title, pageWidth / 2, startY - 10, { align: 'center' });

    pdf.setDrawColor(config.headerColor.r, config.headerColor.g, config.headerColor.b);
    pdf.setLineWidth(0.5);
    pdf.line(startX, startY - 5, pageWidth - startX, startY - 5);

    const headerSectionY = startY + 5;

    pdf.setFontSize(config.headerFontSize);
    pdf.setFont('helvetica', 'normal');

    pdf.setFillColor(config.headerColor.r, config.headerColor.g, config.headerColor.b);
    pdf.rect(leftX - 2, headerSectionY - 4, pageWidth - leftX * 2 + 4, 18, 'F'); // cuadrado que contiene header

    pdf.setTextColor(0, 0, 0);

    // Línea 1: Fecha de pago, Cantidad de Transferencias, Importe Total
    const headerLine1Y = headerSectionY + 2;
    let lineOffset = 0;

    config.headerFields.slice(0, 3).forEach((field, index) => {
        const labelText = field.label + ':';
        let dataText = String(config.headerData[field.key] || '');
        
        // Formatear importe total como moneda
        if (field.key === 'importeTotal') {
            const numericValue = Number(config.headerData[field.key]);
            dataText = `$${numericValue.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
        
        // Calcular el ancho del texto de la etiqueta y del dato
        const labelWidth = pdf.getTextWidth(labelText);
        const dataWidth = pdf.getTextWidth(dataText);
        const totalWidth = 60; // Ancho total del campo en la línea
        
        // Posicionar el texto de la etiqueta
        pdf.text(labelText, leftX + lineOffset, headerLine1Y);

        pdf.text(dataText, leftX + lineOffset + labelWidth + 1, headerLine1Y);

        lineOffset += 60; // Espacio para cada campo en la línea
    });

    // Línea 2: Cuenta Débito, Concepto, Rótulo
    const headerLine2Y = headerSectionY + 12;
    lineOffset = 0;

    config.headerFields.slice(3).forEach((field, index) => {
        const labelText = field.label + ':';
        let dataText = String(config.headerData[field.key] || '');

        // Formatear importe total como moneda
        if (field.key === 'importeTotal') {
            const numericValue = Number(config.headerData[field.key]);
            dataText = `$${numericValue.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }

        // Calcular el ancho del texto de la etiqueta y del dato
        const labelWidth = pdf.getTextWidth(labelText);
        const dataWidth = pdf.getTextWidth(dataText);
        const totalWidth = 70; // Ancho total del campo en la línea
        
        // Posicionar el texto de la etiqueta
        pdf.text(labelText, leftX + lineOffset, headerLine2Y);
        pdf.text(dataText, leftX + lineOffset + labelWidth + 1, headerLine2Y);
        
        lineOffset += 60; // Espacio para cada campo en la línea
    });

    const tableStartY = headerSectionY + 35;
    let y = tableStartY + rowHeight;
    let pageNumber = 1;

    pdf.setFontSize(config.detailFontSize);
    pdf.setTextColor(config.titleColor.r, config.titleColor.g, config.titleColor.b);
    config.detailFields.forEach((field, index) => {
        const fieldX = leftX + (index * 60);
        pdf.text(field.label, fieldX, tableStartY);
    });

    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(0, 0, 0);

    config.detailData.forEach((item, rowIndex) => {
        if (y + rowHeight > pageHeight - margin) {
            pdf.addPage();
            y = startY;
            pageNumber++;
        }

        if (rowIndex % 2 === 0) {
            pdf.setFillColor(config.detailColor.r, config.detailColor.g, config.detailColor.b);
            pdf.rect(leftX - 2, y - rowHeight + 1, pageWidth - leftX * 2 + 4, rowHeight, 'F');
        }

        config.detailFields.forEach((field, index) => {
            const fieldX = leftX + (index * 60);
            let cellText = String(item[field.key] || '');
            
            // Formateo del importe si es el campo 'importe'
            if (field.key === 'importe') {
                const numericValue = Number(item[field.key]);
                cellText = `$${numericValue.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            }
            
            // Calcular el ancho del texto de la celda
            const cellWidth = 60; // Ancho total de la celda
            
            // Alinear el texto a la derecha solo si es el campo 'importe'
            if (field.key === 'importe') {
                const cellTextWidth = pdf.getTextWidth(cellText);
                const cellTextX = fieldX + (cellWidth - cellTextWidth);
                pdf.text(cellText, cellTextX, y);
            } else {
                pdf.text(cellText, fieldX, y);
            }
        });

        y += rowHeight;
    });

    // Añadir numeración de páginas en una segunda pasada
    const totalPages = pdf.internal.pages.length - 1; // Restamos 1 porque `pages[0]` está vacío.
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(10);
        pdf.setTextColor(config.titleColor.r, config.titleColor.g, config.titleColor.b);
        pdf.text(`Página ${i} de ${totalPages}`, pageWidth - 40, pageHeight - margin + 5, { align: 'right' });
    }

    pdf.save(`${config.title}.pdf`);
}



  
  



  
  



  

  generateContratoPdf(config: PdfConfigContrato): void {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
  
    const marginLeft = 20;
    const marginRight = 20;
    const marginTop = 20;
    const marginBottom = 20;
  
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const contentWidth = pageWidth - marginLeft - marginRight;
  
    let yPosition = marginTop;
  
    const justifyText = (text: string, y: number, fontSize = 12) => {
      pdf.setFontSize(fontSize);
      const lineHeight = fontSize * 0.3527;
      const paragraphs = text.split('\n');
  
      paragraphs.forEach((paragraph) => {
        if (paragraph.trim() === '') {
          y += lineHeight;
          return;
        }
  
        const words = paragraph.split(' ');
        let line = '';
  
        words.forEach((word, index) => {
          const testLine = line + word + ' ';
          const testWidth = pdf.getStringUnitWidth(testLine) * fontSize / pdf.internal.scaleFactor;
  
          if (testWidth > contentWidth) {
            pdf.text(line, marginLeft, y);
            line = word + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
  
          if (index === words.length - 1) {
            pdf.text(line.trim(), marginLeft, y);
            y += lineHeight;
          }
        });
  
        y += lineHeight / 2; // Espacio extra entre párrafos
      });
  
      return y;
    };
  
    pdf.setFont("helvetica");
    pdf.setFontSize(16);
    pdf.text(config.municipio, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
  
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.5);
    pdf.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
    yPosition += 10;
  
    pdf.setFontSize(12);
    pdf.text(`Buenos Aires, ${config.fecha}`, pageWidth - marginRight, yPosition, { align: 'right' });
    yPosition += 10;
  
    const contenido = `Señor gerente del
  Banco de la Provincia de Buenos Aires
  
  De nuestra consideración:
  
  Ref.: CONVENIO DE PAGOS
  
  Tengo el agrado de dirigirme a Ud. con relación al tema de referencia.
  
  Sobre el particular, adjunto archivo y listado de respaldo conteniendo los pagos a abonar de acuerdo al siguiente detalle:
  
  Cantidad de pagos: ${config.cantidadTransferencias}
  Total general a acreditar en Pesos: ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(config.totalImporte)}
  
  Asimismo, autorizo al Banco a debitar de nuestra cuenta corriente radicada en esa sucursal, los fondos necesarios para atender los pagos y la comisión del servicio.
  
  Los pagos deben estar disponibles en las cajas de ahorros de nuestros beneficiarios el día ${config.fechaPago} 
  
  Saluda a Ud. muy atentamente.`;
  
    yPosition = justifyText(contenido, yPosition, 12);
  
    yPosition += 60;
    pdf.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
    yPosition += 10;
    pdf.text('Firma y sello del titular de la cuenta corriente', pageWidth / 2, yPosition, { align: 'center' });
  
    pdf.save('contrato.pdf');
  }
  



}





