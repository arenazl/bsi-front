import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(private http: HttpClient) { }

  sendMessage(message: string): Observable<any> {
    // Stub implementation - replace with actual API call
    return of({
      response: [{
        text: {
          value: 'Servicio de chat no implementado completamente.'
        }
      }]
    });
  }
}