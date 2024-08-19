import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FileUploader, FileItem } from 'ng2-file-upload';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalVariable } from '../../../environments/global';
import { FileService } from '../../services/file.service';
import { TipoMetada, TipoModulo } from 'src/app/enums/enums';
import { ChangeDetectorRef } from '@angular/core';

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
  uploadUrl="";
  fechaPago: string = new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
  ld_header = true;
  controls: any[] = [];
  showFechaPago = false;
  uri = GlobalVariable.BASE_API_URL + "/file";
  ENTE="";
  ROTULO="";
  FileNameTemplate="";
  data:any;

  constructor(
    private fb: FormBuilder,
    private fileService: FileService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.formGroup = this.fb.group({});
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {

      this.tipoModulo = params['tipomodulo'].toUpperCase();
      this.contrato = params['contrato'].toUpperCase();

      this.fileService.ObtenerContratoById(1, 71, parseInt(this.contrato)).subscribe((data: any) => {

        this.fileService.getImportMetaDataUI(this.tipoModulo as TipoModulo, this.contrato).subscribe((metadata: any) => {
                              
          const formConfig = metadata[0].metadata_json.FORMS.MODULO;   
          if (formConfig) {
            this.pageTitle = formConfig.TITLE;
            this.uploadUrl = formConfig.UPLOAD_URL;
            this.controls = formConfig.HEADER;
            this.FileNameTemplate = formConfig.FILENAME_TEMPLATE;
            this.uploader = new FileUploader({ url: this.uri + this.uploadUrl }); 
            this.ld_header = false;  
            
            this.data=data[0];
            this.initializeControls(data);

            }

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
            }
           
          });    

      });

    });
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
        if(this.tipoModulo == TipoModulo.PAGOS)  {
            this.loadComboOptions(control.field, '', this.data.Concepto);
          }    
          else{
            this.loadComboOptions(control.field, control.endpoint);
          }
      }
    });
  }

  loadComboOptions(controlField: string, endpoint?: string, staticOptions?: string): void {
    
    this.fileService.getComboOptions(endpoint, staticOptions).subscribe((options) => {

      const control = this.controls.find(c => c.field === controlField);
      if (control) {
        control.options = options.map(option => ({ id: option.id, value: option.value }));
        if (options.length === 1) {       
          this.formGroup.get(controlField)?.setValue(options[0].id);
          control.disabled = true;
        } else {
          this.formGroup.get(controlField)?.setValue(options[0].id);
          control.disabled = false;
        }
      }
    });
  }

  
  selectCargaArchivo(): void {
    this.cargaArchivoSeleccionada = true;
  }


  getFilename(tipo: string): string {

  const conceptoId = this.formGroup.get('Concepto')?.value;
  const control = this.controls.find(c => c.field === 'Concepto');
  const conceptoDescripcion = control?.options.find((o: { id: any; }) => o.id === conceptoId)?.value || '';

    const template = this.FileNameTemplate;
    return template
      .replace('${Id}', sessionStorage.getItem('Id') || '')
      .replace('${IdOrganismo}', sessionStorage.getItem('IdOrganismo') || '')
      .replace('${contrato}', this.contrato || '')
      .replace('${concepto}', conceptoDescripcion || '')
      .replace('${fechaPago}', this.formatDateForFile(this.formGroup.get('FechaPago')?.value) || '')
      .replace('${rotulo}', this.data['Rotulo'] || '')
      .replace('${ente}', this.data['Ente'] || '')
      .replace(/\s+/g, ''); // Quitar espacios en blanco del nombre de archivo
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
