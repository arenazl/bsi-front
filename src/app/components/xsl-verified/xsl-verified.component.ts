import { Component, OnInit, AfterViewInit, HostBinding, ChangeDetectorRef } from "@angular/core";
import { LegajoService } from "../../services/legajo.service";
import { FileService } from "../../services/file.service";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { Location } from '@angular/common';
import { TipoMetada, TipoModulo } from "src/app/enums/enums";
import { PdfService } from "src/app/services/pdf.service";
import { BsiHelper } from "src/app/services/bsiHelper.service";

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
  headerTitle = "";
  organismo_descripcion = "";
  ID = 0;

  contrato = 0;
  organismo = 0;
  user = 0;
  columnConfig: any[] = [];
  showExportSection = true;
  validationData: any;  // Datos que recibimos
  metadata: any;        // Metadata para renderizar la UI
  allRecordsValid = false;
  showHistory = false;
  error=false;
  payloadParms: any = {};

  tranfeResponse: any = { data: [] }

  constructor(
    private router: Router,
    private fileService: FileService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private pdfService: PdfService,
    private location: Location,
    private bsiHelper: BsiHelper
  ) { }

  ngAfterViewInit(): void { }

  ngOnInit() {
    // Cargar parámetros de la sesión
    this.contrato = sessionStorage.getItem('IdContrato') as unknown as number;
    this.organismo = sessionStorage.getItem('IdOrganismo') as unknown as number;
    this.organismo_descripcion = this.bsiHelper.toProperCase(sessionStorage.getItem('Organismo') as string);
    this.user = sessionStorage.getItem('idUser') as unknown as number;

    this.route.params.subscribe((params) => {
      this.TipoModulo = params["tipomodulo"];
      this.ID = params["id"];
      this.error = params["error"] as unknown as boolean;

      this.headerTitle = this.getHeaderText(this.TipoModulo)

        if(this.ID == 0){
          this.ld_header = false;
          this.showHistory = true;
          this.getListCombo(); 
        }
        else
        {
       
          this.ld_header = true;

          let payload = this.generatePayload();
          this.callDBAndLoadElments(payload);
        }
     
    });
  }

  private generatePayload() : any {

    if (this.TipoModulo == TipoModulo.CUENTA || this.TipoModulo == TipoModulo.PAGO) 
    {
      this.bsiHelper.agregarGenericParam('p_id', this.ID);
      this.payloadParms = this.bsiHelper.generarGenericPayload(this.bsiHelper.contatenarSP(this.TipoModulo, "OBTENER_RESUMEN_BY_ID"));
    }

    else if (this.TipoModulo == TipoModulo.NOMINA) 
      {
      this.bsiHelper.agregarGenericParam('id_user', this.user);
      this.bsiHelper.agregarGenericParam('id_contrato', this.contrato);
      this.bsiHelper.agregarGenericParam('id_organismo', this.organismo);

      this.payloadParms = this.bsiHelper.generarGenericPayload(this.bsiHelper.contatenarSP(this.TipoModulo, "OBTENER_RESUMEN_BY_ID"));
    }

    return this.payloadParms;
  }

  callDBAndLoadElments(payloadParms: any) {

    this.fileService.postSelectGenericSP(payloadParms).subscribe((res: any) => {

      this.fileService.getMetaData(this.TipoModulo as TipoModulo, TipoMetada.LIST).subscribe((data) => {
        console.log('Metadata recibida:', data); // Comprobación de metadata
        this.metadata = data.RESULT;

        this.validationData = res.data;
        this.allRecordsValid = this.areAllRecordsValid();

        if (this.validationData?.items) {
          this.validationData.items.forEach((sol: any) => {
            sol.nombre = this.bsiHelper.toProperCase(sol.nombre);
          });
        }

        this.ld_header = false;
      });

    }, error => {
      console.error('Error al cargar los datos:', error);
      this.ld_header = false;
    });
  }

  goBack(): void {
    this.location.back();
  }

  getListComboById(id: any) {
    this.ID = id.target.value;
    this.ld_header = true;

    let payload = this.generatePayload();
    this.callDBAndLoadElments(payload);
    
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
      const month = parseInt(parts[1], 10) - 1; // Meses en JavaScript son 0-indexados
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day);
    }
    return null;
  }

  areAllRecordsValid(): boolean {
    return this.validationData?.items?.every((record: any) => record.valido == 1);
  }

  getHeaderText(TipoForm: string): string {
    switch (TipoForm) {
      case "TRANSFERENCIAS":
        return "Transferencias Inmediatas";
      case "PAGO":
        return "Pagos Múltiples";
      case "CUENTA":
        return "Alta de Cuentas";
      case "NOMINA":
        return "Alta de Nóminas";
      default:
        return '';
    }
  }

  // Llamada al método en PdfService para generar el PDF de la lista
  generatePdfTable() {
    const config = {
      headerColor: { r: 219, g: 229, b: 239 },
      detailColor: { r: 230, g: 240, b: 255 },
      titleColor: { r: 41, g: 128, b: 185 },
      titleFontSize: 16,
      headerFontSize: 10,
      detailFontSize: 10,
      title: this.organismo_descripcion,
      headerData: this.validationData.header,
      detailData: this.validationData.items,
      headerFields: [
        { label: 'Fecha de pago', key: 'fechapago' },
        { label: 'Cantidad de Transferencias', key: 'cantidad_elementos' },
        { label: 'Importe Total', key: 'importe_total' },
        { label: 'Cuenta Débito', key: 'Cuenta_Debito' },
        { label: 'Concepto', key: 'concepto' },
        { label: 'Rótulo', key: 'rotulo' },
      ],
      detailFields: [
        { label: 'CBU', key: 'cbu' },
        { label: 'Referencia', key: 'nombre' },
        { label: 'Importe', key: 'importe' },
      ]
    };

    this.pdfService.generateGenericPdf(config);
  }

  // Llamada al método en PdfService para generar el contrato en PDF
  generatePdfContrato() {
    const config = {
      municipio: this.organismo_descripcion,
      fecha: new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      cantidadTransferencias: this.validationData.header.cantidad_elementos,
      totalImporte: this.validationData.header.importe_total,
      fechaPago: this.validationData.header.fechapago
    };

    this.pdfService.generateContratoPdf(config);
  }

  // Método para descargar el archivo
  getFile(): void {
    const rotulo = sessionStorage.getItem('Rotulo');
    if (!rotulo) {
      console.error('El rótulo no está disponible en sessionStorage.');
      return;
    }
    this.pdfService.getFile(this.TipoModulo, this.ID, rotulo);
  }
  
  
}
