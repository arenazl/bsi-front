import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TipoMetada, TipoModulo } from '../enums/enums';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  private API_URI = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Ejecutar stored procedure de inserción genérico
   */
  ejecutarInsertSP(body: any): Observable<any> {
    return this.http.post(`${this.API_URI}/generic/execute-insert`, body);
  }

  /**
   * Ejecutar stored procedure de selección genérico
   */
  ejecutarSelectSP(body: any): Observable<any> {
    return this.http.post(`${this.API_URI}/generic/execute-select`, body);
  }

  /**
   * Obtener metadatos para renderizar UI
   */
  obtenerMetadata(tipoModulo: TipoModulo, tipoMetada: TipoMetada, contrato: string = 'NONE'): Observable<any> {
    return this.http.get(`${this.API_URI}/generic/metadata/${tipoModulo}/${tipoMetada}/${contrato}`);
  }

  /**
   * Obtener resumen de datos por módulo
   */
  obtenerResumen(tipoModulo: TipoModulo, id: string): Observable<any> {
    return this.http.get(`${this.API_URI}/generic/resumen/${tipoModulo}/${id}`);
  }

  /**
   * Ejecutar stored procedure con parámetros específicos
   */
  ejecutarSP(spName: string, parametros: any, esInsercion: boolean = false): Observable<any> {
    const body = {
      sp_name: spName,
      jsonUnify: true,
      body: parametros
    };

    const endpoint = esInsercion ? 'execute-insert' : 'execute-select';
    return this.http.post(`${this.API_URI}/generic/${endpoint}`, body);
  }

  /**
   * Ejecutar múltiples SPs en transacción
   */
  ejecutarTransaccion(operaciones: Array<{
    sp_name: string;
    parametros: any;
    tipo: 'insert' | 'select';
  }>): Observable<any> {
    return this.http.post(`${this.API_URI}/generic/ejecutar-transaccion`, {
      operaciones
    });
  }

  /**
   * Obtener estructura de tabla para formularios dinámicos
   */
  obtenerEstructuraTabla(nombreTabla: string): Observable<any> {
    return this.http.get(`${this.API_URI}/generic/estructura/${nombreTabla}`);
  }

  /**
   * Validar datos antes de ejecutar SP
   */
  validarDatosSP(spName: string, datos: any): Observable<{ valido: boolean; errores: string[] }> {
    return this.http.post<{ valido: boolean; errores: string[] }>(
      `${this.API_URI}/generic/validar-datos`, 
      { sp_name: spName, datos }
    );
  }

  /**
   * Obtener historial de ejecuciones de SP
   */
  obtenerHistorialSP(filtros?: {
    sp_name?: string;
    usuario_id?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Observable<any[]> {
    const params: any = {};
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key as keyof typeof filtros] !== undefined) {
          params[key] = filtros[key as keyof typeof filtros];
        }
      });
    }

    return this.http.get<any[]>(`${this.API_URI}/generic/historial`, { params });
  }
}