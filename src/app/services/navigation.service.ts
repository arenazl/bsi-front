import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface NavigationAction {
  actionName: string;
  screenType: 'import' | 'verify' | 'editable' | 'custom';
  routeTemplate: string;
  icon?: string;
  order: number;
  showCondition?: string;
  modalityId?: number;
}

export interface NavigationConfig {
  estado: number;
  descripcion: string;
  data: NavigationAction[];
}

export interface MenuItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  link: string;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  private apiUrl = `${environment.apiUrl}/navigation`;
  private currentModuleConfig$ = new BehaviorSubject<NavigationAction[]>([]);

  constructor(private http: HttpClient) { }

  /**
   * Obtiene el menú principal basado en los contratos del usuario
   */
  getMainMenu(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/menu`).pipe(
      tap(response => console.log('Menu principal:', response)),
      catchError(error => {
        console.error('Error obteniendo menú principal:', error);
        throw error;
      })
    );
  }

  /**
   * Obtiene la configuración de navegación para un módulo específico
   * @param moduleCode Código del módulo (ej: 'pagos', 'nominas', 'cuentas')
   */
  getModuleConfig(moduleCode: string): Observable<NavigationConfig> {
    return this.http.get<NavigationConfig>(`${this.apiUrl}/config/${moduleCode}`).pipe(
      tap(response => {
        if (response.estado === 1) {
          // Parse data si viene como string
          const actions = typeof response.data === 'string'
            ? JSON.parse(response.data)
            : response.data;
          this.currentModuleConfig$.next(actions);
        }
      }),
      catchError(error => {
        console.error(`Error obteniendo configuración del módulo ${moduleCode}:`, error);
        throw error;
      })
    );
  }

  /**
   * Obtiene la configuración actual del módulo (estado local)
   */
  getCurrentModuleConfig(): Observable<NavigationAction[]> {
    return this.currentModuleConfig$.asObservable();
  }

  /**
   * Genera las acciones para un contrato específico
   * @param contractId ID del contrato
   * @param modalityId ID de la modalidad (opcional)
   */
  generateActionsForContract(contractId: string, modalityId?: number): NavigationAction[] {
    const currentConfig = this.currentModuleConfig$.getValue();

    // Filtrar acciones por modalidad si se especifica
    const filteredActions = modalityId
      ? currentConfig.filter(action => !action.modalityId || action.modalityId === modalityId)
      : currentConfig;

    // Reemplazar el placeholder {contratoId} en las rutas
    return filteredActions.map(action => ({
      ...action,
      routeTemplate: action.routeTemplate.replace('{contratoId}', contractId)
    }));
  }

  /**
   * Registra el acceso a una pantalla (para auditoría)
   * @param module Código del módulo
   * @param contractId ID del contrato (opcional)
   * @param action Acción realizada
   */
  logNavigationAccess(module: string, action: string, contractId?: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/log`, {
      module,
      contractId,
      action
    }).pipe(
      catchError(error => {
        // No fallar si el log falla
        console.warn('Error registrando acceso:', error);
        return [];
      })
    );
  }

  /**
   * Transforma las acciones de navegación al formato esperado por DinamicModuleComponent
   * @param actions Acciones de navegación
   * @param contractId ID del contrato
   * @param contractName Nombre del contrato
   */
  transformActionsToMenuItems(
    actions: NavigationAction[],
    contractId: string,
    contractName: string
  ): any[] {
    return actions.map(action => ({
      description: action.actionName,
      link: action.routeTemplate,
      icono: action.icon || this.getDefaultIcon(action.screenType),
      enabled: true,
      type: action.screenType
    }));
  }

  /**
   * Obtiene un icono por defecto basado en el tipo de pantalla
   */
  private getDefaultIcon(screenType: string): string {
    const iconMap: { [key: string]: string } = {
      'import': 'fa-upload',
      'verify': 'fa-check-circle',
      'editable': 'fa-edit',
      'custom': 'fa-cog'
    };
    return iconMap[screenType] || 'fa-file';
  }
}