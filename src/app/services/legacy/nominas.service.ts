import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NominaItem {
  CBU: string;
  CUIL: string;
  APELLIDO: string;
  NOMBRE: string;
}

export interface NominaData {
  IDCONT: string;
  IDORG: string;
  IDUSER: string;
  ITEMS: NominaItem[];
}

export interface NominaFiltros {
  organismo_id?: string;
  contrato_id?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  concepto?: string;
}

export interface NominaDetalle {
  id: number;
  concepto?: string;
  organismo: string;
  contrato: string;
  estado: string;
  cantidad_items: number;
  usuario_creacion: string;
  fecha_creacion: string;
  items: NominaItem[];
}

@Injectable({
  providedIn: 'root'
})
export class NominasService {
  private API_URI = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Validar e insertar nómina desde JSON
   */
  validarInsertar(data: NominaData): Observable<any> {
    return this.http.post(`${this.API_URI}/nominas/validar-insertar`, data);
  }

  /**
   * Procesar archivo TXT de nómina
   */
  procesarTxt(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.API_URI}/nominas/procesar`, formData);
  }

  /**
   * Procesar archivo Excel de nómina
   */
  procesarExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.API_URI}/nominas/procesar-excel`, formData);
  }

  /**
   * Listar nóminas con filtros opcionales
   */
  listar(filtros?: NominaFiltros): Observable<any> {
    const params: any = {};
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key as keyof NominaFiltros] !== undefined) {
          params[key] = filtros[key as keyof NominaFiltros];
        }
      });
    }

    return this.http.get(`${this.API_URI}/nominas`, { params });
  }

  /**
   * Obtener resumen de una nómina específica
   */
  obtenerResumen(id: string | number): Observable<NominaDetalle> {
    return this.http.get<NominaDetalle>(`${this.API_URI}/nominas/${id}`);
  }

  /**
   * Obtener metadatos para renderizar UI
   */
  obtenerMetadata(tipoMetadata: string): Observable<any> {
    return this.http.get(`${this.API_URI}/nominas/metadata/${tipoMetadata}`);
  }

  /**
   * Obtener nóminas para combo/select basado en pagos
   */
  obtenerParaCombo(pagoId?: string): Observable<any> {
    const body = {
      sp_name: "NOMINA_OBTENER_FILL_BY_PAGO",
      jsonUnify: true,
      body: { PAGO_ID: pagoId || null }
    };

    return this.http.post(`${this.API_URI}/generic/execute-select`, body);
  }

  /**
   * Validar existencia de personas en nómina
   */
  validarPersonas(items: Array<{ cuil: string; cbu: string }>): Observable<{
    validas: Array<{ cuil: string; cbu: string; nombre: string; apellido: string }>;
    invalidas: Array<{ cuil: string; cbu: string; error: string }>;
  }> {
    return this.http.post<any>(`${this.API_URI}/nominas/validar-personas`, { items });
  }

  /**
   * Obtener estadísticas de nóminas
   */
  obtenerEstadisticas(filtros?: {
    organismo_id?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Observable<{
    total_nominas: number;
    total_personas: number;
    por_estado: { estado: string; cantidad: number }[];
    por_organismo: { organismo: string; cantidad: number }[];
    ultimas_nominas: any[];
  }> {
    const params: any = {};
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key as keyof typeof filtros] !== undefined) {
          params[key] = filtros[key as keyof typeof filtros];
        }
      });
    }

    return this.http.get<any>(`${this.API_URI}/nominas/estadisticas`, { params });
  }

  /**
   * Validar datos de nómina antes de enviar
   */
  validarDatos(data: NominaData): { valido: boolean; errores: string[] } {
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
      errores.push('Debe incluir al menos un item en la nómina');
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
   * Exportar nómina a diferentes formatos
   */
  exportar(id: number, formato: 'excel' | 'csv' | 'pdf'): Observable<Blob> {
    return this.http.get(`${this.API_URI}/nominas/${id}/exportar/${formato}`, {
      responseType: 'blob'
    });
  }
}