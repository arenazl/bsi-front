import { EnumLotes, FileForTable, FinPago, Lotes, Refuerzo, Ventas } from './../../models/Model';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { LegajoService } from '../../services/legajo.service';
import { Component, OnInit, HostBinding, AfterViewInit, ElementRef, SecurityContext } from '@angular/core';
import { Solicitud, Usuario, Params } from 'src/app/models/Model';
import { FileService } from './../../services/file.service';
import {saveAs} from 'file-saver';
import { SharedService } from 'src/app/services/shared.service';
import Swal from 'sweetalert2';
import {DomSanitizer, SafeUrl} from '@angular/platform-browser';
import { LotesService } from 'src/app/services/lotes.service';



@Component({
  selector: 'app-games-list',
  templateUrl: './games-list.component.html',
  styleUrls: ['./games-list.component.css'],
})
export class GamesListComponent implements OnInit, AfterViewInit {

  @HostBinding('class') classes = 'row';

  solicitudes: any = [];
  usuario = <Usuario>{};
  ventas: any = [];
  isChecked: boolean=false;
  fin = <FinPago>{};
  sol_modal =<Solicitud>{};
  srcImg: string | null = '';

  lbl_resta=0;
  lbl_pago_parcial=0;

  ld_header:boolean=false;

  params = <Params>{tg:1,id_barrio:0};
  params_gr = 0;
  param_dt = "";

  date_firma_start = this.getDateForDB(0);
  date_firma_end = this.getDateForDB(7);

  date_sena_start = this.getDateForDB(0);
  date_sena_end = this.getDateForDB(7);

  isFechaFirma=true;

  blobArray = new Array<string>();

  firstItemOfDay = new Array<any>();

  constructor(private legajoService: LegajoService,
              private router: Router,
              private fileService: FileService,
              private sharedService:SharedService,
              private lotesService: LotesService,
              private sanitizer: DomSanitizer) { }

  ngAfterViewInit(): void {
  }

  closeRanking(id: any){

    let myElement = document.getElementById(id);
    if(myElement)
      myElement.style.display = "none";
  }

  ngOnInit() {
    this.getGames();
  }

