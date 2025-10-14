import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Organismo, OrganismosService } from 'src/app/services/organismos.service';
import Swal from 'sweetalert2';

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
    private organismoService : OrganismosService
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
      Codigo_Banco: [''],
      Banco: [''],
      Cuenta_Bancaria: [''],
      CBU: [''],
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
      Codigo_Banco: [''],
      Banco: [''],
      Cuenta_Bancaria: [''],
      CBU: [''],
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
      const response = await this.organismoService.postSelectGenericSP({
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
    if (!organismo.ID_Organismo) {
      Swal.fire('Error', 'No se puede editar un organismo sin ID.', 'error');
      return;
    }

    this.loading = true;
    this.organismoService.obtenerPorId(organismo.ID_Organismo).subscribe(
      response => {
        if (response && response.estado === 1 && response.data) {
          const organismoDetallado = response.data;
          console.log('Datos recibidos del backend:', organismoDetallado);
          this.showForm = true;
          this.isEditing = true;
          this.currentOrganismo = organismoDetallado;
          this.organismoForm.patchValue(organismoDetallado);
        } else {
          const errorMsg = response.descripcion || 'No se encontraron los detalles del organismo.';
          Swal.fire('Error', errorMsg, 'error');
        }
        this.loading = false;
      },
      error => {
        console.error('Error al obtener detalle del organismo:', error);
        Swal.fire('Error', error.message || 'No se pudieron cargar los datos para editar.', 'error');
        this.loading = false;
      }
    );
  }



  async onSubmit(): Promise<void> {
    if (this.organismoForm.invalid) {
      this.markFormGroupTouched(this.organismoForm);
      return;
    }

    this.loading = true;
    const formData = this.organismoForm.value;

    try {
      if (this.isEditing) {
        // Validación mínima del ID
        if (this.currentOrganismo?.ID_Organismo == null) {
          throw new Error('No se encontró el ID del organismo a actualizar.');
        }

        // Asegurar tipos numéricos donde corresponde
        const id = Number(this.currentOrganismo.ID_Organismo);
        const tipoOrganismo = Number(formData.Tipo_Organismo);
        const tipoEstado = Number(formData.Tipo_Estado);

        const payload = {
          id_organismo: id,
          Nombre: formData.Nombre,
          Nombre_Corto: formData.Nombre_Corto,
          CUIT: formData.CUIT,
          Direccion_Calle: formData.Direccion_Calle,
          Direccion_Numero: formData.Direccion_Numero,
          Direccion_Localidad: formData.Direccion_Localidad,
          Direccion_Codigo_Postal: formData.Direccion_Codigo_Postal,
          Sucursal_Bapro: formData.Sucursal_Bapro,
          Tipo_Organismo: tipoOrganismo,
          Tipo_Estado: tipoEstado
        };

        const response = await this.organismoService.postInsertGenericSP({
          sp_name: 'ORGANISMO_ACTUALIZAR',
          body: payload
        }).toPromise();


        if (response.estado === 1) {
          await Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: 'Organismo actualizado exitosamente'
          });
          this.cancelForm();
          await this.loadOrganismos();
        } else {
          throw new Error(response.descripcion);
        }
      } else {
        // Crear: puede seguir yendo como body (objeto)
        const response = await this.organismoService.postInsertGenericSP({
          sp_name: 'ORGANISMO_CREAR',
          body: formData
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
        const response = await this.organismoService.postInsertGenericSP({
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
      if (organismo.ID_Organismo == null) {
        throw new Error('No se encontró el ID del organismo a actualizar.');
      }

      const id = Number(organismo.ID_Organismo);
      const tipoOrganismo = Number(formData.Tipo_Organismo);
      const tipoEstado = Number(formData.Tipo_Estado);

      const payload = {
        id_organismo: id,
        Nombre: formData.Nombre,
        Nombre_Corto: formData.Nombre_Corto,
        CUIT: formData.CUIT,
        Direccion_Calle: formData.Direccion_Calle,
        Direccion_Numero: formData.Direccion_Numero,
        Direccion_Localidad: formData.Direccion_Localidad,
        Direccion_Codigo_Postal: formData.Direccion_Codigo_Postal,
        Sucursal_Bapro: formData.Sucursal_Bapro,
        Tipo_Organismo: tipoOrganismo,
        Tipo_Estado: tipoEstado
      };

      const response = await this.organismoService.postInsertGenericSP({
        sp_name: 'ORGANISMO_ACTUALIZAR',
        body: payload
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