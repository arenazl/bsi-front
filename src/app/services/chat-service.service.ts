import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private API_URI = environment.apiUrl;

  constructor(private _http: HttpClient) {}

  sendMessage(message: string): Observable<any> 
  {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this._http.post(`${this.API_URI}/openai/message`, { message }, { headers });
  }
}