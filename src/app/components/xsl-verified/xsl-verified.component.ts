import { Component, OnInit, AfterViewInit, HostBinding, ChangeDetectorRef } from "@angular/core";
import { LegajoService } from "../../services/legajo.service";
import { FileService } from "../../services/file.service";
import { Router, ActivatedRoute, Params } from "@angular/router";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { TipoMetada, TipoModulo } from "src/app/enums/enums";
import {
  Solicitud,
  FileRes,
  Usuario,
  FileForTable,
  Refuerzo,
  FinPago,
  EnumLotes,
  Lotes,
  PdfConfig,
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
import { PdfService } from "src/app/services/pdf.service";

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
  ID = 0;
  headerTitle = "";
  municipio = '';
  columnConfig: any[] = [];

  showExportSection = true;
  usuario = <Usuario>{};
  params = <Params>{ tg: 2, id_barrio: 0 };

  validationData: any;  // Datos reales, como el JSON de ejemplo
  metadata: any;        // Metadata para renderizar la UI
  allRecordsValid = false;

  tranfeResponse: any = { data: [] };

  constructor(
    private router: Router,
    private fileService: FileService,
    private sharedService: SharedService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private pdfService: PdfService

  ) { }

  
  //text-decoration: none;
  //font-size: 392%;

  ngAfterViewInit(): void { }

  ngOnInit() {

    this.municipio = this.toProperCase(sessionStorage.getItem('Organismo') as string)

    this.route.params.subscribe((params) => {

      this.TipoModulo = params["tipomodulo"]
      this.ID = params["id"]

      this.getListCombo();

      this.headerTitle = this.getHeaderText(this.TipoModulo)

        this.ld_header = true;

        this.fileService.getResumen(this.TipoModulo as TipoModulo,  this.ID).subscribe((res: any) => {

          this.fileService.getMetaDataUI(this.TipoModulo as TipoModulo, TipoMetada.LIST).subscribe(( data) => {

              this.metadata = data.metadata_json;
              this.validationData = res.result;       
              this.allRecordsValid = this.areAllRecordsValid();
                
              this.ld_header = false;
            });
        },
          (err) => console.error(err)
        );
      
    });
  }

  getListComboById(id: any) {
    if (id.target.value) {

      this.fileService.getListForCombo(this.TipoModulo as TipoModulo).subscribe((data) => {
        this.tranfeList = data;
      });
    }
  }


  getListCombo() {

      this.fileService.getListForCombo(this.TipoModulo as TipoModulo).subscribe((data) => {
        this.tranfeList = data;
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


  
  areAllRecordsValid(): boolean {

    return this.validationData.items.every(
      (record: any) => record.valido == 1);
  }

  getHeaderText(TipoForm: string): string {

    switch (TipoForm) {
      case TipoModulo.TRANSFERENCIAS:
        return "Transferencias Inmediatas";
      case TipoModulo.PAGO:
        return "Pagos Multiples";
      case TipoModulo.CUENTA:
        return "Alta de Cuentas";
    }

    return '';

  }

  generatePdfTable() {
    const config: PdfConfig = {
      headerColor: { r: 219, g: 229, b: 239 },
      detailColor: { r: 230, g: 240, b: 255 },
      titleColor: { r: 41, g: 128, b: 185 },
      titleFontSize: 16,
      headerFontSize: 10,
      detailFontSize: 10,
      title: this.municipio,  // Título del PDF
      headerData: this.validationData.header,  // Datos del encabezado
      detailData: this.validationData.items,  // Datos de los detalles
      headerFields: [
        { label: 'Fecha de pago', key: 'fechapago' },
        { label: 'Cantidad de Transferencias', key: 'cantidad_elementos' },
        { label: 'Importe Total', key: 'importe_total' },
        { label: 'Cuenta Débito', key: 'Cuenta_Debito' },
        { label: 'Concepto', key: 'concepto' },
        { label: 'Rotulo', key: 'rotulo' },
      ],
      detailFields: [
        { label: 'CBU', key: 'cbu' },
        { label: 'Referencia', key: 'nombre' },
        { label: 'Importe', key: 'importe' },
      ],
    };
    
    this.pdfService.generateGenericPdf(config);
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
  
  Cantidad de pagos: ${this.validationData.header.cantidad_elementos}
  Total general a acreditar en Pesos: ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(this.validationData.header.importe_total))}
  
  Asimismo, autorizo al Banco a debitar de nuestra cuenta corriente radicada en esa sucursal, los fondos necesarios para atender los pagos y la comisión del servicio.
  
  Los pagos deben estar disponibles en las cajas de ahorros de nuestros beneficiarios el día ${new Date(this.validationData.header.fechapago).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })} 
  
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

    let rotulo = sessionStorage.getItem('Rotulo')

    this.fileService.downloadOutputFile(this.TipoModulo as TipoModulo, this.ID).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", rotulo + ".txt");
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
