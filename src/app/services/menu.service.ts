import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

export interface MenuActivity {
  title: string;
  description: string;
  enabled: boolean;
  icono?: string;
  items: MenuActivityItem[];
}

export interface MenuActivityItem {
  description: string;
  link: string;
  icono?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = `${environment.apiUrl}/navigation`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la configuración del menú principal
   * @returns Observable con la configuración de actividades del menú
   */
  getMenuConfiguration(): Observable<MenuActivity[]> {
    // Primero intentar cargar desde el backend
    return this.http.get<any>(`${this.apiUrl}/menu`).pipe(
      map(response => {
        console.log('Respuesta del backend:', response);
        
        if (response && response.data && response.data.items) {
          // Corregir las rutas del panel de administración para usar query params
          const items = response.data.items.map((item: any) => {
            if (item.title === 'Administración Usuarios' || item.title === 'Administración Backoffice') {
              // Actualizar las rutas para usar el panel con tabs
              return {
                ...item,
                items: item.items.map((subItem: any) => {
                  // Mapear las rutas antiguas a las nuevas con query params
                  if (subItem.link === '/organismoManagement') {
                    return { ...subItem, link: '/admin?tab=organismos' };
                  } else if (subItem.link === '/contratoManagement') {
                    return { ...subItem, link: '/admin?tab=contratos' };
                  } else if (subItem.link === '/userManagement') {
                    return { ...subItem, link: '/admin?tab=usuarios' };
                  }
                  return subItem;
                })
              };
            }
            return item;
          });
          
          return items as MenuActivity[];
        }
        
        console.error('Estructura inesperada del backend');
        return [];
      }),
      catchError(error => {
        console.error('Error cargando menú del backend, usando JSON local:', error);
        // Si falla el backend, usar el JSON local como fallback
        return this.http.get<any>('assets/json/mainmenu.json').pipe(
          map(data => {
            if (data && data.items && Array.isArray(data.items)) {
              return data.items as MenuActivity[];
            }
            return [];
          }),
          catchError(localError => {
            console.error('Error cargando JSON local:', localError);
            return of([]);
          })
        );
      })
    );
  }
}