import { LegajoService } from "../../../services/legajo.service";
import { FileService } from "../../../services/file.service";
import { Component, OnInit, HostBinding, AfterViewInit } from "@angular/core";
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
import { Router, ActivatedRoute, Params } from "@angular/router";
import { SharedService } from "src/app/services/shared.service";
import Swal from "sweetalert2";
import { provideProtractorTestingSupport } from "@angular/platform-browser";
import { filter, ignoreElements, iif } from "rxjs";
import { registerLocaleData } from "@angular/common";
import { ElementSchemaRegistry } from "@angular/compiler";
import { LotesService } from "src/app/services/lotes.service";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

@Component({
  selector: 'app-pagos-list',
  templateUrl: './pagos-list.component.html',
  styleUrls: ['./pagos-list.component.css']
})
export class PagosListComponent implements OnInit, AfterViewInit {

  @HostBinding("class") classes = "row";

  usuario = <Usuario>{};

  ld_header: boolean = false;

  params = <Params>{ tg: 2, id_barrio: 0 };

  date_firma_start = this.getDateForDB(0);
  date_firma_end = this.getDateForDB(7);

  tranfeList: any = [];
  selectedHistoryId = "";
  idSelected = false;

  tranfeResponse: any = { data: [] };

  detaildByID = false;
  blobArray = new Array<string>();
  firstItemOfDay = new Array<any>();

  municipio = '';

  constructor(
    private legajoService: LegajoService,
    private lotesService: LotesService,
    private router: Router,
    private fileService: FileService,
    private sharedService: SharedService,
    private route: ActivatedRoute
  ) { }
  ngAfterViewInit(): void {

  }

  ngOnInit() {

    this.route.params.subscribe((params) => {

      this.selectedHistoryId = params["id"];

      this.getTransForSelect();

      if (this.selectedHistoryId != "0") {
        this.getPagosById(this.selectedHistoryId);
      }

    });
  }

  getPagosById(id: string): void {

    this.ld_header = true;

    this.selectedHistoryId = id;

    this.municipio = this.toProperCase(sessionStorage.getItem('Organismo') as string)

    this.fileService.getPagos(id).subscribe((res) => {

      this.ld_header = false;
      this.tranfeResponse = res;

    },
      (err) => console.error(err)
    );
  }

  getTransForSelect(): void {

    this.fileService.getPagosList().subscribe(
      (res) => {
        this.tranfeList = res;
      },
      (err) => console.error(err)
    );
  }

