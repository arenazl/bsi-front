import { Component, OnInit, AfterViewInit, HostBinding, ChangeDetectorRef } from "@angular/core";
import { LegajoService } from "../../services/legajo.service";
import { FileService } from "../../services/file.service";
import { Router, ActivatedRoute, Params } from "@angular/router";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { TipoModulo } from "src/app/enums/enums";
import {
  Solicitud,
  FileRes,
  Usuario,
  FileForTable,
  Refuerzo,
  FinPago,
  EnumLotes,
  Lotes,
} from "src/app/models/Model";
import { FileSelectDirective, FileUploader } from "ng2-file-upload";
import { saveAs } from "file-saver";
import { SharedService } from "src/app/services/shared.service";
import Swal from "sweetalert2";
import { provideProtractorTestingSupport } from "@angular/platform-browser";
import { filter, ignoreElements, iif } from "rxjs";
import { registerLocaleData } from "@angular/common";
import { ElementSchemaRegistry } from "@angular/compiler";
import { LotesService } from "src/app/services/lotes.service";

@Component({
  selector: 'app-xsl-verified',
  templateUrl: './xsl-verified.component.html',
  styleUrls: ['./xsl-verified.component.css']
})
export class XslVerifiedComponent implements OnInit, AfterViewInit {

  @HostBinding("class") classes = "row";

  ld_header: boolean = false;
  tranfeList: any = [];
  TipoModulo = "";
  SelectedId = 0;
  headerTitle = "";
  validationData: any = { data: [] };
  municipio = '';
  columnConfig: any[] = [];
  showExportSection = true;
  usuario = <Usuario>{};
  params = <Params>{ tg: 2, id_barrio: 0 };



  tranfeResponse: any = { data: [] };

  constructor(
    private legajoService: LegajoService,
    private lotesService: LotesService,
    private router: Router,
    private fileService: FileService,
    private sharedService: SharedService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef

  ) { }

  ngAfterViewInit(): void { }

  ngOnInit() {

    this.municipio = this.toProperCase(sessionStorage.getItem('Organismo') as string)

    this.route.params.subscribe((params) => {

      this.TipoModulo = params["tipomodulo"]
      this.SelectedId = params["id"]

      this.headerTitle = this.getHeaderText(this.TipoModulo);

      if (this.TipoModulo === TipoModulo.PAGOS) {
        this.getPagosById(this.SelectedId);
      }

      if (this.TipoModulo === TipoModulo.ALTAS) {

        this.validationData.data = this.fileService.getValidationData() as [];

        this.validationData.data = this.validationData.data.map((record: any) => {
          record.Fecha_Nacimiento = this.parseDate(record.Fecha_Nacimiento);
          return record;
        });

        /*
        this.fileService.getContratoData(this.TipoModulo).subscribe((result) => {
          this.validationData = result;
          this.cdRef.detectChanges();
        });*/
      }

    });

    this.fileService.getColumnConfig(this.TipoModulo).subscribe(config => {
      this.columnConfig = config.columns;
    });
  }

