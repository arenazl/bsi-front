import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MenuActivity {
  title: string;
  description: string;
  enabled: boolean;
  items: MenuActivityItem[];
}

export interface MenuActivityItem {
  description: string;
  link: string;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la configuración del menú principal desde un archivo JSON estático
   * @returns Observable con la configuración de actividades del menú
   */
  getMenuConfiguration(): Observable<MenuActivity[]> {
    return this.http.get<MenuActivity[]>('assets/json/mainmenu.json');
  }
}