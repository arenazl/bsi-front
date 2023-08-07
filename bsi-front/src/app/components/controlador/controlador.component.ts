import { LegajoService } from '../../services/legajo.service';
import { FileService } from './../../services/file.service';
import { Component, OnInit, HostBinding } from '@angular/core';
import { Solicitud, FileRes, Usuario, Params, FileForTable, Ventas, Refuerzo } from 'src/app/models/Model';
import { FileSelectDirective, FileUploader} from 'ng2-file-upload'
import {saveAs} from 'file-saver';
import flatpickr from "flatpickr";

import { Router, ActivatedRoute } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-controlador',
  templateUrl: './controlador.component.html',
  styleUrls: ['./controlador.component.css']
})
export class ControladorComponent implements OnInit {

  @HostBinding('class') classes = 'row';

  solicitudes: any = [];
  usuario = <Usuario>{};

  ld_header:boolean=false;

  params = <Params>{tg:2,id_barrio:0};
  params_gr = 0;
  param_dt = "";

  ventas: any = [];

  lbl_resta=0;
  lbl_pago_parcial=0;

  sol_modal =<Solicitud>{};

  date_firma_start = this.getDateForDB(0);
  date_firma_end = this.getDateForDB(7);

  date_sena_start = this.getDateForDB(0);
  date_sena_end = this.getDateForDB(7);

  isFechaFirma=true;

  firstItemOfDay = new Array<any>();

  blobArray = new Array<string>();

  constructor(private legajoService: LegajoService, private router: Router, private fileService: FileService, private sharedService:SharedService) { }

  ngOnInit() {

    this.getGames();
  }

  closeRanking(id: any){

    let myElement = document.getElementById(id);
    if(myElement)
      myElement.style.display = "none";
  }


  isFirstElemenet (sol:Solicitud){

    if(this.firstItemOfDay.find(element => element == sol.id))
      return true;
    else
      return false;
  }