  parseDate(dateString: string): Date | null {
    const parts = dateString.split('/');
    if (parts.length === 3) {
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Los meses son 0-indexados en JavaScript
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return null; // Devuelve null si el formato no es válido
  }


  getPagosById(id: number): void {

    this.ld_header = true;
    this.fileService.getPagos(id).subscribe((res) => {
      this.validationData = res;
      this.ld_header = false;
    },
      (err) => console.error(err)
    );
  }

  areAllRecordsValid(): boolean {

    return this.validationData.data.every(
      (record: any) => record.es_valido === true ||
        record.es_valido === undefined
    );

  }

  getHeaderText(TipoForm: string): string {

    switch (TipoForm) {
      case TipoModulo.TRANSFERENCIAS:
        return "Transferencias Inmediatas";
      case TipoModulo.PAGOS:
        return "Pagos Multiples";
      case TipoModulo.ALTAS:
        return "Alta de Cuentas";
    }

    return '';

  }

  generatePdfTable() {
    const pdf = new jsPDF();
    const startX = 14; // Margen izquierdo
    const startY = 20; // Margen superior
    const columnWidth = 60; // Ancho de cada columna
    const rowHeight = 6; // Altura de cada fila (reducido para disminuir el espacio entre líneas)
    const pageHeight = pdf.internal.pageSize.height; // Altura de la página
    const margin = 10; // Margen inferior
    const pageWidth = pdf.internal.pageSize.width; // Ancho de la página
    const headerColor = { r: 41, g: 128, b: 185 }; // Azul oscuro para los encabezados y líneas divisorias
    const textColor = { r: 0, g: 0, b: 0 }; // Negro para el texto
    const altRowColor = { r: 230, g: 240, b: 255 }; // Azul claro para las filas alternadas
    const headerBgColor = { r: 220, g: 230, b: 240 }; // Azul claro para el fondo de la cabecera
  
    // Define los encabezados de la tabla
    const headers = ['CBU', 'Referencia', 'Importe'];
  
    // Define los valores de los campos
    pdf.setFont('helvetica', 'bold');
    const fecha = new Date(this.validationData.head.FECHA || '').toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) || '';
    const cantidadTransferencias = this.validationData.head.CANTIDAD_TRANSFERENCIAS || '';
    const importeTotal = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(this.validationData.head.TOTAL_IMPORTE || ''));
    const cuentaDebito = this.validationData.head.CUENTA_DEBITO || '';
    const concepto = this.validationData.head.CONCEPTO || '';
  
    // Verifica si los datos están disponibles
    if (!fecha || !cantidadTransferencias || !importeTotal || !cuentaDebito || !concepto) {
      console.error('Faltan datos en tranfeResponse.head');
      console.log('Datos disponibles:', this.validationData.head);
      return;
    }
  
    // Mantiene el tamaño de la fuente original
    pdf.setFontSize(10); // Tamaño de fuente original
  
    // Calcula el ancho total de la página
    const leftX = startX; // Margen izquierdo para CBU
    const centerX = pageWidth / 2; // Centro de la página para Referencia
    const rightX = pageWidth - startX; // Margen derecho para Importe
  
    // Agrega el nombre del organismo y la línea horizontal solo en la primera página
    pdf.setFontSize(12); // Tamaño de fuente para el nombre del organismo
    pdf.setFont('helvetica', 'bold'); // Estilo bold para el nombre del organismo
    pdf.setTextColor(headerColor.r, headerColor.g, headerColor.b); // Color azul para el nombre del organismo
    pdf.text(this.municipio || 'Nombre del Organismo', pageWidth / 2, startY - 10, { align: 'center' });
  
    pdf.setDrawColor(headerColor.r, headerColor.g, headerColor.b); // Color de la línea (azul)
    pdf.setLineWidth(0.5); // Grosor de la línea
    pdf.line(startX, startY - 5, pageWidth - startX, startY - 5); // Dibuja la línea
  
    // Agrega la sección de encabezado con los valores solo en la primera página
    pdf.setFontSize(10); // Tamaño de fuente para la sección de encabezado
    pdf.setFont('helvetica', 'normal'); // Estilo normal para las etiquetas
    const headerSectionY = startY + 5; // Posición vertical para la sección de encabezado
  
    // Fondo para el encabezado
    pdf.setFillColor(headerBgColor.r, headerBgColor.g, headerBgColor.b);
    pdf.rect(leftX - 2, headerSectionY - 4, pageWidth - leftX * 2 + 4, 12, 'F');
  
    pdf.setTextColor(textColor.r, textColor.g, textColor.b); // Color de texto negro
    pdf.text('Fecha de pago:', leftX, headerSectionY);
    pdf.text(fecha, leftX + 25, headerSectionY);
  
    pdf.text('Cantidad de Transferencias:', leftX + 63, headerSectionY);
    pdf.text(String(cantidadTransferencias), leftX + 108, headerSectionY);
  
    pdf.text('Importe Total:', leftX + 128, headerSectionY);
    pdf.text(String(importeTotal), leftX + 153, headerSectionY);
  
    pdf.text('Cuenta Débito:', leftX, headerSectionY + 6);
    pdf.text(String(cuentaDebito), leftX + 25, headerSectionY + 6);
  
    pdf.text('Concepto:', leftX + 63, headerSectionY + 6);
    pdf.text(String(concepto), leftX + 80, headerSectionY + 6);
  
