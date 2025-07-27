import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { UserSessionService } from '../services/user-session.service';
import Swal from 'sweetalert2';

/**
 * Guard basado en roles de la BD
 * Más flexible que verificar solo isSuperUser
 */
@Injectable({
  providedIn: 'root'
})
export class RoleBasedGuard implements CanActivate {
  
  constructor(
    private userSessionService: UserSessionService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    
    // Obtener roles requeridos de la configuración de ruta
    const requiredRoles = route.data['roles'] as string[];
    const requireAll = route.data['requireAll'] || false; // AND vs OR
    
    if (!requiredRoles || requiredRoles.length === 0) {
      console.error('RoleBasedGuard - No se especificaron roles requeridos');
      return false;
    }

    // Obtener roles del usuario desde el session
    const userData = this.userSessionService.getCurrentUserData();
    const userRoles = this.parseUserRoles(userData.roles);
    
    console.log('RoleBasedGuard - Roles del usuario:', userRoles);
    console.log('RoleBasedGuard - Roles requeridos:', requiredRoles);

    // Verificar si tiene los roles necesarios
    let hasAccess = false;
    
    if (requireAll) {
      // Requiere TODOS los roles
      hasAccess = requiredRoles.every(role => userRoles.includes(role));
    } else {
      // Requiere AL MENOS UN rol
      hasAccess = requiredRoles.some(role => userRoles.includes(role));
    }

    if (hasAccess) {
      console.log('RoleBasedGuard - Acceso permitido ✓');
      return true;
    }

    // Acceso denegado - Mostrar mensaje apropiado
    this.showAccessDenied(requiredRoles, userRoles);
    this.router.navigate(['/mainMenu']);
    return false;
  }

  private parseUserRoles(roles: any): string[] {
    if (!roles) return [];
    
    // Si es string separado por comas (viene del GROUP_CONCAT de MySQL)
    if (typeof roles === 'string') {
      return roles.split(',').map(r => r.trim()).filter(r => r);
    }
    
    // Si ya es array
    if (Array.isArray(roles)) {
      return roles;
    }
    
    return [];
  }

  private showAccessDenied(requiredRoles: string[], userRoles: string[]) {
    const roleDescriptions: { [key: string]: string } = {
      'super_admin': 'Super Administrador',
      'admin': 'Administrador', 
      'supervisor': 'Supervisor',
      'operador': 'Operador',
      'consulta': 'Consulta'
    };

    const requiredDescriptions = requiredRoles
      .map(r => roleDescriptions[r] || r)
      .join(', ');

    const userDescriptions = userRoles
      .map(r => roleDescriptions[r] || r)
      .join(', ');

    Swal.fire({
      icon: 'warning',
      title: 'Acceso Restringido',
      html: `
        <p>Esta sección requiere uno de los siguientes roles:</p>
        <p><strong>${requiredDescriptions}</strong></p>
        <br>
        <p>Tus roles actuales: <strong>${userDescriptions || 'Ninguno'}</strong></p>
      `,
      confirmButtonText: 'Entendido'
    });
  }
}

/**
 * USO EN RUTAS:
 * 
 * // Solo super admin
 * {
 *   path: 'admin',
 *   component: AdminPanelComponent,
 *   canActivate: [AuthGuard, RoleBasedGuard],
 *   data: { 
 *     roles: ['super_admin']
 *   }
 * }
 * 
 * // Admin O supervisor
 * {
 *   path: 'management',
 *   component: ManagementComponent,
 *   canActivate: [AuthGuard, RoleBasedGuard],
 *   data: { 
 *     roles: ['admin', 'supervisor']
 *   }
 * }
 * 
 * // Requiere múltiples roles (AND)
 * {
 *   path: 'special-section',
 *   component: SpecialComponent,
 *   canActivate: [AuthGuard, RoleBasedGuard],
 *   data: { 
 *     roles: ['admin', 'auditor'],
 *     requireAll: true  // Debe tener AMBOS roles
 *   }
 * }
 */