import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FileService } from 'src/app/services/file.service';
import { dbResponse, SendFilePayload } from 'src/app/models/Model';
import { TipoMetada, TipoModulo } from 'src/app/enums/enums';
import { HttpClient } from '@angular/common/http';
import { GlobalVariable } from 'src/environments/global';

@Injectable({
  providedIn: 'root'
})

export class XslTableService {

  public API_URI = GlobalVariable.BASE_API_URL;

  constructor(private fileService: FileService, 
              private httpclient: HttpClient,
  ) {}


  getMetaData(): Observable<any> {
    return this.fileService.getMetaData(TipoModulo.NOMINA, TipoMetada.FILL);
  }

  toProperCase(str: string): string {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}