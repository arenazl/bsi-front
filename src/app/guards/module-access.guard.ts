import { Injectable } from '@angular/core';
import { CanActivate, CanLoad, Route, UrlSegment, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserSessionService } from '../services/user-session.service';

/**
 * Guard para lazy loading de módulos
 * Previene que se cargue el módulo si no tiene permisos
 * Más eficiente que CanActivate para módulos grandes
 */
@Injectable({
  providedIn: 'root'
})
export class ModuleAccessGuard implements CanLoad, CanActivate {
  
  constructor(
    private userSessionService: UserSessionService,
    private router: Router
  ) {}

  canLoad(
    route: Route,
    segments: UrlSegment[]
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    console.log('ModuleAccessGuard - Verificando acceso al módulo:', segments.join('/'));
    
    // Verificar autenticación básica
    if (!this.userSessionService.isAuthenticated()) {
      console.log('ModuleAccessGuard - Usuario no autenticado, previniendo carga del módulo');
      this.router.navigate(['/login']);
      return false;
    }

    // Verificar permisos específicos del módulo
    const moduleName = route.path;
    
    switch (moduleName) {
      case 'admin':
        return this.checkAdminAccess();
      case 'reports':
        return this.checkReportsAccess();
      case 'settings':
        return this.checkSettingsAccess();
      default:
        return true;
    }
  }

  // CanActivate es necesario para cuando navegás dentro del módulo
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    return this.canLoad(route.routeConfig as Route, []);
  }

  private checkAdminAccess(): boolean {
    const hasAccess = this.userSessionService.isSuperUser();
    console.log('ModuleAccessGuard - Acceso admin:', hasAccess ? 'Permitido' : 'Denegado');
    return hasAccess;
  }

  private checkReportsAccess(): boolean {
    // Ejemplo: todos los usuarios autenticados pueden ver reportes
    return true;
  }

  private checkSettingsAccess(): boolean {
    // Ejemplo: solo usuarios con organismo pueden acceder a configuración
    const user = this.userSessionService.getCurrentUserData();
    return !!user?.ID_Organismo;
  }
}