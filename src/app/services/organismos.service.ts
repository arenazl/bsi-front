import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TipoModulo } from '../enums/enums';

export interface Organismo {
  ID_Organismo?: number;
  Nombre: string;
  Nombre_Corto: string;
  CUIT: string;
  Direccion_Calle: string;
  Direccion_Numero: string;
  Direccion_Localidad: string;
  Direccion_Codigo_Postal: string;
  Sucursal_Bapro: string;
  Tipo_Organismo?: number;
  Tipo_Estado?: number;
  Fecha_Alta?: Date;
  Fecha_Baja?: Date;
  Fecha_Modificacion?: Date;

  // Opcionales
  Estado?: number;
  Codigo_Banco?: string;
  Banco?: string;
  Cuenta_Bancaria?: string;
  CBU?: string;
}


@Injectable({
  providedIn: 'root'
})
export class OrganismosService {
  private API_URI = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Listar organismos
   */
  listar(filtros?: {
    activo?: boolean;
    busqueda?: string;
  }): Observable<any> {
    const params: any = {};
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key as keyof typeof filtros] !== undefined) {
          params[key] = filtros[key as keyof typeof filtros];
        }
      });
    }

    return this.http.get<any>(`${this.API_URI}/organismos`, { params });
  }

  /**
   * Obtener organismo por ID
   */
  obtenerPorId(id: number): Observable<any> {
    return this.http.get<Organismo>(`${this.API_URI}/organismos/${id}`);
  }

  /**
   * Crear nuevo organismo
   */
  createOrganismo(organismo: Omit<Organismo, 'id'>): Observable<Organismo> {
    return this.http.post<Organismo>(`${this.API_URI}/organismos`, organismo);
  }

  /**
   * Actualizar organismo
   */
  updateOrganismo(id: number, organismo: Partial<Organismo>): Observable<Organismo> {
    return this.http.put<Organismo>(`${this.API_URI}/organismos/${id}`, organismo);
  }

  /**
   * Eliminar organismo
   */
  deleteOrganismo(id: number): Observable<any> {
    return this.http.delete(`${this.API_URI}/organismos/${id}`);
  }

  /**
   * Obtener lista para combo/select
   */
  obtenerParaCombo(tipoModulo: TipoModulo): Observable<{ id: string; value: string }[]> {
    return this.http.get<{ id: string; value: string }[]>(
      `${this.API_URI}/organismos/combo/${tipoModulo}`
    );
  }

  postInsertGenericSP(body: any): Observable<any> {
    return this.http.post(`${this.API_URI}/generic/execute-insert`, body);
  }
  postSelectGenericSP(body: any): Observable<any> {
    return this.http.post(`${this.API_URI}/generic/execute-select`, body);
  }

  
}