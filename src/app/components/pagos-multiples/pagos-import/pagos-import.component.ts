import { async } from '@angular/core/testing';


import { FileService } from '../../../services/file.service';
import { Component, OnInit, HostBinding } from '@angular/core';
import { Solicitud, FileRes, Usuario, EnumLotes, LotesParams, Lotes, LotesFilterOptions, Provincias } from 'src/app/models/Model';
import { FileItem, FileLikeObject, FileSelectDirective, FileUploader } from 'ng2-file-upload'
import { saveAs } from 'file-saver';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { GlobalVariable } from '../../../../environments/global';
import Swal from 'sweetalert2';
import { NgxImageCompressService } from 'ngx-image-compress';
import { Item } from '../../../models/Model';

const uri = GlobalVariable.BASE_API_URL + "/file/importxls"

@Component({
  selector: 'app-import-xsl',
  templateUrl: './pagos-import.component.html',
  styleUrls: ['./pagos-import.component.css']
})

export class PagosImportComponent implements OnInit {

  uploader: FileUploader = new FileUploader({ url: uri });

  selectedRotulo = '';
  selectedCuentaDebito = '';
  selectedConcepto = '';
  pagoType = 0;
  conceptosList: any[] = [];

  cargaArchivoSeleccionada = false;
  nombre_archivo: string = '';
  filesUploaded = false;
  buttonText = 'Subir Archivo';
  errorMessage = '';
  pageTitle = '';
  fechaPago: string = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

  ld_header: boolean = true;

  constructor(
    private fileService: FileService,
    private route: ActivatedRoute,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private imageCompress: NgxImageCompressService) {


    this.uploader.onBeforeUploadItem = (item: FileItem) => {

      item.withCredentials = false;

      item.file.name =
        sessionStorage.getItem('Id') as unknown as string + "-" +
        sessionStorage.getItem('IdOrganismo') as unknown as string + "-" +
        this.pagoType + "-" +
        this.selectedConcepto + "-" +
        this.formatDateForFile(this.fechaPago);
    }

    this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {

      this.filesUploaded = true;
      this.buttonText = "Completado";
      item.withCredentials = false;

      const parsedResponse = JSON.parse(response);

      if (parsedResponse.id) {
        this.router.navigate(['/pagoslist/' + parsedResponse.id]);
      } else {
        this.errorMessage = parsedResponse.message;
      }

    }

    this.uploader.onProgressItem = (fileItem: any, progress: any) => {
      this.buttonText = "Importando, espere por favor ...";
    }
  }

  ngOnInit(): void {

    this.route.params.subscribe((params) => {

      this.pagoType = params["id"];

      this.fileService.getContratosBotones(1, 71).subscribe((data: any) => {

        var selectedButton = data.find((b: any) => b.Contrato_ID == this.pagoType) as Item;

        this.ld_header = false;

        this.pageTitle = selectedButton.Texto_Boton;
        this.selectedRotulo = selectedButton.Rotulo;
        this.selectedCuentaDebito = selectedButton.Cuenta_Debito;
        this.conceptosList = selectedButton.Concepto.split(',')
        this.selectedConcepto = '';

      });


    });

  }


  formatDateForFile(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }

  selectCargaArchivo(): void {
    this.cargaArchivoSeleccionada = true;
  }

}