  transformData(): void {
    const capitalizedData = this.tranfeResponse.data.map((sol: any) => {
      sol.Referencia = sol.Referencia.split(" ")
        .map(
          (word: any) =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
      return sol;
    });

    this.tranfeResponse.data = capitalizedData;
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

    if (dataElement2) {
      html2canvas(dataElement2).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('contrato.pdf');
      });
    }


  }

  getTrByID(id: any) {
    if (id.target.value) {
      this.getPagosById(id.target.value);
    }
  }

  getFile(): void {


    /*Swal.fire({
      title: "Contrato de aceptación",
      icon: "info",
      text: "Lo sentimos, tu usuario no tiene acceso a esta funcionalidad. Si considerás que podría serte útil y deseás adquirir este servicio, por favor, contactanos para más información",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Acepto",
      showLoaderOnConfirm: true,
      preConfirm: (nota) => {
*/
    this.fileService
      .downloadPagoFile(this.selectedHistoryId as unknown as number)
      .subscribe((blob) => {

        let cbu: "cbu"
        let concepto = "concepto"

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;

        link.setAttribute("download", "989898989".trim() + "-" + concepto + ".txt");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

      });
    /*
          },
          allowOutsideClick: () => !Swal.isLoading(),
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: "Confirmado!",
            });
          }
        });
    
        /*
        Swal.fire({
          title: "Agregar pago para " + 'pepe',
          text:
            "Restan por ingresar U$D " + 9000000,
          html:
            "<h5> Restan por abonar $" +
            'resta' +
            " </h4>" +
            '<input id="swal-input1" type="number" value="' +
            'look' +
            '" class="swal2-input">' +
            '<textarea id="swal-input2" name="Text1" cols="40" rows="4" style="margin-top: 18px;border: 1px solid #d5d5d5;padding: 10px;" placeholder="Ingrese alguna nota..."></textarea>',
          inputAttributes: {
            autocapitalize: "off",
          },
          showCancelButton: true,
          confirmButtonText: "Agregar pago",
          showLoaderOnConfirm: true,
          preConfirm: () => {
    
          },
          allowOutsideClick: () => !Swal.isLoading(),
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: "Enviado!",
            });
          }
        });*/

  }

  getDateForDB(dias_hasta: number = 0) {

    if (!dias_hasta) {
      let currentYear: string = new Date().getFullYear().toString();
      let currentDay = new Date().getDate().toString();
      let currentMonth = (new Date().getMonth() + 1).toString();
      let currentDayStr = ("00" + currentDay).slice(-2);
      let currentMonthStr = ("00" + currentMonth).slice(-2);

      return currentYear + "-" + currentMonthStr + "-" + currentDayStr;
    } else {
      let date_hasta = this.addDays(dias_hasta);

      let currentYear: string = date_hasta.getFullYear().toString();
      let currentDay = date_hasta.getDate().toString();
      let currentMonth = (date_hasta.getMonth() + 1).toString();
      let currentDayStr = ("00" + currentDay).slice(-2);
      let currentMonthStr = ("00" + currentMonth).slice(-2);

      return currentYear + "-" + currentMonthStr + "-" + currentDayStr;
    }
  }

  addDays(days: number) {
    var result = new Date();
    result.setDate(result.getDate() + days);
    return result;
  }

  setCss(sol: Solicitud) {
    if (sol.fecha_firma) {
      return "row-cj";
    }
    return "";
  }

  isFirstElemenet(sol: Solicitud) {
    if (this.firstItemOfDay.find((element) => element == sol.id)) return true;
    else return false;
  }


  removePrefix() {
    setTimeout(() => {
      var img0 = document.getElementById("img_0") as HTMLImageElement;
      var img1 = document.getElementById("img_1") as HTMLImageElement;
      var img2 = document.getElementById("img_2") as HTMLImageElement;
      var img3 = document.getElementById("img_3") as HTMLImageElement;
      var img4 = document.getElementById("img_4") as HTMLImageElement;
      var img5 = document.getElementById("img_5") as HTMLImageElement;
      var img6 = document.getElementById("img_6") as HTMLImageElement;

      if (img0) {
        img0.src = img0.src.substring(7, img0.src.length);
      }
      if (img1) {
        img1.src = img1.src.substring(7, img1.src.length);
      }
      if (img2) {
        img2.src = img2.src.substring(7, img2.src.length);
      }
      if (img3) {
        img3.src = img3.src.substring(7, img3.src.length);
      }
      if (img4) {
        img4.src = img4.src.substring(7, img4.src.length);
      }
      if (img5) {
        img5.src = img5.src.substring(7, img5.src.length);
      }
      if (img6) {
        img6.src = img6.src.substring(7, img6.src.length);
      }
    }, 30);
  }

  downloadReal(sol: Solicitud) {

    let id = sol.id;
    let file_ctrl = document.getElementById("file_span_" + sol.id);
    if (file_ctrl) file_ctrl.innerText = "...";

    sol.blobArray = new Array<string>();

    sol.archivos?.forEach((item) => {
      this.fileService.downloadFile(0).subscribe(
        (data) => {
          let file_ctrl = document.getElementById("file_span_" + id);
          if (file_ctrl) file_ctrl.innerText = "";

          saveAs(data, item.fileName as string);
        },
        (error) => console.error(error)
      );
    });
  }

  toProperCase(str: string): string {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }


  /*
  enviarNota(sol: Solicitud) {
    Swal.fire({
      title: "Ingrese una nota para" + sol.denominacion,
      input: "textarea",
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Guardar nota",
      showLoaderOnConfirm: true,
      preConfirm: (nota) => {
        sol.observaciones_a = nota;
        sol.archivos = undefined;

        this.legajoService.updateGame(sol.id, sol).subscribe(
          (res) => {
            console.log(res);
            this.getGames();
          },
          (err) => console.error(err)
        );
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Enviado!",
        });
      }
    });
  }*/

  /*
  enviarCuota(sol: Solicitud) {
    if (!sol.refuerzo_total) sol.refuerzo_total = 0;
    if (!sol.pago_total) sol.pago_total = 0;
    if (!sol.lote_total) sol.lote_total = 0;

    let refuerzo = <Refuerzo>{};

    let resta = sol.lote_total - (sol.refuerzo_total + sol.pago_total);

    Swal.fire({
      title: "Agregar pago para " + sol.denominacion,
      text:
        "Restan por ingresar U$D " +
        (sol.lote_total - (sol.refuerzo_total + sol.pago_total)),
      html:
        "<h5> Restan por abonar $" +
        resta +
        " </h4>" +
        '<input id="swal-input1" type="number" value="' +
        resta +
        '" class="swal2-input">' +
        '<textarea id="swal-input2" name="Text1" cols="40" rows="4" style="margin-top: 18px;border: 1px solid #d5d5d5;padding: 10px;" placeholder="Ingrese alguna nota..."></textarea>',
      inputAttributes: {
        autocapitalize: "off",
      },
      showCancelButton: true,
      confirmButtonText: "Agregar pago",
      showLoaderOnConfirm: true,
      preConfirm: () => {
        if (!sol.refuerzo_total) sol.refuerzo_total = 0;
        if (!sol.pago_total) sol.pago_total = 0;
        if (!sol.lote_total) sol.lote_total = 0;

        refuerzo.id_solicitud = sol.id;
        refuerzo.id_barrio = sol.id_barrio;

        var monto = document.getElementById("swal-input1") as HTMLInputElement;
        var nota = document.getElementById("swal-input2") as HTMLInputElement;

        refuerzo.pago_completo =
          sol.lote_total ==
          sol.refuerzo_total + sol.pago_total + Number(monto.value);
        refuerzo.monto = sol.pago_total + Number(monto.value);
        refuerzo.nota = nota.value;

        this.legajoService.saveCuota(refuerzo).subscribe(
          (res) => {
            console.log(res);
            this.getGames();
          },
          (err) => console.error(err)
        );
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Enviado!",
        });
      }
    });
  }*/


}
