import { Component, OnInit, AfterViewInit, HostBinding } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Location } from '@angular/common';
import { TipoMetada, TipoModulo } from "src/app/enums/enums";
import { FileService } from "../../services/file.service";
import { PdfService } from "src/app/services/pdf.service";
import { BsiHelper } from "src/app/services/bsiHelper.service";

@Component({
  selector: 'app-xsl-verified',
  templateUrl: './xsl-verified.component.html',
  styleUrls: ['./xsl-verified.component.css']
})
export class XslVerifiedComponent implements OnInit, AfterViewInit {
  @HostBinding("class") classes = "row";

  // Properties
  isLoading = false;
  Tipo_Modulo = "";
  headerTitle = "";

  organismoDescription: string = ''; // Cambiado de organismo_descripcion
  transferList: any[] = []; // Cambiado de tranfeList // Cambiado de tranfeList

  id = 0;
  contractId = 0;
  organismoId = 0;
  userId = 0;
  showExportSection = true;
  validationData: any;
  metadata: any;
  allRecordsValid = false;
  showHistory = false;
  hasError = false;
  payloadParams: any = {};

  constructor(
    private route: ActivatedRoute,
    private fileService: FileService,
    private pdfService: PdfService,
    private location: Location,
    private bsiHelper: BsiHelper
  ) { }

  ngAfterViewInit(): void { }

  ngOnInit() {
    this.loadSessionData();
    this.subscribeToRouteParams();
  }

  private loadSessionData(): void {
    this.contractId = Number(sessionStorage.getItem('IdContrato'));
    this.organismoId = Number(sessionStorage.getItem('IdOrganismo'));
    this.organismoDescription = this.bsiHelper.toProperCase(sessionStorage.getItem('Organismo') || '');
    this.userId = Number(sessionStorage.getItem('idUser'));
  }

  private subscribeToRouteParams(): void {
    this.route.params.subscribe((params) => {
      this.Tipo_Modulo = params["tipomodulo"];
      this.id = Number(params["id"]);
      this.hasError = Boolean(params["error"]);

      this.headerTitle = this.getHeaderText(this.Tipo_Modulo);

      if (this.id === 0) {
        this.showHistory = true;
        this.getListCombo();
      } else {
        this.isLoading = true;
        const payload = this.generatePayload();
        this.callDBAndLoadElements(payload);
      }
    });
  }

  private generatePayload(): any {
    if (this.Tipo_Modulo === TipoModulo.CUENTA || this.Tipo_Modulo === TipoModulo.PAGO) {
      this.bsiHelper.agregarGenericParam('p_id', this.id);
    } else if (this.Tipo_Modulo === TipoModulo.NOMINA) {
      this.bsiHelper.agregarGenericParam('id_user', this.userId);
      this.bsiHelper.agregarGenericParam('id_contrato', this.contractId);
      this.bsiHelper.agregarGenericParam('id_organismo', this.organismoId);
    }

    this.payloadParams = this.bsiHelper.generarGenericPayload(
      this.bsiHelper.contatenarSP(this.Tipo_Modulo, "OBTENER_RESUMEN_BY_ID")
    );

    return this.payloadParams;
  }

  private callDBAndLoadElements(payloadParams: any): void {
    this.fileService.postSelectGenericSP(payloadParams).subscribe({
      next: (res: any) => this.handleDBResponse(res),
      error: (error) => this.handleDBError(error)
    });
  }

  private handleDBResponse(res: any): void {
    this.fileService.getMetaData(this.Tipo_Modulo as TipoModulo, TipoMetada.LIST).subscribe({
      next: (data) => this.processMetadata(data, res),
      error: (error) => console.error('Error al cargar metadata:', error)
    });
  }

  private processMetadata(data: any, res: any): void {
    console.log('Metadata recibida:', data);
    this.metadata = data.RESULT;
    this.validationData = res.data;
    this.allRecordsValid = this.areAllRecordsValid();

    if (this.validationData?.items) {
      this.validationData.items.forEach((sol: any) => {
        if(sol.nombre != null || sol.nombre != undefined)
        {
          sol.nombre = this.bsiHelper.toProperCase(sol.nombre);
        }    
      });
    }

    this.isLoading = false;
  }

  private handleDBError(error: any): void {
    console.error('Error al cargar los datos:', error);
    this.isLoading = false;
  }

  goBack(): void {
    this.location.back();
  }

  getListComboById(event: any): void {
    this.id = event.target.value;
    this.isLoading = true;

    const payload = this.generatePayload();
    this.callDBAndLoadElements(payload);
  }

  getListCombo(): void {
    this.fileService.getListForCombo(this.Tipo_Modulo as TipoModulo).subscribe({
      next: (data) => this.transferList = data,
      error: (error) => console.error('Error al obtener lista para combo:', error)
    });
  }

  public areAllRecordsValid(): boolean {
    return this.validationData?.items?.every((record: any) => record.valido === 1);
  }

  private getHeaderText(moduleType: string): string {
    const headerTexts: { [key: string]: string } = {
      "TRANSFERENCIAS": "Transferencias Inmediatas",
      "PAGO": "Pagos Múltiples",
      "CUENTA": "Alta de Cuentas",
      "NOMINA": "Alta de Nóminas"
    };
    return headerTexts[moduleType] || '';
  }

  generatePdfTable(): void {
    const config = this.getPdfTableConfig();
    this.pdfService.generateGenericPdf(config);
  }

  private getPdfTableConfig(): any {
    return {
      headerColor: { r: 219, g: 229, b: 239 },
      detailColor: { r: 230, g: 240, b: 255 },
      titleColor: { r: 41, g: 128, b: 185 },
      titleFontSize: 16,
      headerFontSize: 10,
      detailFontSize: 10,
      title: this.organismoDescription,
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
  }

  generatePdfContrato(): void {
    const config = this.getPdfContratoConfig();
    this.pdfService.generateContratoPdf(config);
  }

  private getPdfContratoConfig(): any {
    return {
      municipio: this.organismoDescription,
      fecha: new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      cantidadTransferencias: this.validationData.header.cantidad_elementos,
      totalImporte: this.validationData.header.importe_total,
      fechaPago: this.validationData.header.fechapago
    };
  }

  getFile(): void {
    const rotulo = sessionStorage.getItem('Rotulo');
    if (!rotulo) {
      console.error('El rótulo no está disponible en sessionStorage.');
      return;
    }
    this.pdfService.getFile(this.Tipo_Modulo, this.id, rotulo);
  }
}