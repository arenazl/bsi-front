import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileService } from '../../../services/file.service';
import Swal from 'sweetalert2';

interface Contrato {
  Contrato_ID: number;
  ID_Organismo: number;
  Informacion_Discrecional?: string;
  Id_Modalidad: number;
  Rotulo: string;
  Ente?: string;
  Cuenta_Debito: string;
  Tipo_Estado?: number;
  Fecha_Alta?: string;
  Fecha_Baja?: string;
  indicativo?: string;
}

interface Organismo {
  ID_Organismo: number;
  Nombre: string;
  CUIT: string;
}

interface Modalidad {
  Id_Modalidad: number;
  id: number;  // alias para compatibilidad con el template
  Modalidad: string;
  descripcion: string;  // alias para compatibilidad con el template
  Texto_Boton: string;
  requiere_ente?: boolean;
}

interface ModalidadFormData {
  Rotulo: string;
  Ente: string;
  Cuenta_Debito: string;
  Informacion_Discrecional: string;
}

@Component({
  selector: 'app-contrato-management',
  templateUrl: './contrato-management.component.html',
  styleUrls: ['./contrato-management.component.css']
})
export class ContratoManagementComponent implements OnInit {
  organismos: Organismo[] = [];
  modalidades: Modalidad[] = [];
  niveles: any[] = [];  // Array para niveles
  contratos: Contrato[] = [];
  filteredContratos: Contrato[] = [];
  organismoForm!: FormGroup;
  contratoForm!: FormGroup;
  searchForm!: FormGroup;
  selectedOrganismoId: number = 0;
  selectedContrato: Contrato | null = null;
  showForm = false;
  isEditing = false;
  loading = false;
  loadingContratos = false;
  editingRowId: number | null = null;
  editingForm!: FormGroup;

  // Listados fijos
  rotulos = [
    { value: 'ABONO', label: 'Abono' },
    { value: 'CONTRIB', label: 'Contribución' },
    { value: 'TASA', label: 'Tasa' },
    { value: 'IMPUESTO', label: 'Impuesto' },
    { value: 'SERVICIO', label: 'Servicio' },
    { value: 'MULTA', label: 'Multa' },
    { value: 'CANON', label: 'Canon' },
    { value: 'PERMISO', label: 'Permiso' },
    { value: 'HABILI', label: 'Habilitación' },
    { value: 'OTROS', label: 'Otros' }
  ];

  entes = [
    { value: '5147', label: 'Banco Provincia (5147)' },
    { value: '0014', label: 'Banco Provincia - Cuenta Corriente (0014)' },
    { value: '0027', label: 'Banco Nación (0027)' },
    { value: '0198', label: 'Banco Ciudad (0198)' },
    { value: '0072', label: 'Banco Santander (0072)' },
    { value: '0150', label: 'Banco HSBC (0150)' },
    { value: '0011', label: 'Banco Nación - Cuenta Corriente (0011)' }
  ];

  constructor(
    private fb: FormBuilder,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadInitialData();
    this.setupSearchFilter();
  }

  private initializeForms(): void {
    this.organismoForm = this.fb.group({
      organismoSeleccionado: ['', Validators.required]
    });

    this.contratoForm = this.fb.group({
      ID_Modalidad: ['', Validators.required],
      ID_Nivel: ['', Validators.required],
      Programa: ['', Validators.required],
      Beneficio: ['', Validators.required],
      Descripcion: [''],
      Estado: [1],
      Id_Modalidad: ['', Validators.required],
      Rotulo: ['', [Validators.required, Validators.maxLength(10)]],
      Ente: ['', Validators.maxLength(4)],
      Cuenta_Debito: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
      Informacion_Discrecional: ['', Validators.maxLength(20)],
      Tipo_Estado: [1]
    });

    this.searchForm = this.fb.group({
      searchTerm: ['']
    });

    // Formulario para edición inline
    this.editingForm = this.fb.group({
      Id_Modalidad: ['', Validators.required],
      Rotulo: ['', [Validators.required, Validators.maxLength(10)]],
      Ente: ['', Validators.maxLength(4)],
      Cuenta_Debito: ['', [Validators.required, Validators.pattern(/^\d{14}$/)]],
      Informacion_Discrecional: ['', Validators.maxLength(20)],
      Tipo_Estado: [1]
    });

    // Observar cambios en el organismo seleccionado
    this.organismoForm.get('organismoSeleccionado')?.valueChanges.subscribe(async (value) => {
      if (value) {
        this.selectedOrganismoId = parseInt(value);
        await this.loadContratosByOrganismo();
      } else {
        this.selectedOrganismoId = 0;
        this.contratos = [];
      }
    });
  }

