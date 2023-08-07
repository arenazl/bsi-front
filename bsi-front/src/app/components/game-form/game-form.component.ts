import { async } from '@angular/core/testing';
import { LotesService } from './../../services/lotes.service';
import { LegajoService } from '../../services/legajo.service';
import { FileService } from './../../services/file.service';
import { Component, OnInit, HostBinding } from '@angular/core';
import { Solicitud, FileRes, Usuario, EnumLotes, LotesParams, Lotes, LotesFilterOptions, Provincias } from 'src/app/models/Model';
import { FileItem, FileLikeObject, FileSelectDirective, FileUploader} from 'ng2-file-upload'
import {saveAs} from 'file-saver';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { GlobalVariable } from '../../global';
import Swal from 'sweetalert2';
import { NgxImageCompressService } from 'ngx-image-compress';

const uri = GlobalVariable.BASE_API_URL + "/file/upload2"

@Component({
  selector: 'app-game-form',
  templateUrl: './game-form.component.html'
})

export class GameFormComponent implements OnInit {

  @HostBinding('class') clases = 'row';
  usuario = <Usuario>{};

  lotes: any = [];

  provincias: any = []
  localidades: any = []

  loteEstado = {estado:EnumLotes.Reservado};

  uploader:FileUploader = new FileUploader({url:uri});
  attachments:any=[];

  serverfilename_1?:string;
  serverfilename_2?:string;
  serverfilename_3?:string;
  serverfilename_4?:string;
  serverfilename_5?:string;

  edit=false;

  phase1=true;
  phase2=false;

  expand_text_lote='Mas de un lote';
  expand_text_propietario="Mas de un propietario";
  expand_css_l='d-none';
  expand_css_p='d-none';

  upload_text="Subir documentos";
  send_text=" Guardar documentacion";

  filesUploaded:boolean=false;
  loteSeleccionado:number=0;
  provSeleccionado:any;
  lotesFilterOptions = <LotesFilterOptions>{};

  sol: Solicitud = {
    id: 0,
    observaciones_v: '',
    nombre_archivo_1: '',
    nombre_archivo_2: '',
    nombre_archivo_3: '',
    nombre_archivo_4: '',
    nombre_archivo_5: '',
    timestamp: new Date()
  };

  constructor(private legajoService: LegajoService,
              private loteService: LotesService,
              private fileService: FileService,
              private route: ActivatedRoute,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private imageCompress: NgxImageCompressService) {


      this.uploader.onBeforeUploadItem = (item: FileItem) => {

        item.withCredentials = false;
      }

      this.uploader.onCompleteItem=(item:any, response:any,status:any, headers:any) =>{

        item.withCredentials = false;

        if(this.attachments.length ==0)
        {
          this.serverfilename_1 = JSON.parse(response).uploadname;
        }
        if(this.attachments.length ==1)
        {
          this.serverfilename_2 = JSON.parse(response).uploadname;
        }
        if(this.attachments.length ==2)
        {
          this.serverfilename_3 = JSON.parse(response).uploadname;
        }
        if(this.attachments.length ==3)
        {
          this.serverfilename_4 = JSON.parse(response).uploadname;
        }
        if(this.attachments.length ==4)
        {
          this.serverfilename_5 = JSON.parse(response).uploadname;
        }

        this.attachments.push(JSON.parse(response));

        if(this.uploader.queue.length == this.attachments.length)
        {
          this.filesUploaded=true;

        }
      }


      this.uploader.onProgressItem=(fileItem:any, progress:any) =>{
        this.upload_text = "espere mientras actualizamos..."
        this.phase2 = true;
      }
  }

  ngOnInit() {

    this.getLotes();
    this.getProvincias();

    this.route.params.subscribe((params) => {
      const id = params["id"];

      if (id != 0)
      {
        this.edit = true;

        this.legajoService.getGame(id)
        .subscribe(
          res => {
            this.sol = res as Solicitud;
          },
          err => console.error(err)
        )
      }

    });

  }