  enviarCuota(sol: Solicitud){

    if (!sol.refuerzo_total) sol.refuerzo_total= 0;
    if (!sol.pago_total) sol.pago_total= 0;
    if (!sol.lote_total) sol.lote_total= 0;

    let refuerzo = <Refuerzo>{};

    let resta = (sol.lote_total - (sol.refuerzo_total + sol.pago_total))

    Swal.fire({
    title: 'Agregar pago para ' + sol.denominacion,
    text: 'Restan por ingresar U$D ' +  (sol.lote_total - (sol.refuerzo_total + sol.pago_total)) ,
    html:
    '<h5> Restan por abonar $' + resta +' </h4>' +
    '<input id="swal-input1" type="number" value="' + resta + '" class="swal2-input">' +
    '<textarea id="swal-input2" name="Text1" cols="40" rows="4" style="margin-top: 18px;border: 1px solid #d5d5d5;padding: 10px;" placeholder="Ingrese alguna nota..."></textarea>',
    inputAttributes: {
      autocapitalize: 'off'
    },
    showCancelButton: true,
    confirmButtonText: 'Agregar pago',
    showLoaderOnConfirm: true,
    preConfirm: () => {

      if (!sol.refuerzo_total) sol.refuerzo_total= 0;
      if (!sol.pago_total) sol.pago_total= 0;
      if (!sol.lote_total) sol.lote_total= 0;

        refuerzo.id_solicitud = sol.id;
        refuerzo.id_barrio = sol.id_barrio

        var monto = document.getElementById('swal-input1') as HTMLInputElement;
        var nota = document.getElementById('swal-input2') as HTMLInputElement;

        refuerzo.pago_completo = (sol.lote_total == sol.refuerzo_total + sol.pago_total + Number(monto.value));
        refuerzo.monto = sol.pago_total + Number(monto.value);
        refuerzo.nota = nota.value;

        this.legajoService.saveCuota(refuerzo)
        .subscribe(
          res => {
            console.log(res);
            this.getGames();
          },
          err => console.error(err)
        )
    },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Enviado!'
        })
      }
    })

    }

  getGames(nodate:boolean=false, today:boolean=false) {

    this.legajoService.getVentas(2)
    .subscribe(
      res => {


        let list = res as Array<any>;
        let maxValue = 0;

        list.forEach((item: Ventas, index: number) => {

        if(index == 0){
          item.indice=1;
          maxValue=item.total;
        }
        item.indice =  item.total / maxValue;

       });

           this.ventas = list;

      },
      err => console.error(err)
    );

    this.ld_header=true;

    this.params.id_barrio = sessionStorage.getItem('id_barrio') as unknown as number
    this.params.grupo = this.params_gr;

    if(this.isFechaFirma)
    {
      this.params.fecha_start_firma = new Date(this.date_firma_start);
      this.params.fecha_end_firma = new Date(this.date_firma_end);
      this.params.fecha_start_seña = undefined;
      this.params.fecha_end_seña = undefined;
    }
    else
    { // es seña
    this.params.fecha_start_seña = new Date(this.date_sena_start);
    this.params.fecha_end_seña = new Date(this.date_sena_end);
    this.params.fecha_start_firma = undefined;
    this.params.fecha_end_firma = undefined;
    }

    let lastFecha:any;

    this.legajoService.getGames(this.params)
      .subscribe(
        res => {

          this.ld_header=false;

          this.solicitudes = null;
          let list = res as Array<any>;
          let fileTable: FileForTable;

          list.forEach(item => {
            let sol = item as Solicitud;
            sol.archivos = new Array<FileForTable>();

            if(sol.fecha_firma){
              if(new Date(sol.fecha_firma).getDate() != lastFecha)
              {
                this.firstItemOfDay.push(sol.id)
              }
            }

            sol.lote_append ='';

            if(sol.id_lote){
              sol.lote_append += sol.id_lote;
            }
            if(sol.id_lote_2){
              sol.lote_append += ', ' + sol.id_lote_2;
            }
            if(sol.id_lote_3){
              sol.lote_append += ', ' + sol.id_lote_3;
            }
            if(sol.id_lote_4){
              sol.lote_append += ', ' + sol.id_lote_4;
            }
            if(sol.id_lote_5){
              sol.lote_append += ', ' + sol.id_lote_5;
            }
            if(sol.id_lote_6){
              sol.lote_append += ', ' + sol.id_lote_6;
            }
            if(sol.id_lote_7){
              sol.lote_append += ', ' + sol.id_lote_7;
            }
            if(sol.id_lote_8){
              sol.lote_append += ', ' + sol.id_lote_8;
            }
            if(sol.id_lote_9){
              sol.lote_append += ', ' + sol.id_lote_9;
            }
            if(sol.id_lote_10){
              sol.lote_append += ', ' + sol.id_lote_10;
            }

            if(sol.nombre_archivo_1){
              fileTable = {fileName:sol.nombre_archivo_1,friendlyName:sol.nombre_archivo_1.split('-',2)[1]}
              sol.archivos.push(fileTable)
              sol.fileCant=1;
            } if(sol.nombre_archivo_2){
              fileTable = {fileName:sol.nombre_archivo_2,friendlyName:sol.nombre_archivo_2.split('-',2)[1]}
              sol.archivos.push(fileTable)
              sol.fileCant=2;
            } if(sol.nombre_archivo_3){
              fileTable = {fileName:sol.nombre_archivo_3,friendlyName:sol.nombre_archivo_3.split('-',2)[1]}
              sol.archivos.push(fileTable)
              sol.fileCant=3;
            } if(sol.nombre_archivo_4){
              fileTable = {fileName:sol.nombre_archivo_4,friendlyName:sol.nombre_archivo_4.split('-',2)[1]}
              sol.archivos.push(fileTable)
              sol.fileCant=4;
            } if(sol.nombre_archivo_5){
              fileTable = {fileName:sol.nombre_archivo_5,friendlyName:sol.nombre_archivo_5.split('-',2)[1]}
              sol.archivos.push(fileTable)
              sol.fileCant=5;
            }
            if(sol.fecha_firma){
              lastFecha = new Date(sol.fecha_firma).getDate();
            }

          });
          this.solicitudes = list;
        },
        err => console.error(err)
      );
  }

  onEstadoSelect(event:any) {
    this.params.tg = event.target.value;
    this.getGames();
  }

  onGrupoSelect(event:any) {
    this.params_gr = event.target.value;
    this.getGames();
  }

  onDiaSelect(e:any) {

    /*
    if(e.target.value == 'tghoy'){
      this.date_start = this.getDateForDB(0);
      this.date_end = this.getDateForDB(0);
    }
    if(e.target.value == 'tgweek'){
      this.date_start = this.getDateForDB(0);
      this.date_end = this.getDateForDB(7);;
    }
    if(e.target.value == 'tgmonth'){
      this.date_start = this.getDateForDB(0);
      this.date_end = this.getDateForDB(30);;
    }
    this.getGames();*/
  }

  getDateForDB(dias_hasta:number=0){

    if(!dias_hasta){

      let currentYear: string = new Date().getFullYear().toString();
      let currentDay =  new Date().getDate().toString();
      let currentMonth =  (new Date().getMonth() + 1).toString();
      let currentDayStr = ("00" + currentDay).slice(-2);
      let currentMonthStr = ("00" + currentMonth).slice(-2);

      return currentYear + '-' + currentMonthStr + '-' + currentDayStr;
    }
    else
    {
      let date_hasta = this.addDays(dias_hasta);

      let currentYear: string = date_hasta.getFullYear().toString();
      let currentDay =  date_hasta.getDate().toString();
      let currentMonth =  (date_hasta.getMonth() + 1).toString();
      let currentDayStr = ("00" + currentDay).slice(-2);
      let currentMonthStr = ("00" + currentMonth).slice(-2);

      return currentYear + '-' + currentMonthStr + '-' + currentDayStr;
    }

  }

  addDays(days: number) {
    var result = new Date();
    result.setDate(result.getDate() + days);
    return result;
  }


  setCss (sol:Solicitud){

    if(sol.fecha_firma)
    {
      return 'row-cj';
    }

    return '';

  }

  download(sol: Solicitud){

    let id =  sol.id;

    let file_ctrl = document.getElementById("file_span_" + sol.id);
    if (file_ctrl) file_ctrl.innerText= "...";

    sol.blobArray = new Array<string>();

    sol.archivos?.forEach(item => {
      this.fileService.downloadFile(item.fileName as string)
      .subscribe(
          data => {

            let file_ctrl = document.getElementById("file_span_" + id);
            if (file_ctrl) file_ctrl.innerText= "";

            let objectURL = URL.createObjectURL(data);
            //this.srcImg = objectURL;

            sol.blobArray?.push(objectURL);

            //saveAs(data, item.fileName as string)
          },
          error => console.error(error)
      );

    });

    this.getTicket(sol);

    setTimeout(() => {

      console.log("Delayed for 4 second.");

      var img0 = document.getElementById("img_0") as HTMLImageElement;
      var img1 = document.getElementById("img_1") as HTMLImageElement;
      var img2 = document.getElementById("img_2") as HTMLImageElement;

      if(img0)
      {
        img0.src = img0.src.substring(7, img0.src.length)
      }
      if(img1)
      {
        img1.src = img1.src.substring(7, img1.src.length)
      }
      if(img2)
      {
        img2.src = img2.src.substring(7, img2.src.length)
      }

    }, 4000)

  }

  downloadReal(sol: Solicitud){

    let id =  sol.id;
    let file_ctrl = document.getElementById("file_span_" + sol.id);
    if (file_ctrl) file_ctrl.innerText= "...";

    sol.blobArray = new Array<string>();

    sol.archivos?.forEach(item => {
      this.fileService.downloadFile(item.fileName as string)
      .subscribe(
          data => {

            let file_ctrl = document.getElementById("file_span_" + id);
            if (file_ctrl) file_ctrl.innerText= "";

            saveAs(data, item.fileName as string)
          },
          error => console.error(error)
      );

    });

  }

    getData(){
      this.getGames();
    }

    //fecha firma
    getGamesFromDate_firma_start(event:any) {
      this.isFechaFirma=true;
      this.date_firma_start = event.target.value;
      this.getGames();
    }

    //fecha firma
    getGamesFromDate_firma_end(event:any) {
      this.isFechaFirma=true;
      this.date_firma_end = event.target.value;
      this.getGames();
    }

    //fecha seña
    getGamesFromDate_sena_start(event:any) {
      this.isFechaFirma=false;
      this.date_sena_start = event.target.value;
      this.getGames();
    }

    //fecha seña
    getGamesFromDate_sena_end(event:any) {
      this.isFechaFirma=false;
      this.date_sena_end = event.target.value;
      this.getGames();
    }

    getTicket(sol: Solicitud){
      if (!sol.refuerzo_total) sol.refuerzo_total= 0;
      if (!sol.pago_total) sol.pago_total= 0;
      if (!sol.lote_total) sol.lote_total= 0;

      this.lbl_resta = sol.lote_total - (sol.refuerzo_total + sol.pago_total)
      this.lbl_pago_parcial = sol.refuerzo_total + sol.pago_total;

      sol.barrio = sessionStorage.getItem('barrio')  as string

      sol.lote_append ='';

      if(sol.id_lote){
        sol.lote_append += sol.id_lote;
      }
      if(sol.id_lote_2){
        sol.lote_append += ', ' + sol.id_lote_2;
      }
      if(sol.id_lote_3){
        sol.lote_append += ', ' + sol.id_lote_3;
      }
      if(sol.id_lote_4){
        sol.lote_append += ', ' + sol.id_lote_4;
      }
      if(sol.id_lote_5){
        sol.lote_append += ', ' + sol.id_lote_5;
      }
      if(sol.id_lote_6){
        sol.lote_append += ', ' + sol.id_lote_6;
      }
      if(sol.id_lote_7){
        sol.lote_append += ', ' + sol.id_lote_7;
      }
      if(sol.id_lote_8){
        sol.lote_append += ', ' + sol.id_lote_8;
      }
      if(sol.id_lote_9){
        sol.lote_append += ', ' + sol.id_lote_9;
      }
      if(sol.id_lote_10){
        sol.lote_append += ', ' + sol.id_lote_10;
      }

      this.sol_modal = sol;

      let element:HTMLElement = document.getElementById('modal_btn') as HTMLElement;
      element.click();

    }

    getTicketAll(){

      this.solicitudes.forEach((soli: Solicitud) => {

        if (!soli.refuerzo_total) soli.refuerzo_total= 0;
        if (!soli.pago_total) soli.pago_total= 0;
        if (!soli.lote_total) soli.lote_total= 0;

        soli.parcial_lbl = soli.refuerzo_total + soli.pago_total;
        soli.resta_lbl = soli.lote_total - (soli.refuerzo_total + soli.pago_total)
        soli.barrio = sessionStorage.getItem('barrio')  as string

      });

      let element:HTMLElement = document.getElementById('modal_btn_all') as HTMLElement;
      element.click();

    }


}
