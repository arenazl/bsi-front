import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { GlobalVariable } from '../../../environments/global';
import { FileService } from '../../services/file.service';
import { BsiHelper } from 'src/app/services/bsiHelper.service';
import { TipoMetada, TipoModulo } from 'src/app/enums/enums';
import { dbResponse } from 'src/app/models/Model';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-xsl-import',
  templateUrl: './xsl-import.component.html',
  styleUrls: ['./xsl-import.component.css']
})
export class XslImportComponent implements OnInit {
  // Form-related properties
  formGroup: FormGroup;
  controls: any[] = [];

  // Uploader properties
  uploader: FileUploader;
  uploadUrl = '';
  uri = GlobalVariable.BASE_API_URL + "/Metadata";

  // UI state properties
  isLoading = true;
  cargaArchivoSeleccionada = false;
  filesUploaded = true;
  cargaManual = false;
  cargaNomina = false;
  cargaArchivo = true;
  selectNominaXsl = false;
  showFechaPago = false;
  buttonText = 'Subir Archivo';
  errorMessage: string | null = null;

  // Data properties
  tipoModulo = '';
  contrato = '';
  user = '';
  organismo = '';
  conceptoSeleccionado = '';
  pageTitle = '';
  fileNameTemplate = '';
  modalidad='';
  data: any;

  constructor(
    private fb: FormBuilder,
    private fileService: FileService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private bsiHelper: BsiHelper,
  ) {
    this.formGroup = this.fb.group({});
    this.uploader = new FileUploader({ url: this.uri });
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    this.route.params.subscribe(params => {
      
      this.tipoModulo = params['tipomodulo'].toUpperCase();
      this.contrato = params['contrato'].toUpperCase();

      if( params['modalidad'] != undefined)
      {
        this.modalidad = params['modalidad'].toUpperCase();   
      } 
      else
      {
        this.modalidad = '';
      }
    
      this.loadUserData();
      this.loadContractData();
    });
  }

  private loadUserData(): void {
    this.user = sessionStorage.getItem('idUser') || '';
    this.organismo = sessionStorage.getItem('IdOrganismo') || '';
  }

  private loadContractData(): void {

      if(this.modalidad == 'PROVEEDORES')  this.contrato = "4";
      if(this.modalidad == 'BENEFICIOS')  this.contrato = "3"

    this.fileService.getContratoById(1, 71, parseInt(this.contrato)).subscribe(
      (resData: dbResponse) => this.handleContractData(resData),
      error => console.error('Error loading contract data:', error)
    );
  }

  private handleContractData(resData: dbResponse): void {
    this.data = resData.data;
    this.setSessionData(resData.data);
    this.loadMetadata();
  }

  private setSessionData(data: any): void {

    sessionStorage.setItem('Rotulo', data.Rotulo);
    sessionStorage.setItem('IdContrato', this.contrato);
    sessionStorage.setItem('Concepto', data.Concepto);
    sessionStorage.setItem('Ente', data.Ente);

  }

  private loadMetadata(): void {

    var parametro=this.contrato;

    if(this.modalidad == 'PROVEEDORES' || this.modalidad == "BENEFICIOS")
    {
      parametro = '4';
    }

    this.fileService.getMetaData(this.tipoModulo as TipoModulo, TipoMetada.IMPORT, parametro).subscribe(
      (res: dbResponse) => this.handleMetadata(res),
      error => console.error('Error loading metadata:', error)
    );
  }

  private handleMetadata(res: dbResponse): void {
    const formConfig = res.data;
    if (formConfig) {
      this.setupFormConfig(formConfig);
      this.setupUploader();
      this.initializeControls(this.data);
    }
    this.isLoading = false;
  }

  private setupFormConfig(formConfig: any): void {
    this.pageTitle = formConfig.TITLE;
    this.uploadUrl = formConfig.UPLOAD_URL;
    this.controls = formConfig.HEADER;
    this.fileNameTemplate = formConfig.FILENAME_TEMPLATE;
    this.cargaManual = formConfig.CARGA_OPCIONES_VISIBLE;
    this.cargaNomina = formConfig.CARGA_NOMINA_VISIBLE;
    this.cargaArchivo = formConfig.CARGA_ARCHIVO_VISIBLE;
  }

