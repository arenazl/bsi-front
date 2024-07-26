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
  selectedEnte = '';

  tipo = '';
  contrato = '';

  conceptosList: any[] = [];

  cargaArchivoSeleccionada = false;
  conceptoSeleccionado = false;

  nombre_archivo: string = '';
  filesUploaded = false;
  buttonText = 'Subir Archivo';
  errorMessage = '';
  pageTitle = '';

  fechaPago = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];

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
        this.contrato + "-" +
        this.selectedConcepto.replace('-', '.').trim() + "-" +
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

      this.tipo = params["tipo"];
      this.contrato = params["contrato"];

      this.pageTitle = this.genTitle(this.tipo, this.contrato);

      this.fileService.ObtenerContratoById(1, 71, parseInt(this.contrato)).subscribe((data: any) => {

        if (this.tipo == 'pagos') {

          this.ld_header = false;

          this.selectedRotulo = data[0].Rotulo;
          this.selectedCuentaDebito = data[0].Cuenta_Debito;

          this.conceptosList = data[0].Concepto.split(',');

          if (this.conceptosList.length === 1) {
            this.selectedConcepto = this.conceptosList[0];
            this.conceptoSeleccionado = true;
          } else {
            this.selectedConcepto = '';
          }
        }

        else if (this.tipo == 'altas') {


          this.selectedRotulo = data[0].Rotulo;
          this.selectedEnte = data[0].Ente;

          this.ld_header = false;

        }

      });

    });

  }

  genTitle(type: string, contrato: string): string {

    if (type == 'pagos' && contrato == '3') {
      return 'Pago de Beneficios';
    } else if (type == 'altas' && contrato == '3') {
      return 'Alta de Cuentas desde plantillas';
    } else
      return "";

  }

  conceptoChange(event: any) {
    if (event === 'SELECCIONAR' || event === '') {
      this.conceptoSeleccionado = false;
    } else {
      this.conceptoSeleccionado = true;
    }
  }

  formatDateForFile(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = (date.getDate() + 1).toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }

  selectCargaArchivo(): void {
    this.cargaArchivoSeleccionada = true;
  }

}
