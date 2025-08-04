import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileService } from '../../../services/file.service';
import Swal from 'sweetalert2';

interface User {
  id?: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  fecha_nacimiento?: string;
  genero?: 'M' | 'F' | 'Otro';
  activo?: boolean;
  email_verificado?: boolean;
  fecha_creacion?: Date;
  fecha_actualizacion?: Date;
  ultimo_login?: Date;
}

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  userForm!: FormGroup;
  searchForm!: FormGroup;
  showForm = false;
  isEditing = false;
  loading = false;
  currentUser: User | null = null;
  editingRowId: number | null = null;
  editingForm!: FormGroup;

  generoOptions = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
    { value: 'Otro', label: 'Otro' }
  ];

  constructor(
    private fb: FormBuilder,
    private fileService: FileService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadUsers();
    this.setupSearchFilter();
  }

  private initializeForms(): void {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      telefono: ['', [Validators.pattern(/^\d+$/)]],
      fecha_nacimiento: [''],
      genero: [''],
      activo: [true]
    });

    this.searchForm = this.fb.group({
      searchTerm: ['']
    });

    // Formulario para edición inline
    this.editingForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
      telefono: ['', [Validators.pattern(/^\d+$/)]],
      fecha_nacimiento: [''],
      genero: [''],
      activo: [true]
    });
  }

  async loadUsers(): Promise<void> {
    try {
      this.loading = true;
      const response = await this.fileService.getUsers().toPromise();
      console.log('Response from getUsers:', response);
      
      // Manejar diferentes formatos de respuesta
      if (Array.isArray(response)) {
        this.users = response;
      } else if (response && typeof response === 'object') {
        // Si la respuesta es un objeto con una propiedad data o users
        const res = response as any;
        this.users = res.data || res.users || [];
      } else {
        this.users = [];
      }
      
      this.filterUsers(this.searchForm.get('searchTerm')?.value || '');
    } catch (error) {
      console.error('Error fetching users:', error);
      this.users = [];
      this.filteredUsers = [];
      Swal.fire('Error', 'Error al cargar usuarios', 'error');
    } finally {
      this.loading = false;
    }
  }

  openNewForm(): void {
    this.showForm = true;
    this.isEditing = false;
    this.currentUser = null;
    this.userForm.reset();
  }

  editUser(user: User): void {
    this.showForm = true;
    this.isEditing = true;
    this.currentUser = user;
    
    // Formatear fecha si existe
    const formData: any = { ...user };
    if (formData.fecha_nacimiento) {
      formData.fecha_nacimiento = formData.fecha_nacimiento.split('T')[0];
    }
    
    this.userForm.patchValue(formData);
  }

  async onSubmit(): Promise<void> {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }

    this.loading = true;
    const formData = this.userForm.value;

    try {
      let result;
      if (this.isEditing && this.currentUser) {
        result = await this.fileService.updateUser(this.currentUser.id!, formData).toPromise();
      } else {
        result = await this.fileService.createUser(formData).toPromise();
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

  async deleteUser(user: User): Promise<void> {
    const result = await Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea eliminar al usuario ${user.nombre} ${user.apellido}?`,
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
        await this.fileService.deleteUser(user.id!).toPromise();
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

  private filterUsers(searchTerm: string): void {
    if (!searchTerm) {
      this.filteredUsers = [...this.users];
    } else {
      const term = searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user => 
        user.nombre.toLowerCase().includes(term) ||
        user.apellido.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    }
  }

  // Métodos para edición inline
  startInlineEdit(user: User): void {
    this.editingRowId = user.id!;
    const formData: any = { ...user };
    if (formData.fecha_nacimiento) {
      formData.fecha_nacimiento = formData.fecha_nacimiento.split('T')[0];
    }
    this.editingForm.patchValue(formData);
  }

  cancelInlineEdit(): void {
    this.editingRowId = null;
    this.editingForm.reset();
  }

  async saveInlineEdit(user: User): Promise<void> {
    if (this.editingForm.invalid) {
      this.markFormGroupTouched(this.editingForm);
      return;
    }

    this.loading = true;
    const formData = this.editingForm.value;

    try {
      await this.fileService.updateUser(user.id!, formData).toPromise();
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

  isEditingRow(user: User): boolean {
    return this.editingRowId === user.id;
  }

  hasEditingError(field: string, error: string): boolean {
    const control = this.editingForm.get(field);
    return !!(control?.hasError(error) && (control?.dirty || control?.touched));
  }
}