  private setupUploader(): void {
    this.uploader = new FileUploader({ url: this.uri + this.uploadUrl });
    this.uploader.onBeforeUploadItem = (item: FileItem) => this.beforeUpload(item);
    this.uploader.onCompleteItem = (item: any, response: any) => this.onUploadComplete(response);
    this.uploader.onProgressItem = () => this.buttonText = 'Importando, espere por favor ...';
  }

  private beforeUpload(item: FileItem): void {
    item.file.name = this.getFilename(this.tipoModulo).replace(/\s+/g, '');
    item.withCredentials = false;
  }

  private onUploadComplete(response: any): void {
    const res = JSON.parse(response);
    if (res.estado >= 10) {
      this.handleUploadError(res);
    } else {
      this.handleUploadSuccess(res);
    }
  }

  private handleUploadError(res: any): void {
    Swal.fire({
      title: "Error al subir el archivo",
      text: res.descripcion,
      icon: "error",
    });
    this.buttonText = 'Reintentar';
    const uploadBtn = document.getElementById('uploadBtn');
    uploadBtn?.removeEventListener('click', this.refreshPage);
    uploadBtn?.addEventListener('click', this.refreshPage.bind(this));
  }

  private handleUploadSuccess(res: any): void {

    this.filesUploaded = true;
    this.buttonText = 'Completado';
    if(res.tipo_modulo == TipoModulo.NOMINA) this.tipoModulo = TipoModulo.NOMINA;
    this.router.navigate(['/xslVerified/' + this.tipoModulo + '/' + res.data.id_insertado]);
  }

  initializeControls(data: any = {}): void {
    this.formGroup = this.fb.group({});
    this.controls.forEach(control => {
      let value = data[control.field] || '';
      if (control.type === 'date') {
        value = new Date().toISOString().split('T')[0];
      }
      this.formGroup.addControl(control.field, this.fb.control(value));
      if (control.type === 'select') {
        this.loadComboOptions(control);
      }
    });
  }

  loadComboOptions(control: any): void {
    const endpoint = this.tipoModulo === TipoModulo.PAGO ? '' : control.endpoint;
    const staticOptions = this.tipoModulo === TipoModulo.PAGO ? this.data.Concepto : undefined;
    
    this.fileService.getComboOptions(endpoint, staticOptions).subscribe(
      options => this.handleComboOptions(control, options),
      error => console.error('Error loading combo options:', error)
    );
  }

  private handleComboOptions(control: any, options: any[]): void {
    control.options = options.map(option => ({ id: option.id, value: option.value }));
    const formControl = this.formGroup.get(control.field);
    if (options.length === 1) {
      formControl?.setValue(options[0].id);
      control.disabled = true;
      this.conceptoSeleccionado = options[0].value;
    } else {
      formControl?.setValue(options[0].id);
      control.disabled = false;
    }
  }

  optionChanged(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.conceptoSeleccionado = target.options[target.selectedIndex].text;
  }

  selectCargaArchivo(): void {
    this.cargaArchivoSeleccionada = true;
  }

  selectCargaNomina(): void {
    this.selectNominaXsl = true;
    this.cargaArchivoSeleccionada = true;
  }

  getFilename(tipo: string): string {

    const fechaPago = this.bsiHelper.formatDateForFile(this.formGroup.get('FechaPago')?.value);

    if (this.selectNominaXsl) this.tipoModulo += "_XSL";
    if (this.conceptoSeleccionado !== '') this.conceptoSeleccionado = sessionStorage.getItem('Concepto') || '';

    return this.fileNameTemplate
      .replace('${tipoModulo}', this.tipoModulo)
      .replace('${idUser}', this.user)
      .replace('${idOrganismo}', this.organismo)
      .replace('${contrato}', this.contrato)
      .replace('${concepto}', this.conceptoSeleccionado)
      .replace('${fechaPago}', fechaPago)
      .replace('${rotulo}', this.data['Rotulo'] || '')
      .replace('${ente}', this.data['Ente'] || '')
      .replace(/\s+/g, '');
  }

  navigatToXslEditabletable(): void {
  
    sessionStorage.setItem("fechaPago", this.formGroup.get('FechaPago')?.value);
    this.router.navigate(['/xslEditabletable']);
  }

  onSubmit(): void {
    if (this.formGroup.valid) {
      console.log(this.formGroup.value);
    }
  }

  goBack(): void {
    this.location.back();
  }

  refreshPage(): void {
    window.location.reload();
  }
}