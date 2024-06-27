import { async } from '@angular/core/testing';


import { FileService } from '../../../services/file.service';
import { Component, OnInit, HostBinding } from '@angular/core';
import { Solicitud, FileRes, Usuario, EnumLotes, LotesParams, Lotes, LotesFilterOptions, Provincias } from 'src/app/models/Model';
import { FileItem, FileLikeObject, FileSelectDirective, FileUploader} from 'ng2-file-upload'
import {saveAs} from 'file-saver';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { GlobalVariable } from '../../../global';
import Swal from 'sweetalert2';
import { NgxImageCompressService } from 'ngx-image-compress';

const uri = GlobalVariable.BASE_API_URL + "/file/importxls"

@Component({
  selector: 'app-import-xsl',
  templateUrl: './pagos-import.component.html',
  styleUrls: ['./pagos-import.component.css']
})

export class PagosImportComponent implements OnInit {

  uploader:FileUploader = new FileUploader({url:uri});

  selectedRotulo = '';
  selectedCuentaDebito = '';
  selectedConcepto = '';
  fechaPago: string = '';
  cargaArchivoSeleccionada = false;
  nombre_archivo: string = '';
  filesUploaded = false;
  buttonText = 'Subir Archivo';
  errorMessage = '';

  constructor(
    private fileService: FileService,
    private route: ActivatedRoute,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private imageCompress: NgxImageCompressService ) {


      this.uploader.onBeforeUploadItem = (item: FileItem) => {

        item.withCredentials = false;   

        item.file.name= sessionStorage.getItem('nombre') as unknown as string + "-" +
        this.selectedConcepto + "-" +
        this.selectedRotulo;
        
      }

      this.uploader.onCompleteItem=(item:any, response:any,status:any, headers:any) =>{  

        this.filesUploaded = true;
        this.buttonText = "Completado";
        item.withCredentials = false;

        const parsedResponse = JSON.parse(response);

        try {

          if (parsedResponse.id) {
            this.router.navigate(['/pagoslist/' + parsedResponse.id]);
          } else {
            this.errorMessage = parsedResponse.message;
          }
        } catch (error) {
          this.errorMessage = 'Carga fallida';
        }
      }

      this.uploader.onProgressItem=(fileItem:any, progress:any) =>{
        this.buttonText = "Importando..";
      }
  }


  ngOnInit(): void {    

    this.selectedRotulo = 'TR009V77'; // Asigna el valor inicial para Rótulo
    this.selectedCuentaDebito = 'Cuenta 1'; // Asigna el valor inicial para Cuenta Débito
    this.selectedConcepto = 'Sueldo'; // Asigna el valor inicial para Concepto

  }

  selectCargaArchivo(): void {
    this.cargaArchivoSeleccionada = true;
  }

}

