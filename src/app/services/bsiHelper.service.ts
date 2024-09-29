import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FileService } from 'src/app/services/file.service';
import { dbResponse, PropertyValues, SendFilePayload } from 'src/app/models/Model';
import { TipoMetada, TipoModulo } from 'src/app/enums/enums';
import { HttpClient } from '@angular/common/http';
import { GlobalVariable } from 'src/environments/global';

@Injectable({
  providedIn: 'root'
})

export class BsiHelper {
   
   listaPropiedades:  Array<PropertyValues> = [];

  public API_URI = GlobalVariable.BASE_API_URL;

  constructor(private fileService: FileService, 
              private httpclient: HttpClient,
  ) {}

  
 generarGenericPayload(spName: string): any {
  const body: any = {};

  this.listaPropiedades.forEach((propiedad) => {
    body[propiedad.descripcion] = propiedad.valor;
  });

  this.listaPropiedades = [];
  return {
    sp_name: spName,
    body: body,
  };
  
}

contatenarSP(modulo:string, sp:string): string {
  return `${modulo}_${sp}`;
}

 agregarGenericParam(descripcion: string, valor: any) {
  this.listaPropiedades.push({ descripcion, valor });
}

  getMetaData(): Observable<any> {
    return this.fileService.getMetaData(TipoModulo.NOMINA, TipoMetada.FILL);
  }

  toProperCase(str: string): string {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }


  formatDateForFile(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00Z');
    const year = date.getUTCFullYear().toString();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }


  validateCuil(cuil: string): boolean {
    // Quitar guiones si están presentes
    const cleanedCuil = cuil.replace(/-/g, '');
    
    // Verificar que el CUIL tenga exactamente 11 dígitos
    if (!/^\d{11}$/.test(cleanedCuil)) return false;
  
    const multipliers = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
  
    // Calcular la suma con los multiplicadores
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanedCuil[i]) * multipliers[i];
    }
  
    const remainder = sum % 11;
    const verificationDigit = remainder === 0 ? 0 : remainder === 1 ? 9 : 11 - remainder;
  
    // Comparar el dígito verificador calculado con el último dígito del CUIL
    return verificationDigit === parseInt(cleanedCuil[10]);
  }

  // Validar CBU de Argentina
validateCbu(cbu: string): boolean {
  // Verificar que el CBU tenga exactamente 22 dígitos y que todos sean numéricos
  if (cbu.length !== 22 || !/^\d+$/.test(cbu)) return false;

  // Validación del primer bloque (Banco y Sucursal - 8 dígitos)
  const firstBlock = cbu.slice(0, 8);
  const weights1 = [7, 1, 3, 9, 7, 1, 3]; // Multiplicadores para los primeros 7 dígitos
  let sum1 = 0;
  for (let i = 0; i < 7; i++) {
    sum1 += parseInt(firstBlock[i]) * weights1[i];
  }
  const verification1 = (10 - (sum1 % 10)) % 10;
  // Comparar el dígito verificador calculado con el octavo dígito del primer bloque
  if (verification1 !== parseInt(firstBlock[7])) return false;

  // Validación del segundo bloque (Cuenta - 14 dígitos)
  const secondBlock = cbu.slice(8, 22);
  const weights2 = [3, 9, 7, 1, 3, 9, 7, 1, 3, 9, 7, 1, 3, 9, 7]; // Multiplicadores para los 13 dígitos
  let sum2 = 0;
  for (let i = 0; i < 13; i++) {
    sum2 += parseInt(secondBlock[i]) * weights2[i];
  }
  const verification2 = (10 - (sum2 % 10)) % 10;
  // Comparar el dígito verificador calculado con el último dígito del segundo bloque
  return verification2 === parseInt(secondBlock[13]);
}


  // Validar nombre
  validateName(name: string): boolean {
    return typeof name === 'string' && name.trim().length >= 5;
  }

}