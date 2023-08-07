import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalVariable } from '../global';


@Injectable({
  providedIn: 'root'
})

export class FileService {

  API_URI = GlobalVariable.BASE_API_URL;

  constructor(private _http:HttpClient){}

  downloadFile(file:string){
      var body = {filename:file};

      return this._http.post(`${this.API_URI}/file/download`,body,{
          responseType : 'blob',
          headers:new HttpHeaders().append('Content-Type','application/json')
      });
  }

  dropBox(file:string){
    
    var body = {filename:file};

    return this._http.post(`${this.API_URI}/file/dropbox`,body,{
        responseType : 'blob',
        headers:new HttpHeaders().append('Content-Type','application/json')
    });
}

}
