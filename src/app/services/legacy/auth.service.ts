import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LoginCredentials {
  nombre: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    nombre: string;
    email?: string;
    organismo_id?: number;
    rol?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URI = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Cargar usuario desde localStorage al inicializar
    this.loadUserFromStorage();
  }

  /**
   * Realizar login con credenciales
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URI}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          this.setSession(response);
        }
      })
    );
  }

  /**
   * Realizar logout
   */
  logout(): Observable<any> {
    return this.http.post(`${this.API_URI}/auth/logout`, {}).pipe(
      tap(() => {
        this.clearSession();
      })
    );
  }

  /**
   * Refrescar token de acceso
   */
  refreshToken(refreshToken: string): Observable<any> {
    return this.http.post(`${this.API_URI}/auth/refresh`, { refreshToken }).pipe(
      tap(response => {
        if (response.token) {
          this.updateToken(response.token);
        }
      })
    );
  }

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Verificar si el token no ha expirado
    return !this.isTokenExpired(token);
  }

  /**
   * Obtener el token actual
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Obtener el usuario actual
   */
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  /**
   * Establecer sesión después del login
   */
  private setSession(authResponse: AuthResponse): void {
    localStorage.setItem('auth_token', authResponse.token);
    localStorage.setItem('current_user', JSON.stringify(authResponse.user));
    
    // Actualizar sessionStorage para compatibilidad con código existente
    sessionStorage.setItem('idUser', authResponse.user.id.toString());
    if (authResponse.user.organismo_id) {
      sessionStorage.setItem('IdOrganismo', authResponse.user.organismo_id.toString());
    }
    
    this.currentUserSubject.next(authResponse.user);
  }

  /**
   * Limpiar sesión en logout
   */
  private clearSession(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('current_user');
    
    // Limpiar sessionStorage
    sessionStorage.clear();
    
    this.currentUserSubject.next(null);
  }

  /**
   * Actualizar solo el token
   */
  private updateToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  /**
   * Cargar usuario desde localStorage
   */
  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error al cargar usuario desde storage:', error);
        this.clearSession();
      }
    }
  }

  /**
   * Verificar si el token ha expirado
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true; // Si no se puede decodificar, considerar expirado
    }
  }
}