  getData(){
    this.getGames();
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
    this.params.grupo = sessionStorage.getItem('id_grupo') as unknown as number

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

    this.params.id_agenda = 0;

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

  rechazar(sol: Solicitud){

    Swal.fire({
      title: 'Rechazar carpeta de ' + sol.denominacion,
      input: 'textarea',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Rechazar',
      showLoaderOnConfirm: true,
      preConfirm: (login) => {

          sol.observaciones_a = login;
          sol.id_estado = 3;
          sol.estado = 'Rechazado';
          sol.archivos=undefined;
          sol.lote_append=undefined;
          sol.parcial_lbl=undefined;
          sol.resta_lbl=undefined;
          sol.fileCant=undefined;

          if(sol.id_lote){
            let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote,id_barrio:sol.id_barrio as number};
            this.lotesService.updateLote(sol.id_lote, lote)
            .subscribe(
              res => {
              },
              err => console.error(err)
            );
          }
          if(sol.id_lote_2){
            let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote_2,id_barrio:sol.id_barrio as number};
            this.lotesService.updateLote(sol.id_lote, lote)
            .subscribe(
              res => {
              },
              err => console.error(err)
            );
          }
          if(sol.id_lote_3){
            let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote_3,id_barrio:sol.id_barrio as number};
            this.lotesService.updateLote(sol.id_lote, lote)
            .subscribe(
              res => {
              },
              err => console.error(err)
            );
          }
          if(sol.id_lote_4){
            let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote_4,id_barrio:sol.id_barrio as number};
            this.lotesService.updateLote(sol.id_lote, lote)
            .subscribe(
              res => {
              },
              err => console.error(err)
            );
          }
          if(sol.id_lote_5){
            let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote_5,id_barrio:sol.id_barrio as number};
            this.lotesService.updateLote(sol.id_lote, lote)
            .subscribe(
              res => {
              },
              err => console.error(err)
            );
          }
          if(sol.id_lote_6){
            let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote_6,id_barrio:sol.id_barrio as number};
            this.lotesService.updateLote(sol.id_lote, lote)
            .subscribe(
              res => {
              },
              err => console.error(err)
            );
          }
          if(sol.id_lote_7){
            let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote_7,id_barrio:sol.id_barrio as number};
            this.lotesService.updateLote(sol.id_lote, lote)
            .subscribe(
              res => {
              },
              err => console.error(err)
            );
          }
          if(sol.id_lote_8){
            let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote_8,id_barrio:sol.id_barrio as number};
            this.lotesService.updateLote(sol.id_lote, lote)
            .subscribe(
              res => {
              },
              err => console.error(err)
            );
          }
          if(sol.id_lote_9){
            let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote_9,id_barrio:sol.id_barrio as number};
            this.lotesService.updateLote(sol.id_lote, lote)
            .subscribe(
              res => {
              },
              err => console.error(err)
            );
          }
          if(sol.id_lote_10){
            let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote_10,id_barrio:sol.id_barrio as number};
            this.lotesService.updateLote(sol.id_lote, lote)
            .subscribe(
              res => {
              },
              err => console.error(err)
            );
          }

          this.legajoService.updateGame(sol.id, sol)
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

  deleteGame(sol: Solicitud) {

    Swal.fire({
      title: 'Eliminar Solicitud ' + sol.denominacion,
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      showLoaderOnConfirm: true,
      preConfirm: (login) => {

        if(sol.id_lote){
          let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote,id_barrio:sol.id_barrio as number};
          this.lotesService.updateLote(sol.id_lote, lote)
          .subscribe(
            res => {
            },
            err => console.error(err)
          );
        }
        if(sol.id_lote_2){
          let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote_2,id_barrio:sol.id_barrio as number};
          this.lotesService.updateLote(sol.id_lote, lote)
          .subscribe(
            res => {
            },
            err => console.error(err)
          );
        }
        if(sol.id_lote_3){
          let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote_3,id_barrio:sol.id_barrio as number};
          this.lotesService.updateLote(sol.id_lote, lote)
          .subscribe(
            res => {
            },
            err => console.error(err)
          );
        }
        if(sol.id_lote_4){
          let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote_4,id_barrio:sol.id_barrio as number};
          this.lotesService.updateLote(sol.id_lote, lote)
          .subscribe(
            res => {
            },
            err => console.error(err)
          );
        }
        if(sol.id_lote_5){
          let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote_5,id_barrio:sol.id_barrio as number};
          this.lotesService.updateLote(sol.id_lote, lote)
          .subscribe(
            res => {
            },
            err => console.error(err)
          );
        }
        if(sol.id_lote_6){
          let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote_6,id_barrio:sol.id_barrio as number};
          this.lotesService.updateLote(sol.id_lote, lote)
          .subscribe(
            res => {
            },
            err => console.error(err)
          );
        }
        if(sol.id_lote_7){
          let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote_7,id_barrio:sol.id_barrio as number};
          this.lotesService.updateLote(sol.id_lote, lote)
          .subscribe(
            res => {
            },
            err => console.error(err)
          );
        }
        if(sol.id_lote_8){
          let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote_8,id_barrio:sol.id_barrio as number};
          this.lotesService.updateLote(sol.id_lote, lote)
          .subscribe(
            res => {
            },
            err => console.error(err)
          );
        }
        if(sol.id_lote_9){
          let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote_9,id_barrio:sol.id_barrio as number};
          this.lotesService.updateLote(sol.id_lote, lote)
          .subscribe(
            res => {
            },
            err => console.error(err)
          );
        }
        if(sol.id_lote_10){
          let lote: Lotes={estado:EnumLotes.Disponible, id:sol.id_lote_10,id_barrio:sol.id_barrio as number};
          this.lotesService.updateLote(sol.id_lote, lote)
          .subscribe(
            res => {
            },
            err => console.error(err)
          );
        }

        this.legajoService.deleteGame(sol.id as unknown as string)
        .subscribe(
          res => {
            this.getGames();
          },
          err => console.error(err)
        )

      },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Eliminado!'
          })
        }
      })

  }

  enviarSol(sol: Solicitud) {

    Swal.fire({
      title: 'Confirma que el cliente ' + sol.denominacion + ' ya finalizo el pago de la seña y que quiere enviar la solicitud para su control?',
      input: 'textarea',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Enviar a Documentacion',
      showLoaderOnConfirm: true,
      preConfirm: (text) => {

        sol.id_estado = 5; //documentacion
        sol.estado = 'Documentacion';
        sol.observaciones_v =text;

        sol.archivos = undefined;
        sol.lote_append = undefined;
        sol.parcial_lbl=undefined;
        sol.resta_lbl=undefined;
        sol.fileCant=undefined;

        this.legajoService.updateGame(sol.id, sol)
        .subscribe(
          res => {
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

  enviarRefuerzo(sol: Solicitud){

    if (!sol.refuerzo_total) sol.refuerzo_total= 0;
    if (!sol.pago_total) sol.pago_total= 0;
    if (!sol.lote_total) sol.lote_total= 0;

    let refuerzo = <Refuerzo>{};

    //let resta = (sol.lote_total - (sol.refuerzo_total + sol.pago_total))

    Swal.fire({
    title: 'Agregar seña para ' + sol.denominacion,
    html:
    '<h5> Total abonado hasta ahora: $' + (sol.refuerzo_total + sol.pago_total)  +' </h4>' +
    '<input id="swal-input1" type="number" value="' + 0 + '" class="swal2-input">' +
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

        refuerzo.monto = sol.refuerzo_total + Number(monto.value);
        refuerzo.nota = nota.value;

        this.legajoService.saveRefuerzo(refuerzo)
        .subscribe(
          res => {
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

  download(sol: Solicitud){

    let id =  sol.id;
    let file_ctrl = document.getElementById("file_span_" + sol.id);
    if (file_ctrl) file_ctrl.innerText= "...";

    this.getTicket(sol);

    sol.blobArray = new Array<string>();
    let i=0;

    sol.archivos?.forEach(item => {

      this.fileService.downloadFile(item.fileName as string)
      .subscribe(
          data => {
            i++;
            let file_ctrl = document.getElementById("file_span_" + id);
            if (file_ctrl) file_ctrl.innerText= "";

            let objectURL = URL.createObjectURL(data);
            sol.blobArray?.push(objectURL);

            if(i === sol?.archivos?.length) {
              this.removePrefix();
            }
          },
          error => console.error(error)
      );

    });

  }

  removePrefix(){

    setTimeout(() => {

      var img0 = document.getElementById("img_0") as HTMLImageElement;
      var img1 = document.getElementById("img_1") as HTMLImageElement;
      var img2 = document.getElementById("img_2") as HTMLImageElement;
      var img3 = document.getElementById("img_3") as HTMLImageElement;
      var img4 = document.getElementById("img_4") as HTMLImageElement;
      var img5 = document.getElementById("img_5") as HTMLImageElement;
      var img6 = document.getElementById("img_6") as HTMLImageElement;

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
      if(img3)
      {
        img3.src = img3.src.substring(7, img3.src.length)
      }
      if(img4)
      {
        img4.src = img4.src.substring(7, img4.src.length)
      }
      if(img5)
      {
        img5.src = img5.src.substring(7, img5.src.length)
      }
      if(img6)
      {
        img6.src = img6.src.substring(7, img6.src.length)
      }
    }, 30);

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

  editar(sol: Solicitud){
    this.router.navigate(['/legajo/add/' +  sol.id]);
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

    setCss (sol:Solicitud){

      if(sol.fecha_firma)
      {
        return 'row-cj';
      }

      return '';

  }

  isFirstElemenet (sol:Solicitud){

    if(this.firstItemOfDay.find(element => element == sol.id))
      return true;
    else
      return false;
  }

}
