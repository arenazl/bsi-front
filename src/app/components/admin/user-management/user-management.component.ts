import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosService, Usuario } from '../../../services/usuarios.service';
import Swal from 'sweetalert2';
import { Organismo, OrganismosService } from 'src/app/services/organismos.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: Usuario[] = [];
  organismos: Organismo[] = [];
  filteredUsers: Usuario[] = [];
  userForm!: FormGroup;
  searchForm!: FormGroup;
  organismoForm!: FormGroup;
  showForm = false;
  isEditing = false;
  loading = false;
  currentUser: Usuario | null = null;
  editingRowId: number | null = null;
  editingForm!: FormGroup;
  selectedOrganismoId: number = 0;
  contratos: any[] = [];

  constructor(
    private fb: FormBuilder,
    private usuariosService: UsuariosService,
    private organismosService: OrganismosService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadUsers();
    this.setupSearchFilter();
    this.loadOrganismos();
  }

  private initializeForms(): void {

    this.organismoForm = this.fb.group({
      organismoSeleccionado: ['', Validators.required]
    });

    this.userForm = this.fb.group({
      Nombre: ['', Validators.required],
      Apellido: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      User_Name: ['', Validators.required],
      password: [''],
      organismo: [null, Validators.required], // guardamos el objeto organismo
      CUIL: [''],
      Telefono: [''],
      Cargo_Funcion: [''],
      Perfil: [''],
      Tipo_Estado: [1]
    });

    this.searchForm = this.fb.group({
      searchTerm: ['']
    });

    this.editingForm = this.fb.group({
      Nombre: ['', Validators.required],
      Apellido: ['', Validators.required],
      Email: ['', [Validators.required, Validators.email]],
      User_Name: ['', Validators.required],
      ID_Organismo: [null, Validators.required],
      CUIL: [''],
      Telefono: [''],
      Cargo_Funcion: [''],
      Perfil: [''],
      Tipo_Estado: [1]
    });

    this.organismoForm.get('organismoSeleccionado')?.valueChanges.subscribe(async (value) => {
      if (value) {
        this.selectedOrganismoId = parseInt(value);
      } else {
        this.selectedOrganismoId = 0;
        this.contratos = [];
      }
    });
  }

  compareOrganismo = (a: any, b: any) => a && b && a.ID_Organismo === b.ID_Organismo;

  async loadUsers(): Promise<void> {
    try {
      this.loading = true;
      const response = await this.usuariosService.listar().toPromise();
      console.log('Response from listar:', response);
      
      let rawUsers: any[] = [];

      if (Array.isArray(response)) {
        rawUsers = response;
      } else if (response && typeof response === 'object') {
        const res = response as any;
        rawUsers = res.data || res.users || [];
      }

      this.users = rawUsers;

      // 👇 completa Nombre_Organismo si ya hay organismos cargados
      this.syncUserOrgNames();
    } catch (error) {
      console.error('Error fetching users:', error);
      this.users = [];
      this.filteredUsers = [];
      Swal.fire('Error', 'Error al cargar usuarios', 'error');
    } finally {
      this.loading = false;
    }
  }

  private async loadOrganismos(): Promise<void> {
    console.log('Cargando lista de organismos...');
    try {
      const response = await this.organismosService.postSelectGenericSP({
        sp_name: 'ORGANISMO_OBTENER_LISTA',
        body: {}
      }).toPromise();
      
      if ((response as any)?.estado === 1) {
        this.organismos = (response as any).data || [];
        this.syncUserOrgNames(); // 👈 refresca nombres en la tabla
      } else if (Array.isArray((response as any)?.result)) {
        this.organismos = (response as any).result;
        this.syncUserOrgNames(); // 👈 refresca nombres en la tabla
      } else {
        this.organismos = [];
        Swal.fire('Error', 'Error al cargar organismos', 'error');
      }
    } catch (error) {
      console.error('Error al cargar organismos:', error);
      Swal.fire('Error', 'Error al cargar organismos', 'error');
    }
  }

  // 👇 JOIN mínimo: agrega Nombre_Organismo a cada usuario según su ID_Organismo
  private syncUserOrgNames(): void {
    if (!this.users?.length) {
      this.filteredUsers = [];
      return;
    }
    if (!this.organismos?.length) {
      // aún sin organismos: mostramos lista sin nombres y mantenemos filtro
      this.filterUsers(this.searchForm.get('searchTerm')?.value || '');
      return;
    }

    const nameById = new Map<number, string>(
      this.organismos.map(o => [Number(o.ID_Organismo), o.Nombre])
    );

    this.users = this.users.map(u => ({
      ...u,
      Nombre_Organismo: nameById.get(Number((u as any).ID_Organismo)) || '-'
    })) as any;

    // re-aplicamos filtro vigente
    this.filterUsers(this.searchForm.get('searchTerm')?.value || '');
  }

  openNewForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.currentUser = null;
    this.userForm.reset({ Tipo_Estado: 1, organismo: null });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    this.userForm.get('password')?.updateValueAndValidity();
  }

  // setea el objeto organismo para que el select muestre el nombre
  editUser(user: Usuario): void {
    this.showForm = true;
    this.isEditing = true;
    this.currentUser = user;

    const orgObj = this.organismos.find(o => o.ID_Organismo === (user as any).ID_Organismo) || null;

    this.userForm.patchValue({
      Nombre: user.Nombre,
      Apellido: user.Apellido,
      Email: user.Email || '',
      User_Name: user.User_Name,
      organismo: orgObj,
      CUIL: user.CUIL || '',
      Telefono: user.Telefono || '',
      Cargo_Funcion: user.Cargo_Funcion || '',
      Perfil: user.Perfil || '',
      Tipo_Estado: user.Tipo_Estado ?? 1
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
  }

  // mapea objeto organismo → ID_Organismo para el backend/SP
  async onSubmit(): Promise<void> {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    this.loading = true;
    const v = this.userForm.value;
    const org = v.organismo;

    const payload: any = {
      ID_Organismo: org?.ID_Organismo ?? null,
      User_Name: v.User_Name,
      CUIL: v.CUIL || null,
      Apellido: v.Apellido,
      Nombre: v.Nombre,
      Telefono: v.Telefono || null,
      Email: v.Email || null,
      Cargo_Funcion: v.Cargo_Funcion || null,
      Perfil: v.Perfil || null,
      Tipo_Estado: Number(v.Tipo_Estado),
      Nombre_Organismo: org?.Nombre ?? ''
    };

    if (v.password) {
      payload.password = v.password;
    }

    if (!payload.ID_Organismo) {
      this.userForm.get('organismo')?.markAsTouched();
      this.loading = false;
      return;
    }

    try {
      if (this.isEditing && this.currentUser) {
        await this.usuariosService.actualizar(this.currentUser.ID_USER!, payload).toPromise();
      } else {
        await this.usuariosService.crear(payload).toPromise();
      }

      await Swal.fire({
        icon: 'success',
        title: this.isEditing ? 'Actualizado' : 'Creado',
        text: `Usuario ${this.isEditing ? 'actualizado' : 'creado'} exitosamente`
      });

      this.cancelForm();
      await this.loadUsers();
    } catch (error: any) {
      console.error('Error al guardar usuario:', error);
      Swal.fire('Error', error.message || 'Error al guardar el usuario', 'error');
    } finally {
      this.loading = false;
    }
  }

  async deleteUser(user: Usuario): Promise<void> {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar al usuario ${user.Nombre} ${user.Apellido}?`,
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
        await this.usuariosService.eliminar(user.ID_USER!).toPromise();
        Swal.fire('Eliminado', 'Usuario eliminado exitosamente', 'success');
        await this.loadUsers();
      } catch (error: any) {
        console.error('Error al eliminar usuario:', error);
        Swal.fire('Error', error.message || 'Error al eliminar el usuario', 'error');
      } finally {
        this.loading = false;
      }
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.currentUser = null;
    this.userForm.reset();
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
  get f() { return this.userForm.controls; }

  hasError(field: string, error: string): boolean {
    const control = this.userForm.get(field);
    return !!(control?.hasError(error) && (control?.dirty || control?.touched));
  }

  // Métodos para búsqueda
  private setupSearchFilter(): void {
    this.searchForm.get('searchTerm')?.valueChanges.subscribe(term => {
      this.filterUsers(term);
    });
  }

  // null-safe para evitar errores si Email es null/undefined
  private filterUsers(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredUsers = [...this.users];
    } else {
      const term = (searchTerm ?? '').toLowerCase();
      this.filteredUsers = this.users.filter(user => 
        (user.Nombre ?? '').toLowerCase().includes(term) ||
        (user.Apellido ?? '').toLowerCase().includes(term) ||
        ((user.Email ?? '') as string).toLowerCase().includes(term) ||
        (user.User_Name ?? '').toLowerCase().includes(term)
      );
    }
  }

  startInlineEdit(user: Usuario): void {
    this.editingRowId = user.ID_USER!;
    this.editingForm.patchValue(user);
  }

  cancelInlineEdit(): void {
    this.editingRowId = null;
    this.editingForm.reset();
  }

  async saveInlineEdit(user: Usuario): Promise<void> {
    if (this.editingForm.invalid) {
      this.markFormGroupTouched(this.editingForm);
      return;
    }

    this.loading = true;
    const formData = this.editingForm.value;

    try {
      await this.usuariosService.actualizar(user.ID_USER!, formData).toPromise();
      await Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: 'Usuario actualizado exitosamente',
        timer: 1500,
        showConfirmButton: false
      });
      this.cancelInlineEdit();
      await this.loadUsers();
    } catch (error: any) {
      Swal.fire('Error', error.message || 'Error al actualizar', 'error');
    } finally {
      this.loading = false;
    }
  }

  isEditingRow(user: Usuario): boolean {
    return this.editingRowId === user.ID_USER;
  }

  hasEditingError(field: string, error: string): boolean {
    const control = this.editingForm.get(field);
    return !!(control?.hasError(error) && (control?.dirty || control?.touched));
  }
}
