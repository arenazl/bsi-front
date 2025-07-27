import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { OperationContext } from '../helpers/session.helper';
import { NominaItem, ProcessResult, NominaPayload } from '../models/operation-context.model';
import { dbResponse } from '../models/Model';
import { TipoModulo } from '../enums/enums';

export interface PagoItem {
  CBU: string;
  CUIL: string;
  NOMBRE: string;
  IMPORTE: number;
}

export interface PagoData {
  CONCEPTO: string;
  FECHAPAGO: string;
  IDCONT: string;
  IDORG: string;
  IDUSER: string;
  ITEMS: PagoItem[];
}

export interface PagoFiltros {
  organismo_id?: string;
  contrato_id?: string;
  estado?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  concepto?: string;
}

export interface PagoDetalle {
  id: number;
  concepto: string;
  fecha_pago: string;
  organismo: string;
  contrato: string;
  estado: string;
  total_importe: number;
  cantidad_items: number;
  usuario_creacion: string;
  fecha_creacion: string;
  items: PagoItem[];
}

@Injectable({
  providedIn: 'root'
})
export class PagosService {
  private API_URI = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Validar e insertar pago desde JSON
   */
  validarInsertar(data: PagoData): Observable<any> {
    return this.http.post(`${this.API_URI}/pagos/validar-insertar`, data);
  }

