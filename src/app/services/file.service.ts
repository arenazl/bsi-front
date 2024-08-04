import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalVariable } from '../../environments/global';
import { Observable, Observer } from 'rxjs';
import { map } from 'jquery';
import { TipoModulo } from '../enums/enums';


@Injectable({
  providedIn: 'root'
})

export class FileService {

  API_URI = GlobalVariable.BASE_API_URL;
  validationData = null;
  private storageKey = 'validationData';

  constructor(private _http: HttpClient
  ) { }

  getTR(id: string) {
    return this._http.get(`${this.API_URI}/file/responsetr/${id}`);
  }

  getPagos(id: number): Observable<any> {
    return this._http.get(`${this.API_URI}/file/pagoslist/${id}`);
  }

  getTRList() {
    return this._http.get(`${this.API_URI}/file/responsetrforcombo`);
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

  getPagosList() {
    return this._http.get(`${this.API_URI}/file/responsepagosforcombo`);
  }

  ObtenerContratoById(user: number, municipio: number, contrato: number) {

    var body = { id_user: user, id_organismo: municipio, id_contrato: contrato };

    return this._http.post(`${this.API_URI}/file/ObtenerContratoById`, body, {
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
    const url = `${this.API_URI}/file/downloadtxtfile/${tipoModulo}/${id}`;
    return this._http.get(url, {
      responseType: 'blob',
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

  getContratoData(tipo: string): Observable<any> {
    const url = `assets/json/data_${tipo}.json`;
    return this._http.get<any>(url);
  }

}
