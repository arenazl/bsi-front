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
    console.log('AdminGuard - Datos del usuario:', this.userSessionService.getCurrentUser());
    
    // Verificar si el usuario está autenticado
    if (!this.userSessionService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    // PERMITIR ACCESO A TODOS LOS USUARIOS AUTENTICADOS
    console.log('AdminGuard - Acceso permitido: Usuario autenticado (acceso universal habilitado)');
    return true;
  }
}