  showHideLotes(){

    if(this.expand_text_lote == 'Mas de un lote')
    {
      this.expand_text_lote = 'Ocultar lotes';
      this.expand_css_l = 'block'
    }
    else {
    this.expand_text_lote = 'Mas de un lote';
    this.expand_css_l = 'd-none'
    }

  }

  showHidePropietarios(){

    if(this.expand_text_propietario == 'Mas de un propietario')
    {
      this.expand_text_propietario = 'Ocultar propietario';
      this.expand_css_p = 'block'
    }
    else {
    this.expand_text_propietario = 'Mas de un propietario';
    this.expand_css_p = 'd-none'
    }

  }

  getLotes(){

    this.lotesFilterOptions.id_barrio = sessionStorage.getItem('id_barrio') as unknown as number;
    this.lotesFilterOptions.estado = EnumLotes.Reservado;

    this.loteService.getLotes(this.lotesFilterOptions)
    .subscribe(
      res => {
       this.lotes = res as Array<Lotes>;
      },
      err => console.error()
    );
  }

  getProvincias(){

    this.loteService.getProvincias()
    .subscribe(
      res => {
       this.provincias = res as Array<Provincias>;
      },
      err => console.error(err)
    );

  }

  onLoteSelect(event:any, loteCount:number) {

    if(loteCount == 1){
      this.sol.id_lote = event.target.value as number;
    }
    if(loteCount == 2){
      this.sol.id_lote_2 = event.target.value as number;    }
    if(loteCount == 3){
      this.sol.id_lote_3 = event.target.value as number;
    }
    if(loteCount == 4){
      this.sol.id_lote_4 = event.target.value as number;
    }
    if(loteCount == 5){
      this.sol.id_lote_5 = event.target.value as number;
    }
    if(loteCount == 6){
      this.sol.id_lote_6 = event.target.value as number;
    }
    if(loteCount == 7){
      this.sol.id_lote_7 = event.target.value as number;
    }
    if(loteCount == 8){
      this.sol.id_lote_8 = event.target.value as number;
    }
    if(loteCount == 9){
      this.sol.id_lote_9 = event.target.value as number;
    }
    if(loteCount == 10){
      this.sol.id_lote_10 = event.target.value as number;
    }
  }

  onStateSelect(event:any) {

    this.provSeleccionado = event.target.value;

    this.loteService.getLocalidades(this.provSeleccionado)
    .subscribe(
      res => {
       this.localidades = res;
      },
      err => console.error(err)
    );

  }

  download(index: string | number){
    var filename = this.attachments[index].uploadname;

    console.log('arranque');

    this.fileService.downloadFile(filename)
    .subscribe(
        data => {saveAs(data, filename)
          console.log('termine');
        },
        error => console.error(error)
    );
  }

