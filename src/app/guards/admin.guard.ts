import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserSessionService } from '../services/user-session.service';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  
  constructor(
    private userSessionService: UserSessionService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // DEBUG: Mostrar info del usuario
    console.log('AdminGuard - Usuario autenticado:', this.userSessionService.isAuthenticated());
    console.log('AdminGuard - Es super usuario:', this.userSessionService.isSuperUser());
    console.log('AdminGuard - Datos del usuario:', this.userSessionService.getCurrentUser());
    
    // Verificar si el usuario está autenticado
    if (!this.userSessionService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Verificar si es super usuario
    if (this.userSessionService.isSuperUser()) {
      console.log('AdminGuard - Acceso permitido: Usuario es super admin');
      return true;
    } else {
      // Mostrar mensaje de acceso denegado
      Swal.fire({
        icon: 'error',
        title: 'Acceso Denegado',
        text: 'Solo los super usuarios pueden acceder al panel de administración',
        confirmButtonText: 'Entendido'
      }).then(() => {
        this.router.navigate(['/mainMenu']);
      });
      
      return false;
    }
  }
}