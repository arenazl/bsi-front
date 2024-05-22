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

const uri = GlobalVariable.BASE_API_URL + "/file/uploadtr"

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

  motivoSeleccionado="";
  conceptoSeleccionado="";

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

        item.file.name= sessionStorage.getItem('nombre') as unknown as string + "-" +
                        this.conceptoSeleccionado + "-" +
                        this.motivoSeleccionado;
      }

      this.uploader.onCompleteItem=(item:any, response:any,status:any, headers:any) =>{

        item.withCredentials = false;

        /*
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
        }*/


        this.attachments.push(JSON.parse(response));
        
        if(this.uploader.queue.length == this.attachments.length)
        {
          this.filesUploaded=true;
          this.upload_text = "Listo"
          
          this.router.navigate(['/auditoria/' + JSON.parse(response).id]);
        }
    
      }

      this.uploader.onProgressItem=(fileItem:any, progress:any) =>{

        this.upload_text = "espere mientras actualizamos..."
        this.phase2 = true;
      }
  }

  ngOnInit() {

    //this.getLotes();
    //this.getProvincias();

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

  onMotivoSelect(event:any) 
  {
    this.conceptoSeleccionado = event.target.value;
  }

  onConceptoSelect(event:any) 
  {
    this.motivoSeleccionado = event.target.value;
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



}
