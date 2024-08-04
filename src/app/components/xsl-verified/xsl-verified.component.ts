import { Component, OnInit, AfterViewInit, HostBinding, ChangeDetectorRef } from "@angular/core";
import { FileService } from "../../services/file.service";
import { Router, ActivatedRoute, Params } from "@angular/router";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { TipoModulo } from "src/app/enums/enums";

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

  constructor(
    private fileService: FileService,
    private router: Router,
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

    const dataElement = document.getElementById('pdf-content');

    if (dataElement) {
      html2canvas(dataElement).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('registros.pdf');
      });
    }
  }

  generatePdfContrato() {

    const dataElement2 = document.getElementById('pdf-contrato');

    dataElement2?.classList.remove('d-none');

    if (dataElement2) {

      html2canvas(dataElement2).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('contrato.pdf');
        dataElement2?.classList.add('d-none');
      });
    }

  }

  getFile(): void {

    this.fileService.downloadOutputFile(this.TipoModulo as TipoModulo, this.SelectedId).subscribe((blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "989898989-concepto.txt");
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
