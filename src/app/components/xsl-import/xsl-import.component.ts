import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalVariable } from '../../../environments/global';
import { FileService } from '../../services/file.service';
import { TipoModulo } from 'src/app/enums/enums';

@Component({
  selector: 'app-xsl-xsl',
  templateUrl: './xsl-import.component.html',
  styleUrls: ['./xsl-import.component.css']
})
export class XslImportComponent implements OnInit {
  uploader: any;
  formGroup: FormGroup;
  tipoModulo: string = '';
  contrato: string = '';
  conceptosList: string[] = [];
  cargaArchivoSeleccionada = false;
  conceptoSeleccionado = false;
  filesUploaded = false;
  buttonText = 'Subir Archivo';
  errorMessage = '';
  pageTitle = '';
  fechaPago: string = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
  ld_header = true;
  controls: any[] = [];
  showFechaPago = false;
  showOpcionesCarga = false;
  uri = GlobalVariable.BASE_API_URL + "/file";

  ENTE="";
  ROTULO="";

  constructor(
    private fb: FormBuilder,
    private fileService: FileService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.formGroup = this.fb.group({});
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {

      this.fileService.clearValidationData();

      this.tipoModulo = params['tipomodulo'].toUpperCase();
      this.contrato = params['contrato'].toUpperCase();

      this.pageTitle = this.genTitle(this.tipoModulo, this.contrato);

      this.setUpUploader(this.tipoModulo as TipoModulo);

      this.fileService.ObtenerContratoById(1, 71, parseInt(this.contrato)).subscribe((data: any) => {
        this.ld_header = false;
        this.initializeControls(data[0]);
      });
    });

    this.uploader.onBeforeUploadItem = (item: FileItem) => {

      item.withCredentials = false;
      item.file.name = this.getFilename(this.tipoModulo);
      item.file.name =  item.file.name.replace(/\s+/g, '');
    };

    this.uploader.onCompleteItem = (item: any, response: any) => {

      this.filesUploaded = true;
      this.buttonText = 'Completado'

      const parsedResponse = JSON.parse(response);
        
      this.router.navigate(['/xslVerified/' + this.tipoModulo + '/' + parsedResponse.ID]);
      
    };

    this.uploader.onProgressItem = () => {
      this.buttonText = 'Importando, espere por favor ...';
    };

  }
  setUpUploader(tipoModulo: TipoModulo) {

    if (tipoModulo == TipoModulo.PAGOS) { this.uploader = new FileUploader({ url: this.uri + '/PagoValidarEntrada' }); }
    if (tipoModulo == TipoModulo.CUENTA) { this.uploader = new FileUploader({ url: this.uri + '/CuentaValidarEntrada' }); }
  }

  initializeControls(data: any): void {

    this.ENTE = data.Ente;
    this.ROTULO = data.Rotulo;

    this.controls = [];
    this.formGroup = this.fb.group({});

    if (this.tipoModulo == TipoModulo.PAGOS) {

      sessionStorage.setItem('Rotulo', data.Rotulo);

      this.controls.push(
        { type: 'input', label: 'Rótulo', id: 'rotulo', model: data.Rotulo, readonly: true, inputType: 'text' },
        { type: 'input', label: 'Cuenta Débito', id: 'cuentaDebito', model: data.Cuenta_Debito, readonly: true, inputType: 'text' }
      );

      this.conceptosList = data.Concepto.split(',');

      if (this.conceptosList.length === 1) {
        this.controls.push({ type: 'input', label: 'Concepto', id: 'concepto', model: this.conceptosList[0], readonly: true, inputType: 'text' });
        this.conceptoSeleccionado = true;
      } else {
        this.controls.push({
          type: 'select',
          label: 'Concepto',
          id: 'concepto',
          model: this.conceptosList[0],
          options: this.conceptosList
        });
      }

      this.showFechaPago = true;

    }
    else if (this.tipoModulo == TipoModulo.CUENTA) {
      
      this.controls.push(
        { type: 'input', label: 'Rótulo', id: 'rotulo', model: data.Rotulo, readonly: true, inputType: 'text' },
        { type: 'input', label: 'Ente', id: 'ente', model: data.Ente, readonly: true, inputType: 'text' }
      );
    }

    this.showOpcionesCarga = this.tipoModulo === TipoModulo.CUENTA || this.conceptoSeleccionado;

    this.controls.forEach(control => {
      this.formGroup.addControl(control.id, this.fb.control(control.model));
    });

    if (this.showFechaPago) {
      this.formGroup.addControl('fechaPago', this.fb.control(this.fechaPago));
    }
  }

  genTitle(type: string, contrato: string): string {
    const titles: { [key: string]: { [key: string]: string } } = {
      'pagos': {
        '1': 'Pago de Haberes',
        '2': 'Pago de Embargos (otros Bancos)',
        '3': 'Pago de Beneficios',
        '4': 'Pago de Proveedores',
        '9': 'Pago de Honorarios',
        '10': 'Pago de Embargos (Banco Provincia)'
      },
      'altas': {
        '3': 'Alta de Cuentas desde plantillas'
      }
    };

    return titles[type] && titles[type][contrato] ? titles[type][contrato] : '';
  }

  selectCargaArchivo(): void {
    this.cargaArchivoSeleccionada = true;
  }

  getFilename(tipo: string): string {
    if (tipo === 'PAGO') 
      {

      return `${sessionStorage.getItem('Id')}-
              ${sessionStorage.getItem('IdOrganismo')}-
              ${this.contrato}-
              ${this.formGroup.get('concepto')?.value.replace('-', '.').trim()}-
              ${this.formatDateForFile(this.formGroup.get('fechaPago')?.value)}`;

    } else if (tipo === 'CUENTA') 
      {
      return `${sessionStorage.getItem('Id')}-
              ${sessionStorage.getItem('IdOrganismo')}-
              ${this.contrato}-
              ${this.ROTULO}-
              ${this.ENTE}` ;
    } else {
      return '';
    }
  }

  formatDateForFile(dateString: string): string {
    const date = new Date(dateString);
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
      console.log(this.formGroup.value);
    }
  }
}