  private async loadInitialData(): Promise<void> {
    // Cargar niveles de ejemplo
    this.niveles = [
      { id: 1, descripcion: 'Nivel 1 - Básico' },
      { id: 2, descripcion: 'Nivel 2 - Intermedio' },
      { id: 3, descripcion: 'Nivel 3 - Avanzado' },
      { id: 4, descripcion: 'Nivel 4 - Experto' }
    ];

    await Promise.all([
      this.loadOrganismos(),
      this.loadModalidades()
    ]);
  }

  private async loadOrganismos(): Promise<void> {
    console.log('Cargando lista de organismos...');
    try {
      const response = await this.fileService.postSelectGenericSP({
        sp_name: 'ORGANISMO_OBTENER_LISTA',
        body: {}
      }).toPromise();
      
      if (response.estado === 1) {
        this.organismos = response.data || [];
      } else {
        Swal.fire('Error', 'Error al cargar organismos', 'error');
      }
    } catch (error) {
      console.error('Error al cargar organismos:', error);
      Swal.fire('Error', 'Error al cargar organismos', 'error');
    }
  }

  private async loadModalidades(): Promise<void> {
    try {
      const response = await this.fileService.postSelectGenericSP({
        sp_name: 'GetModalidades',
        body: {}
      }).toPromise();
      
      if (response.estado === 1) {
        this.modalidades = (response.data || []).map((m: any) => ({
          ...m,
          id: m.Id_Modalidad,
          descripcion: m.Modalidad
        }));
        this.initializeModalidadForms();
      } else {
        Swal.fire('Error', 'Error al cargar modalidades', 'error');
      }
    } catch (error) {
      console.error('Error al cargar modalidades:', error);
      Swal.fire('Error', 'Error al cargar modalidades', 'error');
    }
  }

  private async loadContratosByOrganismo(): Promise<void> {
    if (!this.selectedOrganismoId) {
      console.log('No hay organismo seleccionado');
      return;
    }
    
    console.log('Cargando contratos para organismo:', this.selectedOrganismoId);
    
    try {
      this.loadingContratos = true;
      // Temporal: probar con GetContratos para ver todos
      const response = await this.fileService.postSelectGenericSP({
        sp_name: 'GetContratos',  // Ver todos los contratos
        body: {}
      }).toPromise();
      
      console.log('Response de contratos:', response);
      
      if (response.estado === 1) {
        this.contratos = response.data || [];
        console.log('Contratos cargados:', this.contratos);
        this.filterContratos(this.searchForm.get('searchTerm')?.value || '');
      } else {
        this.contratos = [];
        this.filteredContratos = [];
      }
    } catch (error) {
      console.error('Error al cargar contratos:', error);
      this.contratos = [];
    } finally {
      this.loadingContratos = false;
    }
  }

  private initializeModalidadForms(): void {
    // Método vacío para mantener compatibilidad
  }

  openNewForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.selectedContrato = null;
    this.contratoForm.reset({ Tipo_Estado: 1 });
  }

  editContrato(contrato: Contrato): void {
    this.showForm = true;
    this.isEditing = true;
    this.selectedContrato = contrato;
    this.contratoForm.patchValue(contrato);
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.selectedContrato = null;
    this.contratoForm.reset({ Tipo_Estado: 1 });
  }

  async onSubmit(): Promise<void> {
    if (!this.selectedOrganismoId) {
      Swal.fire('Error', 'Debe seleccionar un organismo primero', 'error');
      return;
    }

    if (this.contratoForm.invalid) {
      this.markFormGroupTouched(this.contratoForm);
      return;
    }

    this.loading = true;
    const formData = {
      ...this.contratoForm.value,
      ID_Organismo: this.selectedOrganismoId
    };

    try {
      const spName = this.isEditing ? 'CONTRATO_ACTUALIZAR' : 'CONTRATO_CREAR';
      const body = this.isEditing 
        ? { ...formData, contrato_id: this.selectedContrato?.Contrato_ID }
        : formData;

      const response = await this.fileService.postInsertGenericSP({
        sp_name: spName,
        body
      }).toPromise();

      if (response.estado === 1) {
        console.log('Contrato guardado, response:', response);
        await Swal.fire({
          icon: 'success',
          title: this.isEditing ? 'Actualizado' : 'Creado',
          text: `Contrato ${this.isEditing ? 'actualizado' : 'creado'} exitosamente`
        });
        this.cancelForm();
        console.log('Recargando contratos...');
        await this.loadContratosByOrganismo();
        console.log('Contratos después de recargar:', this.contratos);
        console.log('Contratos filtrados:', this.filteredContratos);
      } else {
        throw new Error(response.descripcion);
      }
    } catch (error: any) {
      Swal.fire('Error', error.message || 'Error al guardar', 'error');
    } finally {
      this.loading = false;
    }
  }

  async deleteContrato(contrato: Contrato): Promise<void> {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar el contrato ${contrato.Rotulo}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        this.loading = true;
        const response = await this.fileService.postInsertGenericSP({
          sp_name: 'CONTRATO_ELIMINAR',
          body: { contrato_id: contrato.Contrato_ID }
        }).toPromise();

        if (response.estado === 1) {
          Swal.fire('Eliminado', 'Contrato eliminado exitosamente', 'success');
          await this.loadContratosByOrganismo();
        } else {
          throw new Error(response.descripcion);
        }
      } catch (error: any) {
        Swal.fire('Error', error.message || 'Error al eliminar', 'error');
      } finally {
        this.loading = false;
      }
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Getters para el template
  get f() { return this.contratoForm.controls; }

  hasError(field: string, error: string): boolean {
    const control = this.contratoForm.get(field);
    return !!(control?.hasError(error) && (control?.dirty || control?.touched));
  }

  getModalidadNombre(idModalidad: number): string {
    const modalidad = this.modalidades.find(m => m.Id_Modalidad === idModalidad);
    return modalidad ? modalidad.Modalidad : 'Desconocida';
  }

  // Métodos para búsqueda
  private setupSearchFilter(): void {
    this.searchForm.get('searchTerm')?.valueChanges.subscribe(term => {
      this.filterContratos(term);
    });
  }

  private filterContratos(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredContratos = [...this.contratos];
    } else {
      const term = searchTerm.toLowerCase();
      this.filteredContratos = this.contratos.filter(contrato => 
        contrato.Rotulo.toLowerCase().includes(term) ||
        contrato.Cuenta_Debito.includes(searchTerm) ||
        (contrato.Informacion_Discrecional && contrato.Informacion_Discrecional.toLowerCase().includes(term))
      );
    }
  }

  // Métodos para edición inline
  startInlineEdit(contrato: Contrato): void {
    this.editingRowId = contrato.Contrato_ID;
    this.editingForm.patchValue(contrato);
  }

  cancelInlineEdit(): void {
    this.editingRowId = null;
    this.editingForm.reset();
  }

  async saveInlineEdit(contrato: Contrato): Promise<void> {
    if (this.editingForm.invalid) {
      this.markFormGroupTouched(this.editingForm);
      return;
    }

    this.loading = true;
    const formData = {
      ...this.editingForm.value,
      ID_Organismo: this.selectedOrganismoId
    };

    try {
      const response = await this.fileService.postInsertGenericSP({
        sp_name: 'CONTRATO_ACTUALIZAR',
        body: { ...formData, contrato_id: contrato.Contrato_ID }
      }).toPromise();

      if (response.estado === 1) {
        await Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'Contrato actualizado exitosamente',
          timer: 1500,
          showConfirmButton: false
        });
        this.cancelInlineEdit();
        await this.loadContratosByOrganismo();
      } else {
        throw new Error(response.descripcion);
      }
    } catch (error: any) {
      Swal.fire('Error', error.message || 'Error al actualizar', 'error');
    } finally {
      this.loading = false;
    }
  }

  isEditingRow(contrato: Contrato): boolean {
    return this.editingRowId === contrato.Contrato_ID;
  }

  hasEditingError(field: string, error: string): boolean {
    const control = this.editingForm.get(field);
    return !!(control?.hasError(error) && (control?.dirty || control?.touched));
  }
}