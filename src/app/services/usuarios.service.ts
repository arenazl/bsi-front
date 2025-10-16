import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  ID_USER?: number;
  User_Name: string;
  CUIL?: string;
  Apellido: string;
  Nombre: string;
  Email?: string;
  Telefono?: string;
  ID_Organismo?: number;
  Nombre_Organismo: string;
  Cargo_Funcion?: string;
  Perfil?: string;
  Tipo_Estado?: number;
  Fecha_Alta?: string;
}

export interface UsuarioFiltros {
  organismo_id?: number;
  rol?: string;
  activo?: boolean;
  busqueda?: string;
}
interface Organismo {
  ID_Organismo: number;
  Nombre: string;
  CUIT: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {
  private API_URI = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Obtener lista de usuarios con filtros opcionales
   */
  listar(filtros?: UsuarioFiltros): Observable<Usuario[]> {
    const params: any = {};
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key as keyof UsuarioFiltros] !== undefined) {
          params[key] = filtros[key as keyof UsuarioFiltros];
        }
      });
    }

    return this.http.get<Usuario[]>(`${this.API_URI}/usuarios`, { params });
  }

  /**
   * Obtener un usuario por ID
   */
  obtenerPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API_URI}/usuarios/${id}`);
  }

  /**
   * Crear un nuevo usuario
   */
  crear(usuario: Usuario): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.API_URI}/usuarios`, usuario);
  }

  /**
   * Actualizar un usuario existente
   */
  actualizar(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.API_URI}/usuarios/${id}`, usuario);
  }

  /**
   * Eliminar un usuario
   */
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.API_URI}/usuarios/${id}`);
  }

  /**
   * Cambiar contraseña de un usuario
   */
  cambiarPassword(id: number, passwordData: { 
    password_actual: string; 
    password_nuevo: string; 
  }): Observable<any> {
    return this.http.put(`${this.API_URI}/usuarios/${id}/password`, passwordData);
  }

  /**
   * Activar/desactivar usuario
   */
  cambiarEstado(id: number, activo: boolean): Observable<any> {
    return this.http.put(`${this.API_URI}/usuarios/${id}/estado`, { activo });
  }

  /**
   * Obtener usuarios por organismo
   */
  obtenerPorOrganismo(organismoId: number): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.API_URI}/usuarios`, {
      params: { organismo_id: organismoId.toString() }
    });
  }

  /**
   * Obtener roles disponibles
   */
  obtenerRoles(): Observable<{ id: string; nombre: string }[]> {
    return this.http.get<{ id: string; nombre: string }[]>(`${this.API_URI}/usuarios/roles`);
  }

  /**
   * Validar disponibilidad de nombre de usuario
   */
  validarNombreDisponible(nombre: string, excludeId?: number): Observable<{ disponible: boolean }> {
    const params: any = { nombre };
    if (excludeId) {
      params.exclude_id = excludeId;
    }
    return this.http.get<{ disponible: boolean }>(`${this.API_URI}/usuarios/validar-nombre`, { params });
  }

  /**
   * Obtener estadísticas de usuarios
   */
  obtenerEstadisticas(): Observable<{
    total: number;
    activos: number;
    por_organismo: { organismo: string; cantidad: number }[];
    por_rol: { rol: string; cantidad: number }[];
  }> {
    return this.http.get<any>(`${this.API_URI}/usuarios/estadisticas`);
  }
}