  /**
   * Procesar archivo Excel de pagos
   */
  procesarExcel(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.API_URI}/pagos/procesar-excel`, formData);
  }

  /**
   * Listar pagos con filtros opcionales
   */
  listar(filtros?: PagoFiltros): Observable<any> {
    const params: any = {};
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key as keyof PagoFiltros] !== undefined) {
          params[key] = filtros[key as keyof PagoFiltros];
        }
      });
    }

    return this.http.get(`${this.API_URI}/pagos`, { params });
  }

  /**
   * Obtener detalle de un pago específico
   */
  obtenerDetalle(id: string | number): Observable<PagoDetalle> {
    return this.http.get<PagoDetalle>(`${this.API_URI}/pagos/${id}`);
  }

  /**
   * Obtener estado general de pagos
   */
  obtenerEstado(): Observable<any> {
    return this.http.get(`${this.API_URI}/pagos/estado`);
  }

  /**
   * Generar archivo de salida para pagos procesados
   */
  generarArchivo(pagoId: string | number, formato: 'TXT' | 'EXCEL' = 'TXT'): Observable<any> {
    return this.http.post(`${this.API_URI}/pagos/generar-archivo`, { 
      pagoId, 
      formato 
    });
  }

  /**
   * Enviar archivo de pago por FTP
   */
  enviarFtp(params: {
    pagoId: number;
    servidor: string;
    usuario: string;
    directorio: string;
  }): Observable<any> {
    return this.http.post(`${this.API_URI}/pagos/enviar-ftp`, params);
  }

  /**
   * Descargar archivo de pago generado
   */
  descargarArchivo(pagoId: string | number): Observable<Blob> {
    return this.http.get(`${this.API_URI}/pagos/${pagoId}/descargar`, {
      responseType: 'blob'
    });
  }

  /**
   * Obtener metadatos para renderizar UI
   */
  obtenerMetadata(tipoMetadata: string): Observable<any> {
    return this.http.get(`${this.API_URI}/pagos/metadata/${tipoMetadata}`);
  }

  /**
   * Obtener estadísticas de pagos
   */
  obtenerEstadisticas(filtros?: {
    organismo_id?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
  }): Observable<{
    total_pagos: number;
    total_importe: number;
    por_estado: { estado: string; cantidad: number; importe: number }[];
    por_organismo: { organismo: string; cantidad: number; importe: number }[];
    ultimos_pagos: any[];
  }> {
    const params: any = {};
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key as keyof typeof filtros] !== undefined) {
          params[key] = filtros[key as keyof typeof filtros];
        }
      });
    }

    return this.http.get<any>(`${this.API_URI}/pagos/estadisticas`, { params });
  }

  /**
   * Validar datos de pago antes de enviar
   */
  validarDatos(data: PagoData): { valido: boolean; errores: string[] } {
    const errores: string[] = [];

    if (!data.CONCEPTO?.trim()) {
      errores.push('El concepto es requerido');
    }

    if (!data.FECHAPAGO) {
      errores.push('La fecha de pago es requerida');
    }

    if (!data.ITEMS || data.ITEMS.length === 0) {
      errores.push('Debe incluir al menos un item de pago');
    } else {
      data.ITEMS.forEach((item, index) => {
        if (!item.CBU?.trim()) {
          errores.push(`Item ${index + 1}: CBU es requerido`);
        }
        if (!item.CUIL?.trim()) {
          errores.push(`Item ${index + 1}: CUIL es requerido`);
        }
        if (!item.NOMBRE?.trim()) {
          errores.push(`Item ${index + 1}: Nombre es requerido`);
        }
        if (!item.IMPORTE || item.IMPORTE <= 0) {
          errores.push(`Item ${index + 1}: Importe debe ser mayor a 0`);
        }
      });
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  // ==================== COORDINACIÓN NÓMINA-PAGOS ====================
  
  /**
   * Procesa la secuencia completa: Nómina → Pagos
   * Mantiene el flujo secuencial requerido por el negocio
   * SIEMPRE navega a pantallas de verificación según el resultado
   */
  async procesarNominaYPagos(
    nominas: NominaItem[], 
    pagosSeleccionados: NominaItem[],
    contexto: OperationContext
  ): Promise<ProcessResult> {
    
    try {
      let nominaId: string | undefined;
      
      // Paso 1: Procesar TODAS las nóminas sin discriminar si son nuevas o existentes
      // El SP detecta automáticamente si debe insertar o actualizar
      if (nominas && nominas.length > 0) {
        console.log(`🔄 Procesando ${nominas.length} nóminas...`);
        const nominaPayload = this.buildNominaPayload(nominas, contexto);
        
        const nominaResult = await firstValueFrom(
          this.http.post<dbResponse>(`${this.API_URI}/nominas/validar-insertar`, nominaPayload)
        );
        
        console.log('📊 Resultado nómina:', nominaResult);
        
        // Si la nómina tiene errores (estado !== 1), ir a verificación de NOMINA
        if (nominaResult.estado !== 1) {
          return {
            phase: 'nomina',
            success: false,
            nominaId: nominaResult.data?.id_insertado,
            navigateTo: `/xslVerified/${TipoModulo.NOMINA}/${nominaResult.data?.id_insertado}/true`,
            error: nominaResult.descripcion
          };
        }
        
        nominaId = nominaResult.data?.id_insertado?.toString();
        console.log('✅ Nóminas procesadas correctamente');
      }
      
      // Paso 2: Procesar pagos (siempre)
      console.log('💰 Procesando pagos...');
      const pagoPayload = this.buildPagoPayload(pagosSeleccionados, contexto);
      
      const pagoResult = await firstValueFrom(
        this.http.post<dbResponse>(`${this.API_URI}/pagos/validar-insertar`, pagoPayload)
      );
      
      console.log('💰 Resultado pago:', pagoResult);
      
      // SIEMPRE ir a verificación de PAGOS (tenga errores o no)
      // Esta es la pantalla final donde se muestran los pagos procesados
      return {
        phase: 'complete',
        success: true,
        nominaId: nominaId,
        pagoId: pagoResult.data?.id_insertado,
        navigateTo: `/xslVerified/${TipoModulo.PAGO}/${pagoResult.data?.id_insertado}`
      };
      
    } catch (error) {
      console.error('❌ Error en procesamiento:', error);
      throw error;
    }
  }

  /**
   * Construye el payload para validar nómina
   */
  private buildNominaPayload(items: NominaItem[], ctx: OperationContext): NominaPayload {
    return {
      IDCONT: ctx.contratoId,
      IDORG: ctx.organismoId, 
      IDUSER: ctx.userId,
      ITEMS: items.map(item => ({
        CBU: item.cbu,
        CUIL: item.cuil,
        APELLIDO: item.apellido,
        NOMBRE: item.nombre.split(' ').slice(1).join(' ') // Mantener lógica original
      }))
    };
  }
  
  /**
   * Construye el payload para crear pagos
   */
  private buildPagoPayload(items: NominaItem[], ctx: OperationContext): PagoData {
    return {
      CONCEPTO: ctx.concepto || '',
      FECHAPAGO: ctx.fechaPago || new Date().toISOString().split('T')[0],
      IDCONT: ctx.contratoId,
      IDORG: ctx.organismoId,
      IDUSER: ctx.userId,
      ITEMS: items.map(item => ({
        CBU: item.cbu,
        CUIL: item.cuil,
        IMPORTE: item.importe || 0,
        NOMBRE: item.nombre
      }))
    };
  }
}