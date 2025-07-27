import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserSessionService } from '../services/user-session.service';
import Swal from 'sweetalert2';

/**
 * Guard para verificar permisos específicos
 * Más granular que roles - verifica permisos individuales
 * Uso: canActivate: [PermissionGuard], data: { permission: 'users.edit' }
 */
@Injectable({
  providedIn: 'root'
})
export class PermissionGuard implements CanActivate {
  
  // Simulación de permisos por rol (en producción vendría del backend)
  private rolePermissions: { [role: string]: string[] } = {
    'admin': ['*'], // Admin tiene todos los permisos
    'supervisor': [
      'users.view',
      'users.create',
      'contratos.view',
      'contratos.create',
      'contratos.edit',
      'reports.view'
    ],
    'operator': [
      'contratos.view',
      'contratos.create',
      'reports.view'
    ],
    'viewer': [
      'contratos.view',
      'reports.view'
    ]
  };

  constructor(
    private userSessionService: UserSessionService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    const requiredPermission = route.data['permission'] as string;
    
    if (!requiredPermission) {
      console.error('PermissionGuard - No se especificó permiso requerido');
      return false;
    }

    const user = this.userSessionService.getCurrentUserData();
    const userRole = user?.Rol || user?.rol || 'viewer';

    console.log('PermissionGuard - Permiso requerido:', requiredPermission);
    console.log('PermissionGuard - Rol del usuario:', userRole);

    // Verificar si el usuario tiene el permiso
    if (this.hasPermission(userRole, requiredPermission)) {
      console.log('PermissionGuard - Permiso concedido ✓');
      return true;
    }

    // Permiso denegado
    Swal.fire({
      icon: 'error',
      title: 'Sin Permisos',
      text: `No tenés permisos para realizar esta acción: ${requiredPermission}`,
      confirmButtonText: 'Entendido'
    });

    return false;
  }

  private hasPermission(role: string, permission: string): boolean {
    const permissions = this.rolePermissions[role] || [];
    
    // Si tiene permiso * (admin), puede todo
    if (permissions.includes('*')) {
      return true;
    }

    // Verificar permiso específico
    return permissions.includes(permission);
  }
}