  saveNewGame() {

    this.send_text="Guardando..."

    if(this.sol.denominacion == undefined ||
      this.sol.dni == undefined ||
      this.sol.estado_civil == undefined ||
      this.sol.id_lote == undefined ||
      this.sol.telefono == undefined ||
      this.sol.nombre_archivo_1 == undefined ||
      this.sol.refuerzo_total == undefined ||
      this.sol.lote_total ==  undefined)
      {

        Swal.fire({
          title: 'Faltan Completar Datos',
          confirmButtonText: 'Completar',
          showLoaderOnConfirm: true,
          preConfirm: () => {
          },
            allowOutsideClick: () => !Swal.isLoading()
          }).then((result) => {
            if (result.isConfirmed) {
            }
          })
      }
      else
      {
        this.sol.nombre_archivo_1 = this.serverfilename_1;
        this.sol.nombre_archivo_2 = this.serverfilename_2;
        this.sol.nombre_archivo_3 = this.serverfilename_3;
        this.sol.nombre_archivo_4 = this.serverfilename_4;
        this.sol.nombre_archivo_5 = this.serverfilename_5;

        this.sol.id_barrio = sessionStorage.getItem('id_barrio') as unknown as number
        this.sol.id_grupo = sessionStorage.getItem('id_grupo') as unknown as number;
        this.sol.grupo = sessionStorage.getItem('grupo') as unknown as string;

        this.sol.id_estado= 1;
        this.sol.estado= 'Iniciado';

        if(this.sol.id_lote){
          let lote: Lotes={estado:EnumLotes.Cargado, id:this.sol.id_lote,id_barrio:this.sol.id_barrio};
          this.loteService.updateLote(this.loteSeleccionado, lote)
          .subscribe(
            res => {
             console.log(res);
            },
            err => console.error(err)
          );

        }
        if(this.sol.id_lote_2){
          let lote: Lotes={estado:EnumLotes.Cargado, id:this.sol.id_lote_2,id_barrio:this.sol.id_barrio};
          this.loteService.updateLote(this.loteSeleccionado, lote)
          .subscribe(
            res => {
             console.log(res);
            },
            err => console.error(err)
          );
        }
        if(this.sol.id_lote_3){
          let lote: Lotes={estado:EnumLotes.Cargado, id:this.sol.id_lote_3,id_barrio:this.sol.id_barrio};
          this.loteService.updateLote(this.loteSeleccionado, lote)
          .subscribe(
            res => {
             console.log(res);
            },
            err => console.error(err)
          );
        }
        if(this.sol.id_lote_4){
          let lote: Lotes={estado:EnumLotes.Cargado, id:this.sol.id_lote_4,id_barrio:this.sol.id_barrio};
          this.loteService.updateLote(this.loteSeleccionado, lote)
          .subscribe(
            res => {
             console.log(res);
            },
            err => console.error(err)
          );
        }
        if(this.sol.id_lote_5){
          let lote: Lotes={estado:EnumLotes.Cargado, id:this.sol.id_lote_5,id_barrio:this.sol.id_barrio};
          this.loteService.updateLote(this.loteSeleccionado, lote)
          .subscribe(
            res => {
             console.log(res);
            },
            err => console.error(err)
          );
        }
        if(this.sol.id_lote_6){
          let lote: Lotes={estado:EnumLotes.Cargado, id:this.sol.id_lote_6,id_barrio:this.sol.id_barrio};
          this.loteService.updateLote(this.loteSeleccionado, lote)
          .subscribe(
            res => {
             console.log(res);
            },
            err => console.error(err)
          );
        }
        if(this.sol.id_lote_7){
          let lote: Lotes={estado:EnumLotes.Cargado, id:this.sol.id_lote_7,id_barrio:this.sol.id_barrio};
          this.loteService.updateLote(this.loteSeleccionado, lote)
          .subscribe(
            res => {
             console.log(res);
            },
            err => console.error(err)
          );
        }
        if(this.sol.id_lote_8){
          let lote: Lotes={estado:EnumLotes.Cargado, id:this.sol.id_lote_8,id_barrio:this.sol.id_barrio};
          this.loteService.updateLote(this.loteSeleccionado, lote)
          .subscribe(
            res => {
             console.log(res);
            },
            err => console.error(err)
          );
        }
        if(this.sol.id_lote_9){
          let lote: Lotes={estado:EnumLotes.Cargado, id:this.sol.id_lote_9,id_barrio:this.sol.id_barrio};
          this.loteService.updateLote(this.loteSeleccionado, lote)
          .subscribe(
            res => {
             console.log(res);
            },
            err => console.error(err)
          );
        }
        if(this.sol.id_lote_10){
          let lote: Lotes={estado:EnumLotes.Cargado, id:this.sol.id_lote_10,id_barrio:this.sol.id_barrio};
          this.loteService.updateLote(this.loteSeleccionado, lote)
          .subscribe(
            res => {
             console.log(res);
            },
            err => console.error(err)
          );
        }

        delete this.sol.timestamp;
        delete this.sol.id;

        this.legajoService.saveGame(this.sol)
          .subscribe(
            res => {
              this.router.navigate(['/legajo']);
            },
            err => console.error(err)
        )

      }
  }

  updateGame(){

    this.send_text="Guardando..."

    this.legajoService.updateGame(this.sol.id, this.sol)
    .subscribe(
      res => {
        this.router.navigate(['/auditoria']);
        console.log(res);
      },
      err => console.error(err)
    )
  }

}
