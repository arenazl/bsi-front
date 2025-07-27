import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserSessionService } from '../services/user-session.service';

/**
 * Guard básico de autenticación
 * Verifica si el usuario está logueado
 */
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private userSessionService: UserSessionService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    console.log('AuthGuard - Verificando autenticación...');
    
    if (this.userSessionService.isAuthenticated()) {
      console.log('AuthGuard - Usuario autenticado ✓');
      return true;
    } else {
      console.log('AuthGuard - Usuario NO autenticado ✗');
      // Guardar la URL a la que quería ir
      this.router.navigate(['/login'], { 
        queryParams: { returnUrl: state.url }
      });
      return false;
    }
  }
}