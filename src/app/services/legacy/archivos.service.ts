import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ArchivosService {
  private API_URI = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Descargar archivo por ID
   */
  descargar(id: number): Observable<Blob> {
    return this.http.get(`${this.API_URI}/file/download/${id}`, {
      responseType: 'blob'
    });
  }

  /**
   * Descargar archivo de salida (nóminas, pagos, etc.)
   */
  descargarSalida(tipoModulo: string, id: number): Observable<Blob> {
    return this.http.get(`${this.API_URI}/archivos/${id}/descargar`, {
      responseType: 'blob'
    });
  }

  /**
   * Subir archivo a dropbox/storage
   */
  subir(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.API_URI}/archivos/subir`, formData);
  }

  /**
   * Subir archivo por nombre (legacy)
   */
  subirPorNombre(filename: string): Observable<Blob> {
    const body = { filename };
    return this.http.post(`${this.API_URI}/archivos/subir`, body, {
      responseType: 'blob'
    });
  }

  /**
   * Procesar archivo Excel para nóminas
   */
  procesarExcelNomina(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.API_URI}/nominas/procesar-excel`, formData);
  }

  /**
   * Procesar archivo Excel para pagos
   */
  procesarExcelPago(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.API_URI}/pagos/procesar-excel`, formData);
  }

  /**
   * Procesar archivo TXT para nóminas
   */
  procesarTxtNomina(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.http.post(`${this.API_URI}/nominas/procesar`, formData);
  }

  /**
   * Obtener lista de archivos subidos
   */
  listarArchivos(filtros?: {
    tipo?: string;
    fecha_desde?: string;
    fecha_hasta?: string;
    usuario_id?: number;
  }): Observable<any[]> {
    const params: any = {};
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key as keyof typeof filtros] !== undefined) {
          params[key] = filtros[key as keyof typeof filtros];
        }
      });
    }

    return this.http.get<any[]>(`${this.API_URI}/archivos`, { params });
  }

  /**
   * Eliminar archivo
   */
  eliminar(id: number): Observable<any> {
    return this.http.delete(`${this.API_URI}/archivos/${id}`);
  }

  /**
   * Obtener información de un archivo
   */
  obtenerInfo(id: number): Observable<any> {
    return this.http.get(`${this.API_URI}/archivos/${id}/info`);
  }

  /**
   * Validar formato de archivo antes de subir
   */
  validarFormato(file: File, tiposPermitidos: string[]): { valido: boolean; error?: string } {
    if (!file) {
      return { valido: false, error: 'No se ha seleccionado ningún archivo' };
    }

    const extension = file.name.toLowerCase().split('.').pop();
    if (!extension || !tiposPermitidos.includes(extension)) {
      return { 
        valido: false, 
        error: `Formato no permitido. Formatos válidos: ${tiposPermitidos.join(', ')}` 
      };
    }

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { 
        valido: false, 
        error: 'El archivo es demasiado grande. Tamaño máximo: 10MB' 
      };
    }

    return { valido: true };
  }
}