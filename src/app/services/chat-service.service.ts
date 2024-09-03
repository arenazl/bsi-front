import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private apiUrl = 'http://localhost:3000/api/openai/message'; // Ajusta la URL para apuntar correctamente a tu endpoint

  constructor(private http: HttpClient) {}

  sendMessage(message: string): Observable<any> {
    // Configura las opciones de la solicitud si es necesario
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // Realiza la llamada al endpoint de tu backend
    return this.http.post<any>(this.apiUrl, { message }, { headers });
  }
}