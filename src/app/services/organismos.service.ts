import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TipoModulo } from '../enums/enums';

export interface Organismo {
  id: number;
  nombre: string;
  codigo?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  fecha_creacion?: string;
}

export interface Contrato {
  id: number;
  organismo_id: number;
  numero: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin?: string;
  activo: boolean;
  organismo?: Organismo;
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
  }): Observable<Organismo[]> {
    const params: any = {};
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key as keyof typeof filtros] !== undefined) {
          params[key] = filtros[key as keyof typeof filtros];
        }
      });
    }

    return this.http.get<Organismo[]>(`${this.API_URI}/organismos`, { params });
  }

  /**
   * Obtener organismo por ID
   */
  obtenerPorId(id: number): Observable<Organismo> {
    return this.http.get<Organismo>(`${this.API_URI}/organismos/${id}`);
  }

  /**
   * Crear nuevo organismo
   */
  crear(organismo: Omit<Organismo, 'id'>): Observable<Organismo> {
    return this.http.post<Organismo>(`${this.API_URI}/organismos`, organismo);
  }

  /**
   * Actualizar organismo
   */
  actualizar(id: number, organismo: Partial<Organismo>): Observable<Organismo> {
    return this.http.put<Organismo>(`${this.API_URI}/organismos/${id}`, organismo);
  }

  /**
   * Eliminar organismo
   */
  eliminar(id: number): Observable<any> {
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

  // ========== CONTRATOS ==========

  /**
   * Listar contratos de un organismo
   */
  listarContratos(organismoId: number): Observable<Contrato[]> {
    return this.http.get<Contrato[]>(`${this.API_URI}/organismos/${organismoId}/contratos`);
  }

  /**
   * Obtener contrato por ID
   */
  obtenerContrato(organismoId: number, contratoId: number): Observable<Contrato> {
    return this.http.get<Contrato>(`${this.API_URI}/organismos/${organismoId}/contratos/${contratoId}`);
  }

  /**
   * Obtener contrato con detalles específicos
   */
  obtenerContratoDetalle(userId: number, organismoId: number, contratoId: number): Observable<any> {
    const body = { 
      id_user: userId, 
      id_organismo: organismoId, 
      id_contrato: contratoId 
    };

    return this.http.post(`${this.API_URI}/organismos/contratos/${contratoId}`, body);
  }

  /**
   * Crear nuevo contrato
   */
  crearContrato(organismoId: number, contrato: Omit<Contrato, 'id' | 'organismo_id'>): Observable<Contrato> {
    return this.http.post<Contrato>(`${this.API_URI}/organismos/${organismoId}/contratos`, {
      ...contrato,
      organismo_id: organismoId
    });
  }

  /**
   * Actualizar contrato
   */
  actualizarContrato(organismoId: number, contratoId: number, contrato: Partial<Contrato>): Observable<Contrato> {
    return this.http.put<Contrato>(
      `${this.API_URI}/organismos/${organismoId}/contratos/${contratoId}`, 
      contrato
    );
  }

  /**
   * Eliminar contrato
   */
  eliminarContrato(organismoId: number, contratoId: number): Observable<any> {
    return this.http.delete(`${this.API_URI}/organismos/${organismoId}/contratos/${contratoId}`);
  }

  /**
   * Obtener contratos activos para combo
   */
  obtenerContratosParaCombo(organismoId: number): Observable<{ id: string; value: string }[]> {
    return this.http.get<{ id: string; value: string }[]>(
      `${this.API_URI}/organismos/${organismoId}/contratos/combo`
    );
  }

  /**
   * Validar vigencia de contrato
   */
  validarVigenciaContrato(contratoId: number): Observable<{ vigente: boolean; dias_restantes?: number }> {
    return this.http.get<{ vigente: boolean; dias_restantes?: number }>(
      `${this.API_URI}/organismos/contratos/${contratoId}/vigencia`
    );
  }

  /**
   * Obtener estadísticas de organismos
   */
  obtenerEstadisticas(): Observable<{
    total_organismos: number;
    organismos_activos: number;
    total_contratos: number;
    contratos_vigentes: number;
    contratos_por_vencer: number;
  }> {
    return this.http.get<any>(`${this.API_URI}/organismos/estadisticas`);
  }
}