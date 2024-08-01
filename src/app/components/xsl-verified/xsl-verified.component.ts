import { Component, OnInit, AfterViewInit, HostBinding } from "@angular/core";
import { FileService } from "../../services/file.service";
import { Router, ActivatedRoute, Params } from "@angular/router";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

@Component({
  selector: 'app-xsl-verified',
  templateUrl: './xsl-verified.component.html',
  styleUrls: ['./xsl-verified.component.css']
})
export class XslVerifiedComponent implements OnInit, AfterViewInit {

  @HostBinding("class") classes = "row";

  ld_header: boolean = false;
  tranfeList: any = [];
  tipoForm = "";
  headerTitle = "";
  validationData: any = { data: [] };
  municipio = '';
  columnConfig: any[] = [];

  constructor(
    private fileService: FileService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngAfterViewInit(): void { }

  ngOnInit() {

    this.route.params.subscribe((params) => {

      this.tipoForm = params["tipoForm"];

      this.headerTitle = this.getHeaderText(Number(this.tipoForm));

      this.fileService.getVerificacionContrato(this.tipoForm).subscribe((result) => {
        this.validationData = result;
      });

    });

    this.fileService.getColumnConfig(this.tipoForm).subscribe(config => {
      this.columnConfig = config.columns;
    });
  }

  getHeaderText(idTipo: number): string {
    switch (idTipo) {
      case 1:
        return "transferencias inmediatas";
      case 2:
        return "pagos multiples";
      case 3:
        return "alta de cuentas";
      default:
        return "Tipo desconocido";
    }
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
    this.fileService.downloadPagoFile(Number(this.tipoForm)).subscribe((blob) => {
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
