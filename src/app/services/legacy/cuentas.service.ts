import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CuentaItem {
  CBU: string;
  CUIL: string;
  APELLIDO: string;
  NOMBRE: string;
  ENTE?: string;
  ROTULO?: string;
}

export interface CuentaData {
  IDCONT: string;
  IDORG: string;
  IDUSER: string;
  ROTULO?: string;
  ENTE?: string;
  ITEMS: CuentaItem[];
}

export interface CuentaFiltros {
  organismo_id?: string;
  contrato_id?: string;
  rotulo?: string;
  ente?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
}

export interface CuentaDetalle {
  id: number;
  rotulo: string;
  ente: string;
  organismo: string;
  contrato: string;
  estado: string;
  cantidad_items: number;
  usuario_creacion: string;
  fecha_creacion: string;
  items: CuentaItem[];
}

@Injectable({
  providedIn: 'root'
})
export class CuentasService {
  private API_URI = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Validar e insertar cuenta desde JSON
   */
  validarInsertar(data: CuentaData): Observable<any> {
    return this.http.post(`${this.API_URI}/cuentas/validar-insertar`, data);
  }

  /**
   * Procesar archivo Excel de cuentas
   */
  procesarExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.API_URI}/cuentas/procesar-excel`, formData);
  }

  /**
   * Listar cuentas con filtros opcionales
   */
  listar(filtros?: CuentaFiltros): Observable<any> {
    const params: any = {};
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key as keyof CuentaFiltros] !== undefined) {
          params[key] = filtros[key as keyof CuentaFiltros];
        }
      });
    }

    return this.http.get(`${this.API_URI}/cuentas`, { params });
  }

  /**
   * Obtener detalle de una cuenta específica
   */
  obtenerDetalle(id: string | number): Observable<CuentaDetalle> {
    return this.http.get<CuentaDetalle>(`${this.API_URI}/cuentas/${id}`);
  }

  /**
   * Obtener metadatos para renderizar UI
   */
  obtenerMetadata(tipoMetadata: string): Observable<any> {
    return this.http.get(`${this.API_URI}/cuentas/metadata/${tipoMetadata}`);
  }

  /**
   * Obtener cuentas para combo/select
   */
  obtenerParaCombo(filtros?: { organismo_id?: string; activas?: boolean }): Observable<any> {
    const params: any = {};
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key as keyof typeof filtros] !== undefined) {
          params[key] = filtros[key as keyof typeof filtros];
        }
      });
    }

    return this.http.get(`${this.API_URI}/cuentas/combo`, { params });
  }

  /**
   * Validar CBU
   */
  validarCbu(cbu: string): Observable<{ valido: boolean; banco?: string; sucursal?: string }> {
    return this.http.post<any>(`${this.API_URI}/cuentas/validar-cbu`, { cbu });
  }

  /**
   * Validar CUIL
   */
  validarCuil(cuil: string): Observable<{ valido: boolean; tipo?: string }> {
    return this.http.post<any>(`${this.API_URI}/cuentas/validar-cuil`, { cuil });
  }

  /**
   * Buscar persona por CUIL
   */
  buscarPorCuil(cuil: string): Observable<{
    encontrada: boolean;
    datos?: {
      cuil: string;
      apellido: string;
      nombre: string;
      cbu?: string;
    };
  }> {
    return this.http.get<any>(`${this.API_URI}/cuentas/buscar-persona/${cuil}`);
  }

  /**
   * Obtener estadísticas de cuentas
   */
  obtenerEstadisticas(filtros?: {
    organismo_id?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Observable<{
    total_cuentas: number;
    cuentas_activas: number;
    por_ente: { ente: string; cantidad: number }[];
    por_organismo: { organismo: string; cantidad: number }[];
    ultimas_cuentas: any[];
  }> {
    const params: any = {};
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key as keyof typeof filtros] !== undefined) {
          params[key] = filtros[key as keyof typeof filtros];
        }
      });
    }

    return this.http.get<any>(`${this.API_URI}/cuentas/estadisticas`, { params });
  }

  /**
   * Validar datos de cuenta antes de enviar
   */
  validarDatos(data: CuentaData): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!data.IDCONT?.trim()) {
      errores.push('ID de contrato es requerido');
    }

    if (!data.IDORG?.trim()) {
      errores.push('ID de organismo es requerido');
    }

    if (!data.IDUSER?.trim()) {
      errores.push('ID de usuario es requerido');
    }

    if (!data.ITEMS || data.ITEMS.length === 0) {
      errores.push('Debe incluir al menos un item de cuenta');
    } else {
      data.ITEMS.forEach((item, index) => {
        if (!item.CBU?.trim()) {
          errores.push(`Item ${index + 1}: CBU es requerido`);
        }
        if (!item.CUIL?.trim()) {
          errores.push(`Item ${index + 1}: CUIL es requerido`);
        }
        if (!item.APELLIDO?.trim()) {
          errores.push(`Item ${index + 1}: Apellido es requerido`);
        }
        if (!item.NOMBRE?.trim()) {
          errores.push(`Item ${index + 1}: Nombre es requerido`);
        }
      });
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Exportar cuentas a diferentes formatos
   */
  exportar(id: number, formato: 'excel' | 'csv' | 'pdf'): Observable<Blob> {
    return this.http.get(`${this.API_URI}/cuentas/${id}/exportar/${formato}`, {
      responseType: 'blob'
    });
  }

  /**
   * Sincronizar cuentas con sistema externo
   */
  sincronizar(organismoId: string): Observable<{
    sincronizadas: number;
    errores: string[];
    detalles: any[];
  }> {
    return this.http.post<any>(`${this.API_URI}/cuentas/sincronizar`, { 
      organismo_id: organismoId 
    });
  }
}