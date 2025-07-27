import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserSessionService } from '../services/user-session.service';
import Swal from 'sweetalert2';

/**
 * Guard para verificar roles específicos
 * Uso: canActivate: [RoleGuard], data: { roles: ['admin', 'supervisor'] }
 */
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  
  constructor(
    private userSessionService: UserSessionService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Obtener roles requeridos de la configuración de la ruta
    const requiredRoles = route.data['roles'] as string[];
    
    if (!requiredRoles) {
      console.error('RoleGuard - No se especificaron roles requeridos');
      return false;
    }

    const user = this.userSessionService.getCurrentUserData();
    const userRole = user?.Rol || user?.rol || '';

    console.log('RoleGuard - Roles requeridos:', requiredRoles);
    console.log('RoleGuard - Rol del usuario:', userRole);

    // Verificar si el usuario tiene alguno de los roles requeridos
    if (requiredRoles.includes(userRole)) {
      console.log('RoleGuard - Acceso permitido ✓');
      return true;
    }

    // Acceso denegado
    Swal.fire({
      icon: 'warning',
      title: 'Acceso Restringido',
      text: `Esta sección requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`,
      confirmButtonText: 'Entendido'
    });

    this.router.navigate(['/mainMenu']);
    return false;
  }
}