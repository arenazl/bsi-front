import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, Observer, of } from 'rxjs';
import { TipoMetada, TipoModulo } from '../enums/enums';

@Injectable({
  providedIn: 'root'
})

export class FileService {
  getComboData() {
    throw new Error("Method not implemented.");
  }

  API_URI = environment.apiUrl;
  validationData = null;
  private storageKey = 'validationData';

  constructor(private _http: HttpClient
  ) { }

  // Método de login
  login(credentials: { nombre: string, password: string }): Observable<any> {
    return this._http.post(`${this.API_URI}/auth/login`, credentials);
  }

  // Método para refrescar token
  refreshToken(refreshToken: string): Observable<any> {
    return this._http.post(`${this.API_URI}/auth/refresh`, { refreshToken });
  }

  // Método para logout
  logout(): Observable<any> {
    return this._http.post(`${this.API_URI}/auth/logout`, {});
  }

  // Método para cargar JSON de configuración de pantallas
  getJsonForScreen(screen: string): Observable<any> {
    return this._http.get(`assets/json/${screen}.json`);
  }

  postInsertGenericSP(body: any): Observable<any> {
    return this._http.post(`${this.API_URI}/generic/execute-insert`, body);
  }

  postSelectGenericSP(body: any): Observable<any> {
    return this._http.post(`${this.API_URI}/generic/execute-select`, body);
  }

  getMetaData(tipoModulo: TipoModulo, tipoMetada: TipoMetada, contrato: string = 'NONE'): Observable<any> {
    return this._http.get(`${this.API_URI}/generic/metadata/${tipoModulo}/${tipoMetada}/${contrato}`);
  }

  getComboOptions(endpoint?: string, staticOptions?: string): Observable<{ id: string; value: string }[]> {

    if (staticOptions) {
      const options = staticOptions.split(',').map((value, index) => ({
        id: String(index + 1),
        value: value.trim()
      }));
      return of(options);
    } else if (endpoint) {
      return this._http.get<{ id: string; value: string }[]>(endpoint);
    } else {
      return of([]);
    }
  }

  getTR(id: string) {
    return this._http.get(`${this.API_URI}/responsetr/${id}`);
  }

  getTRList() {
    return this._http.get(`${this.API_URI}/responsetrforcombo`);
  }

  saveValidationData(data: any): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  getValidationData(): any {
    const storedData = localStorage.getItem(this.storageKey);
    return storedData ? JSON.parse(storedData) : null;
  }

  clearValidationData(): void {
    localStorage.removeItem(this.storageKey);
  }


  getContratoById(user: number, municipio: number, contrato: number): Observable<any> {

    var body = { id_user: user, id_organismo: municipio, id_contrato: contrato };

    return this._http.post(`${this.API_URI}/organismos/contratos/${contrato}`, body, {
      responseType: 'json',
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    });

  }

  postInsertValidateAndInsert(nominaPayload: any): Observable<any> {

    return this._http.post(`${this.API_URI}/metadata/POST_INSERT_NOMINA_MANUAL`, nominaPayload, {
      responseType: 'json',
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    });

  }

  downloadFile(id: number): Observable<Blob> {
    const url = `${this.API_URI}/file/download/${id}`;
    return this._http.get(url, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    });
  }

  downloadOutputFile(tipoModulo: string, id: number): Observable<Blob> {
    const url = `${this.API_URI}/archivos/${id}/descargar`;
    return this._http.get(url, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    });
  }


  getListForCombo(tipoModulo: TipoModulo): Observable<any> {

    const url = `${this.API_URI}/organismos/combo/${tipoModulo}`;
    return this._http.get(url, {
      responseType: 'json',
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    });
  }


  dropBox(file: string) {
    var body = { filename: file };
    return this._http.post(`${this.API_URI}/archivos/subir`, body, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    });
  }

  getColumnConfig(tipo: string): Observable<any> {

    const url = `assets/json/column_shema_${tipo}.json`;
    return this._http.get<any>(url);
  }

  getUsers(): Observable<any[]> {
    const url = `${this.API_URI}/usuarios`;
    return this._http.get<any[]>(url);
  }

  createUser(user: any): Observable<any> {

    const url = `${this.API_URI}/usuarios`;
    return this._http.post(url, user);
  }

  updateUser(id: number, user: any): Observable<any> {

    const url = `${this.API_URI}/usuarios/${id}`;
    return this._http.put(url, user);
  }

  deleteUser(id: number): Observable<any> {

    const url = `${this.API_URI}/usuarios/${id}`;
    return this._http.delete(url);
  }


}
