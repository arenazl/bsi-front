import { Lotes, LotesFilterOptions, LotesParams } from '../models/Model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Solicitud, Usuario, Params } from '../models/Model';
import { Observable } from 'rxjs';
import { GlobalVariable } from '../global';


@Injectable({
  providedIn: 'root'
})

export class LotesService {

  public API_URI = GlobalVariable.BASE_API_URL;

  constructor(private http: HttpClient) { }

  getLotes(lotesFilter: LotesFilterOptions) {
    return this.http.post(`${this.API_URI}/lote/list`, lotesFilter);
  }

  getMovements() {
     return this.http.get('assets/json/mainmenu.json')
  }

  updateLote(id: number | undefined, updateLote: Lotes): Observable<any> {
    return this.http.put(`${this.API_URI}/lote/${id}`, updateLote);
  }

  getProvincias() {
    return this.http.get(`${this.API_URI}/lote/provincias`);
  }

  getLocalidades(id: string) {
    return this.http.get(`${this.API_URI}/lote/localidades/${id}`);
  }

}
