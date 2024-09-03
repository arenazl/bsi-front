import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalVariable } from '../../environments/global';
import { Observable, Observer, of } from 'rxjs';
import { map } from 'jquery';
import { TipoMetada, TipoModulo } from '../enums/enums';
import { Altas_Payload, dbResponse } from '../models/Model';


@Injectable({
  providedIn: 'root'
})

export class FileService {

  API_URI = GlobalVariable.BASE_API_URL;
  validationData = null;
  private storageKey = 'validationData';

  constructor(private _http: HttpClient
  ) { }


  postGenericSP(body: any): Observable<any>
  {
    return this._http.post(`${this.API_URI}/User/GET_GENERIC_SP`,body);
  }

  getMetaDataUI(tipoModulo: TipoModulo, tipoMetada: TipoMetada, contrato: string='NONE'): Observable<any>
  {
    return this._http.get(`${this.API_URI}/Metadata/GET_METADATA_UI/${tipoModulo}/${tipoMetada}/${contrato}`);
  }

  getResumen(tipomodulo: TipoModulo, id: number) 
  {
      return this._http.get(`${this.API_URI}/Metadata/GET_RESUMEN/${tipomodulo}/${id}`);
  }

  getFill(tipomodulo: TipoModulo, id: number) 
  {
      return this._http.get(`${this.API_URI}/Metadata/GET_FILL/${tipomodulo}/${id}`);
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

  ObtenerContratoById(user: number, municipio: number, contrato: number) : Observable<any> {

    var body = { id_user: user, id_organismo: municipio, id_contrato: contrato };

    return this._http.post(`${this.API_URI}/contract/obtenercontratobyid`, body, {
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

  downloadOutputFile(tipoModulo: TipoModulo, id: number): Observable<Blob> {
    const url = `${this.API_URI}/Upload/downloadtxtfile/${tipoModulo}/${id}`;
    return this._http.get(url, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    });
  }

  getListForCombo(tipoModulo: TipoModulo): Observable<any> {
    const url = `${this.API_URI}/file/LIST_FOR_COMBO/${tipoModulo}`;
    return this._http.get(url, {
      responseType: 'json',
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    });
  }


  dropBox(file: string) {
    var body = { filename: file };
    return this._http.post(`${this.API_URI}/file/dropbox`, body, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    });
  }
  
  getJsonForScreen(jsonName: string) {
    return this._http.get('assets/json/' + jsonName + '.json');
  }

  getColumnConfig(tipo: string): Observable<any> {

    const url = `assets/json/column_shema_${tipo}.json`;
    return this._http.get<any>(url);
  }

  getUsers(): Observable<any[]> {
    const url = `${this.API_URI}/User/getUsers`;
    return this._http.get<any[]>(url);
  }

  createUser(user: any): Observable<any> {

    const url = `${this.API_URI}/User/createUser`;
    return this._http.post(url, user);
  }

  updateUser(id: number, user: any): Observable<any> {

    const url = `${this.API_URI}/User/updateUser`;
    return this._http.put(url, user);
  }

  deleteUser(id: number): Observable<any> {

    const url = `${this.API_URI}/User/deleteUser/${id}`;
    return this._http.delete(url);
  }



}
