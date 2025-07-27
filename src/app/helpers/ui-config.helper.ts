/**
 * Helper de configuración UI - Funciones para cargar configuración de interfaz
 * Requiere HttpClient para cargar archivos JSON
 */

import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

/**
 * Cargar configuración JSON para pantalla específica
 */
export function obtenerConfigPantalla(http: HttpClient, pantalla: string): Observable<any> {
  return http.get(`assets/json/${pantalla}.json`).pipe(
    catchError(error => {
      console.error(`Error cargando config para ${pantalla}:`, error);
      return of(null);
    })
  );
}

/**
 * Obtener configuración de columnas para tablas
 */
export function obtenerConfigColumnas(http: HttpClient, tipo: string): Observable<any> {
  return http.get(`assets/json/column_shema_${tipo}.json`).pipe(
    catchError(error => {
      console.error(`Error cargando columnas para ${tipo}:`, error);
      return of({ columns: [] });
    })
  );
}

/**
 * Obtener opciones para combos/selects
 */
export function obtenerOpcionesCombo(
  http: HttpClient, 
  endpoint?: string, 
  opcionesEstaticas?: string
): Observable<{ id: string; value: string }[]> {
  if (opcionesEstaticas) {
    const opciones = opcionesEstaticas.split(',').map((valor, index) => ({
      id: String(index + 1),
      value: valor.trim()
    }));
    return of(opciones);
  }
  
  if (endpoint) {
    return http.get<{ id: string; value: string }[]>(endpoint).pipe(
      catchError(error => {
        console.error(`Error cargando opciones de ${endpoint}:`, error);
        return of([]);
      })
    );
  }
  
  return of([]);
}

/**
 * Obtener configuración de formulario dinámico
 */
export function obtenerConfigFormulario(http: HttpClient, nombreFormulario: string): Observable<any> {
  return http.get(`assets/json/forms/${nombreFormulario}.json`).pipe(
    catchError(error => {
      console.error(`Error cargando formulario ${nombreFormulario}:`, error);
      return of({ fields: [] });
    })
  );
}

/**
 * Obtener configuración de dashboard/widgets
 */
export function obtenerConfigDashboard(http: HttpClient, usuario?: string): Observable<any> {
  const archivo = usuario ? `dashboard-${usuario}.json` : 'dashboard-default.json';
  return http.get(`assets/json/dashboards/${archivo}`).pipe(
    catchError(error => {
      console.warn(`Dashboard personalizado no encontrado, usando default:`, error);
      return http.get(`assets/json/dashboards/dashboard-default.json`).pipe(
        catchError(err => {
          console.error('Error cargando dashboard default:', err);
          return of({ widgets: [] });
        })
      );
    })
  );
}

/**
 * Guardar configuración personalizada de usuario
 */
export function guardarConfigUsuario(config: any): void {
  localStorage.setItem('ui_config_user', JSON.stringify(config));
}

/**
 * Obtener configuración personalizada de usuario
 */
export function obtenerConfigUsuario(): any {
  const config = localStorage.getItem('ui_config_user');
  return config ? JSON.parse(config) : null;
}

/**
 * Obtener configuración de temas disponibles
 */
export function obtenerTemas(http: HttpClient): Observable<{ id: string; nombre: string; colores: any }[]> {
  return http.get<any[]>(`assets/json/themes.json`).pipe(
    catchError(error => {
      console.error('Error cargando temas:', error);
      return of([
        {
          id: 'corporate-blue',
          nombre: 'Corporate Blue',
          colores: { primary: '#2563EB', secondary: '#3B82F6' }
        }
      ]);
    })
  );
}

/**
 * Obtener configuración de idioma
 */
export function obtenerConfigIdioma(http: HttpClient, idioma: string = 'es'): Observable<any> {
  return http.get(`assets/i18n/${idioma}.json`).pipe(
    catchError(error => {
      console.error(`Error cargando idioma ${idioma}:`, error);
      return http.get(`assets/i18n/es.json`).pipe(
        catchError(err => {
          console.error('Error cargando idioma default:', err);
          return of({});
        })
      );
    })
  );
}

/**
 * Validar formato de configuración
 */
export function validarConfiguracion(config: any, tipo: 'pantalla' | 'formulario' | 'columnas'): { valida: boolean; errores: string[] } {
  const errores: string[] = [];

  if (!config) {
    errores.push('Configuración no puede estar vacía');
    return { valida: false, errores };
  }

  switch (tipo) {
    case 'pantalla':
      if (!config.titulo) errores.push('Título es requerido');
      if (!config.componente) errores.push('Componente es requerido');
      break;
    
    case 'formulario':
      if (!config.fields || !Array.isArray(config.fields)) {
        errores.push('Fields debe ser un array');
      }
      break;
    
    case 'columnas':
      if (!config.columns || !Array.isArray(config.columns)) {
        errores.push('Columns debe ser un array');
      }
      break;
  }

  return {
    valida: errores.length === 0,
    errores
  };
}