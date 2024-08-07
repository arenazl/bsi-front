import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Solicitud, Usuario, Params, Refuerzo, FinPago } from '../models/Model';
import { Observable } from 'rxjs';
import { GlobalVariable } from '../../environments/global';


@Injectable({
  providedIn: 'root'
})

export class LegajoService {

  public API_URI = GlobalVariable.BASE_API_URL;

  constructor(private http: HttpClient) { }

  getGames(par: Params) {
    return this.http.post(`${this.API_URI}/legajo/list`, par);
  }

  getVentas(id_barrio: number) {
    return this.http.get(`${this.API_URI}/legajo/ventas/${id_barrio}`);
  }

  getGame(id: string) {
    return this.http.get(`${this.API_URI}/legajo/${id}}`);
  }

  deleteGame(id: string) {
    return this.http.delete(`${this.API_URI}/legajo/${id}`);
  }


  saveGame(game: Solicitud) {
    return this.http.post(`${this.API_URI}/legajo`, game);
  }

  saveRefuerzo(refuerzo: Refuerzo) {
    return this.http.post(`${this.API_URI}/legajo/refuerzo`, refuerzo);
  }

  saveCuota(refuerzo: Refuerzo) {
    return this.http.post(`${this.API_URI}/legajo/cuota`, refuerzo);
  }

  saveFinCuota(fin: FinPago) {
    return this.http.post(`${this.API_URI}/legajo/fincuota`, fin);
  }

  uploadFile(form: FormData) {
    return this.http.post(`${this.API_URI}/legajo/upload`, form);
  }

  updateGame(id: number | undefined, updatedGame: Solicitud): Observable<Solicitud> {
    return this.http.put(`${this.API_URI}/legajo/${id}`, updatedGame);
  }

  getUsuario(usuario: any) {
    return this.http.post(`${this.API_URI}/legajo/login`, usuario);
  }

}
