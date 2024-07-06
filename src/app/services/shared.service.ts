import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Usuario } from '../models/Model';




@Injectable({
providedIn: 'root'
})

export class SharedService {

usuario = <any>{};
private subject = new Subject<any>();
  

sendClickEvent(usuario:Usuario) {
  this.subject.next(usuario);
}
 

getClickEvent(): Observable<Usuario>{ 
  return this.subject.asObservable();
}
}
