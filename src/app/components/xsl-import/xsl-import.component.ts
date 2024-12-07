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
import { json } from 'stream/consumers';

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
  contrato = 0;
  tipocontrato = '';
  user = 0;
  organismo = 0;
  conceptoSeleccionado = '';
  pageTitle = '';
  fileNameTemplate = '';
  modalidad='';
  data: any;
  contratos:any;

  userHasSelected: boolean = false;

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
    
      this.tipocontrato = params['contrato'].toUpperCase();

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

    this.user = sessionStorage.getItem('idUser') as unknown as number;
    this.organismo = sessionStorage.getItem('IdOrganismo') as unknown as number;
    this.contratos =  JSON.parse(sessionStorage.getItem('Contratos') as unknown as string)

  }

  private loadContractData(): void {

    this.contrato = this.getContratoByTipoContrato(this.tipocontrato)
  
    this.fileService.getContratoById(this.user, this.organismo, this.contrato).subscribe(
      (resData: dbResponse) => this.handleContractData(resData),
      error => console.error('Error loading contract data:', error)
    );
  }

  getContratoByTipoContrato(tipocontrato: string): number {

    const contratosList = this.contratos;
  
    if (!contratosList || contratosList.length === 0) {
      console.warn("No hay contratos disponibles.");
      return 0;
    }
  
    let modalidadBuscada = '';
    if (tipocontrato === 'JUDICIALESBAPRO') {
      modalidadBuscada = 'JUDICIALES - EMBARGOS Banco Provincia';
    } else if (tipocontrato === 'JUDICIALESOTROS') {
      modalidadBuscada = 'JUDICIALES - EMBARGOS Otros Bancos';
    } else {
      modalidadBuscada = tipocontrato; 
    }
  
    const contratoEncontrado = contratosList.find((con: { Modalidad: string; }) => con.Modalidad === modalidadBuscada);
  
    if (contratoEncontrado) {
      return contratoEncontrado.Contrato_ID;
    } else {
      console.warn(`No se encontró un contrato para la modalidad: ${modalidadBuscada}`);
      return 0;
    }
  }
  
  private handleContractData(resData: dbResponse): void {
    this.data = resData.data;
    this.setSessionData(resData.data);
    this.loadMetadata();
  }

  private setSessionData(data: any): void {

    sessionStorage.setItem('Rotulo', data.Rotulo);
    sessionStorage.setItem('IdContrato', this.contrato.toString());
    sessionStorage.setItem('Concepto', data.Concepto);
    sessionStorage.setItem('Ente', data.Ente);

  }

  private loadMetadata(): void {

    this.fileService.getMetaData(this.tipoModulo as TipoModulo, TipoMetada.IMPORT, this.contrato.toString()).subscribe(
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
  
    if (options.length > 0) {
      // Default to the first option initially
      formControl?.setValue(options[0].id);
      this.conceptoSeleccionado = options[0].value;
  
      // Enable/disable the dropdown based on number of options
      control.disabled = options.length === 1;
    }
  }


  optionChanged(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.userHasSelected = true; // Mark that the user interacted
    this.conceptoSeleccionado = target.options[target.selectedIndex].text; // Update the selected value
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

    this.conceptoSeleccionado = sessionStorage.getItem('Concepto') || '';

    if (!this.userHasSelected) {
      {
        if (this.conceptoSeleccionado.includes(',')) {
          this.conceptoSeleccionado = this.conceptoSeleccionado.split(',')[0].trim();
        }
      }
    }

    return this.fileNameTemplate
      .replace('${tipoModulo}', this.tipoModulo)
      .replace('${idUser}', this.user.toString())
      .replace('${idOrganismo}', this.organismo.toString())
      .replace('${contrato}', this.contrato.toString())
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