    pdf.setDrawColor(headerColor.r, headerColor.g, headerColor.b); // Color de la línea (azul)
    pdf.setLineWidth(0.5); // Grosor de la línea
    pdf.line(startX, startY + 18, pageWidth - startX, startY + 18); // Dibuja la línea
  
    // Ajusta la posición para los encabezados de la tabla
    const tableStartY = headerSectionY + 25; // Espacio adicional para separar los datos del encabezado de la tabla
  
    // Agrega los encabezados de la tabla
    pdf.setFontSize(10); // Tamaño de fuente original para los encabezados
    pdf.setTextColor(headerColor.r, headerColor.g, headerColor.b); // Color azul para los encabezados
    pdf.text(headers[0], leftX, tableStartY);
    pdf.text(headers[1], centerX, tableStartY, { align: 'center' });
    pdf.text(headers[2], rightX, tableStartY, { align: 'right' });
  
    // Inicializa las variables para controlar la posición y la página
    let y = tableStartY + rowHeight;
    let pageNumber = 1;
    const totalPages = Math.ceil(this.validationData.data.length * rowHeight / (pageHeight - margin - tableStartY)); // Calcula el total de páginas
  
    function formatCurrency(value: string): string {
      // Reemplaza caracteres no numéricos
      const numberValue = parseFloat(value.replace(/[^0-9.,]+/g, ''));
      if (isNaN(numberValue)) return '$0,00'; // Valor predeterminado si el número no es válido
  
      // Formatea el número con separadores
      return numberValue.toLocaleString('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).replace('.', ','); // Reemplaza el punto decimal con coma
    }
  
    // Procesa los datos
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(textColor.r, textColor.g, textColor.b); // Color de texto negro
    const data = this.validationData.data.map((item: any) => [
      item.CBU || '',       // Asegúrate de que el campo coincida
      item.APELLIDO || '',  // Asegúrate de que el campo coincida
      formatCurrency(item.IMPORTE || '') // Aplica el formato de moneda
    ]);
  
    data.forEach((row: string[], rowIndex: number) => {
      // Verifica si se necesita una nueva página
      if (y + rowHeight > pageHeight - margin) {
        // Añade el número de página
        pdf.setFontSize(10);
        pdf.setTextColor(headerColor.r, headerColor.g, headerColor.b);
        pdf.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 40, pageHeight - margin + 5, { align: 'right' });
  
        pdf.addPage(); // Añade una nueva página
        y = startY;    // Reinicia la posición vertical
  
        // Reagrega los encabezados de la tabla en la nueva página
        pdf.setFontSize(10); // Tamaño de fuente para los encabezados
        pdf.setTextColor(headerColor.r, headerColor.g, headerColor.b); // Color azul para los encabezados
        pdf.text(headers[0], leftX, y);
        pdf.text(headers[1], centerX, y, { align: 'center' });
        pdf.text(headers[2], rightX, y, { align: 'right' });
        y += rowHeight; // Ajusta la posición para la primera fila
  
        pageNumber++; // Incrementa el número de página
      }
  
      // Alterna el color de fondo de las filas
      if (rowIndex % 2 === 0) {
        pdf.setFillColor(altRowColor.r, altRowColor.g, altRowColor.b); // Azul claro
        pdf.rect(leftX - 2, y - rowHeight + 1, pageWidth - leftX * 2 + 4, rowHeight, 'F'); // Fondo de fila
      }
  
      // Agrega los datos
      const adjustedCenterX = centerX - 15; // Ajusta este valor según tu necesidad
      pdf.setTextColor(textColor.r, textColor.g, textColor.b); // Color de texto negro
      pdf.text(String(row[0]), leftX, y);
      pdf.text(String(row[1]), adjustedCenterX, y, { align: 'left' });
      pdf.text(String(row[2]), rightX, y, { align: 'right' });
      y += rowHeight; // Ajusta la posición para la siguiente fila
    });
  
    // Añade el número de página en la última página
    pdf.setFontSize(10);
    pdf.setTextColor(headerColor.r, headerColor.g, headerColor.b);
    pdf.text(`Página ${pageNumber} de ${totalPages}`, pageWidth - 40, pageHeight - margin + 5, { align: 'right' });
  
