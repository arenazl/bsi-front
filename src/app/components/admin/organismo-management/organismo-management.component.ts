import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { FileService } from '../../../services/file.service';
import Swal from 'sweetalert2';

interface Organismo {
  ID_Organismo?: number;
  Nombre: string;
  Nombre_Corto: string;
  CUIT: string;
  Direccion_Calle: string;
  Direccion_Numero: string;
  Direccion_Localidad: string;
  Direccion_Codigo_Postal: string;
  Sucursal_Bapro: string;
  Tipo_Organismo?: number;
  Tipo_Estado?: number;
  Estado?: number;
  Codigo_Banco?: string;
  Banco?: string;
  Cuenta_Bancaria?: string;
  CBU?: string;
  Fecha_Alta?: Date;
  Fecha_Baja?: Date;
  Fecha_Modificacion?: Date;
}

@Component({
  selector: 'app-organismo-management',
  templateUrl: './organismo-management.component.html',
  styleUrls: ['./organismo-management.component.css']
})
export class OrganismoManagementComponent implements OnInit {
  organismos: Organismo[] = [];
  filteredOrganismos: Organismo[] = [];
  organismoForm!: FormGroup;
  searchForm!: FormGroup;
  showForm = false;
  isEditing = false;
  loading = false;
  currentOrganismo: Organismo | null = null;
  editingRowId: number | null = null;
  editingForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadOrganismos();
    this.setupSearchFilter();
  }

  private initializeForms(): void {
    this.organismoForm = this.fb.group({
      Nombre: ['', [Validators.required, Validators.minLength(3)]],
      Nombre_Corto: ['', [Validators.required, Validators.maxLength(22)]],
      CUIT: ['', [Validators.required, this.cuitValidator]],
      Direccion_Calle: ['', Validators.required],
      Direccion_Numero: ['', [Validators.required, Validators.maxLength(10)]],
      Direccion_Localidad: ['', Validators.required],
      Direccion_Codigo_Postal: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      Sucursal_Bapro: ['', [Validators.maxLength(50)]],
      Tipo_Organismo: [1],
      Tipo_Estado: [1]
    });

    this.searchForm = this.fb.group({
      searchTerm: ['']
    });

    // Formulario para edición inline
    this.editingForm = this.fb.group({
      Nombre: ['', [Validators.required, Validators.minLength(3)]],
      Nombre_Corto: ['', [Validators.required, Validators.maxLength(22)]],
      CUIT: ['', [Validators.required, this.cuitValidator]],
      Direccion_Calle: ['', Validators.required],
      Direccion_Numero: ['', [Validators.required, Validators.maxLength(10)]],
      Direccion_Localidad: ['', Validators.required],
      Direccion_Codigo_Postal: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      Sucursal_Bapro: ['', [Validators.maxLength(50)]],
      Tipo_Organismo: [1],
      Tipo_Estado: [1]
    });
  }

  private setupSearchFilter(): void {
    this.searchForm.get('searchTerm')?.valueChanges.subscribe(term => {
      this.filterOrganismos(term);
    });
  }

  private filterOrganismos(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredOrganismos = [...this.organismos];
    } else {
      const term = searchTerm.toLowerCase();
      this.filteredOrganismos = this.organismos.filter(org => 
        org.Nombre.toLowerCase().includes(term) ||
        org.CUIT.includes(searchTerm)
      );
    }
  }

  async loadOrganismos(): Promise<void> {
    try {
      this.loading = true;
      const response = await this.fileService.postSelectGenericSP({
        sp_name: 'ORGANISMO_OBTENER_LISTA',
        body: {}
      }).toPromise();

      if (response.estado === 1) {
        this.organismos = response.data || [];
        this.filterOrganismos(this.searchForm.get('searchTerm')?.value || '');
      } else {
        Swal.fire('Error', 'Error al cargar organismos', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      Swal.fire('Error', 'Error al cargar organismos', 'error');
    } finally {
      this.loading = false;
    }
  }

  openNewForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.currentOrganismo = null;
    this.organismoForm.reset({ Tipo_Organismo: 1, Tipo_Estado: 1 });
  }

  editOrganismo(organismo: Organismo): void {
    this.showForm = true;
    this.isEditing = true;
    this.currentOrganismo = organismo;
    this.organismoForm.patchValue(organismo);
  }

  async onSubmit(): Promise<void> {
    if (this.organismoForm.invalid) {
      this.markFormGroupTouched(this.organismoForm);
      return;
    }

    this.loading = true;
    const formData = this.organismoForm.value;

    try {
      const spName = this.isEditing ? 'ORGANISMO_ACTUALIZAR' : 'ORGANISMO_CREAR';
      const body = this.isEditing 
        ? { ...formData, id_organismo: this.currentOrganismo?.ID_Organismo }
        : formData;

      const response = await this.fileService.postInsertGenericSP({
        sp_name: spName,
        body
      }).toPromise();

      if (response.estado === 1) {
        await Swal.fire({
          icon: 'success',
          title: this.isEditing ? 'Actualizado' : 'Creado',
          text: `Organismo ${this.isEditing ? 'actualizado' : 'creado'} exitosamente`
        });
        this.cancelForm();
        await this.loadOrganismos();
      } else {
        throw new Error(response.descripcion);
      }
    } catch (error: any) {
      Swal.fire('Error', error.message || 'Error al guardar', 'error');
    } finally {
      this.loading = false;
    }
  }

  async deleteOrganismo(organismo: Organismo): Promise<void> {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar el organismo ${organismo.Nombre}?`,
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
          sp_name: 'ORGANISMO_ELIMINAR',
          body: { id_organismo: organismo.ID_Organismo }
        }).toPromise();

        if (response.estado === 1) {
          Swal.fire('Eliminado', 'Organismo eliminado exitosamente', 'success');
          await this.loadOrganismos();
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

  cancelForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentOrganismo = null;
    this.organismoForm.reset({ Tipo_Organismo: 1, Tipo_Estado: 1 });
  }

  // Validador personalizado para CUIT
  private cuitValidator(control: AbstractControl): { [key: string]: any } | null {
    const cuit = control.value;
    if (!cuit) return null;

    // CUIT debe tener 11 dígitos sin guiones
    const cuitRegex = /^\d{11}$/;
    if (!cuitRegex.test(cuit)) {
      return { invalidCuit: true };
    }

    return null;
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
  get f() { return this.organismoForm.controls; }

  hasError(field: string, error: string): boolean {
    const control = this.organismoForm.get(field);
    return !!(control?.hasError(error) && (control?.dirty || control?.touched));
  }

  // Métodos para edición inline
  startInlineEdit(organismo: Organismo): void {
    this.editingRowId = organismo.ID_Organismo!;
    this.editingForm.patchValue(organismo);
  }

  cancelInlineEdit(): void {
    this.editingRowId = null;
    this.editingForm.reset();
  }

  async saveInlineEdit(organismo: Organismo): Promise<void> {
    if (this.editingForm.invalid) {
      this.markFormGroupTouched(this.editingForm);
      return;
    }

    this.loading = true;
    const formData = this.editingForm.value;

    try {
      const response = await this.fileService.postInsertGenericSP({
        sp_name: 'ORGANISMO_ACTUALIZAR',
        body: { ...formData, id_organismo: organismo.ID_Organismo }
      }).toPromise();

      if (response.estado === 1) {
        await Swal.fire({
          icon: 'success',
          title: 'Actualizado',
          text: 'Organismo actualizado exitosamente',
          timer: 1500,
          showConfirmButton: false
        });
        this.cancelInlineEdit();
        await this.loadOrganismos();
      } else {
        throw new Error(response.descripcion);
      }
    } catch (error: any) {
      Swal.fire('Error', error.message || 'Error al actualizar', 'error');
    } finally {
      this.loading = false;
    }
  }

  isEditingRow(organismo: Organismo): boolean {
    return this.editingRowId === organismo.ID_Organismo;
  }

  hasEditingError(field: string, error: string): boolean {
    const control = this.editingForm.get(field);
    return !!(control?.hasError(error) && (control?.dirty || control?.touched));
  }
}