    // Guarda el PDF
    pdf.save('lista_de_pagos.pdf');
  }

  
  
  

  generatePdfContrato() {
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
    const contentHeight = pageHeight - marginTop - marginBottom;
  
    let yPosition = marginTop;
  
    // Función para justificar texto respetando saltos de línea
    const justifyText = (text: string, y: number, fontSize = 12) => {
      pdf.setFontSize(fontSize);
      const lineHeight = fontSize * 0.3527;
      const paragraphs = text.split('\n');
  
      paragraphs.forEach((paragraph, pIndex) => {
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
            // Justificar la línea actual
            if (line.split(' ').length > 1) {
              const spaceWidth = (contentWidth - pdf.getStringUnitWidth(line) * fontSize / pdf.internal.scaleFactor) / (line.split(' ').length - 1);
              let xPosition = marginLeft;
              line.split(' ').forEach((word, i, arr) => {
                pdf.text(word, xPosition, y);
                if (i < arr.length - 1) {
                  xPosition += pdf.getStringUnitWidth(word + ' ') * fontSize / pdf.internal.scaleFactor + spaceWidth;
                }
              });
            } else {
              pdf.text(line, marginLeft, y);
            }
            
            line = word + ' ';
            y += lineHeight;
          } else {
            line = testLine;
          }
  
          if (index === words.length - 1) {
            pdf.text(line.trim(), marginLeft, y); // Última línea, alineada a la izquierda
            y += lineHeight;
          }
        });
  
        if (pIndex < paragraphs.length - 1) {
          y += lineHeight / 2; // Espacio extra entre párrafos
        }
      });
  
      return y;
    };
  
    // Agregar contenido al PDF
    pdf.setFont("helvetica");
  
    // Agregar el municipio (centrado)
    pdf.setFontSize(16);
    pdf.text(this.municipio, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    
    // Agregar línea horizontal
    pdf.setDrawColor(0); // Color negro
    pdf.setLineWidth(0.5); // Grosor de la línea
    pdf.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
    yPosition += 10; // Espacio después de la línea
  
    // Agregar la fecha (alineada a la derecha)
      const fecha = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    pdf.setFontSize(12);
    pdf.text(`Buenos Aires, ${fecha}`, pageWidth - marginRight, yPosition, { align: 'right' });
    yPosition += 10;
  
    // Contenido principal (justificado respetando saltos de línea)
    const contenido = `Señor gerente del
  Banco de la Provincia de Buenos Aires
  
  De nuestra consideración:
  
  Ref.: CONVENIO DE PAGOS
  
  Tengo el agrado de dirigirme a Ud. con relación al tema de referencia.
  
  Sobre el particular, adjunto archivo y listado de respaldo conteniendo los pagos a abonar de acuerdo al siguiente detalle:
  
  Cantidad de pagos: ${this.validationData.head.CANTIDAD_TRANSFERENCIAS}
  Total general a acreditar en Pesos: ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(this.validationData.head.TOTAL_IMPORTE))}
  
  Asimismo, autorizo al Banco a debitar de nuestra cuenta corriente radicada en esa sucursal, los fondos necesarios para atender los pagos y la comisión del servicio.
  
  Los pagos deben estar disponibles en las cajas de ahorros de nuestros beneficiarios el día ${new Date(this.validationData.head.FECHA).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })} 
  
  Saluda a Ud. muy atentamente.`;
  
    yPosition = justifyText(contenido, yPosition, 12);
  
    // Agregar línea para la firma
    yPosition += 60;
    pdf.line(marginLeft, yPosition, pageWidth - marginRight, yPosition);
    yPosition += 10;
    pdf.text('Firma y sello del titular de la cuenta corriente', pageWidth / 2, yPosition, { align: 'center' });
  
    // Guardar el PDF
    pdf.save('contrato.pdf');
  }

  getFile(): void {
    this.fileService
      .downloadFile(this.SelectedId)
      .subscribe((blob) => {
        const concepto = "concepto";
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "989898989".trim() + "-" + concepto + ".txt");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
  }

  toProperCase(str: string): string {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
