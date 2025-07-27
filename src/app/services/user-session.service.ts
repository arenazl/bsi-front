import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Usuario } from '../models/Model';

export interface UserSession {
  user: Usuario | null;
  contratos: any[] | null;
  organismo: string | null;
  isAuthenticated: boolean;
  isSuperUser: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserSessionService {

  private readonly SESSION_KEYS = {
    USER_ID: 'idUser',
    USER_NAME: 'Nombre',
    USER_LASTNAME: 'Apellido',
    ORGANISMO: 'Organismo',
    ORGANISMO_ID: 'IdOrganismo',
    CONTRATOS: 'Contratos',
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    IS_SUPER_USER: 'isSuperUser'
  };

  private sessionSubject = new BehaviorSubject<UserSession>(this.getInitialSession());
  public session$ = this.sessionSubject.asObservable();

  constructor() {
    // Sincronizar con sessionStorage al inicializar
    this.loadSessionFromStorage();
  }

  /**
   * Obtiene la sesión inicial desde sessionStorage
   */
  private getInitialSession(): UserSession {
    return {
      user: null,
      contratos: null,
      organismo: null,
      isAuthenticated: false,
      isSuperUser: false
    };
  }

  /**
   * Carga la sesión desde sessionStorage
   */
  private loadSessionFromStorage(): void {
    try {
      const userName = sessionStorage.getItem(this.SESSION_KEYS.USER_NAME);
      const userLastname = sessionStorage.getItem(this.SESSION_KEYS.USER_LASTNAME);
      const organismo = sessionStorage.getItem(this.SESSION_KEYS.ORGANISMO);
      const contratos = sessionStorage.getItem(this.SESSION_KEYS.CONTRATOS);
      const accessToken = sessionStorage.getItem(this.SESSION_KEYS.ACCESS_TOKEN);
      const isSuperUser = sessionStorage.getItem(this.SESSION_KEYS.IS_SUPER_USER) === 'true';

      if (userName && userLastname && accessToken) {
        const session: UserSession = {
          user: {
            Nombre: userName,
            Apellido: userLastname,
            // Otros campos se pueden llenar gradualmente
          } as Usuario,
          contratos: contratos ? JSON.parse(contratos) : null,
          organismo,
          isAuthenticated: !!accessToken,
          isSuperUser
        };

        this.sessionSubject.next(session);
      }
    } catch (error) {
      console.error('Error loading session from storage:', error);
    }
  }

  /**
   * Establece los datos de sesión después del login
   */
  setSession(userData: any): void {
    try {
      // Guardar en sessionStorage (mantener compatibilidad)
      sessionStorage.setItem(this.SESSION_KEYS.USER_ID, userData.Id?.toString() || '');
      sessionStorage.setItem(this.SESSION_KEYS.USER_NAME, userData.Nombre || '');
      sessionStorage.setItem(this.SESSION_KEYS.USER_LASTNAME, userData.Apellido || '');
      sessionStorage.setItem(this.SESSION_KEYS.ORGANISMO, userData.Nombre_Organismo || '');
      sessionStorage.setItem(this.SESSION_KEYS.ORGANISMO_ID, userData.IdOrganismo?.toString() || '');
      
      if (userData.contratos) {
        sessionStorage.setItem(this.SESSION_KEYS.CONTRATOS, JSON.stringify(userData.contratos));
      }
      
      // Guardar estado de super usuario
      if (userData.isSuperUser !== undefined) {
        sessionStorage.setItem(this.SESSION_KEYS.IS_SUPER_USER, userData.isSuperUser.toString());
      }

      // Actualizar el subject reactivo
      const session: UserSession = {
        user: userData as Usuario,
        contratos: userData.contratos || null,
        organismo: userData.Nombre_Organismo || null,
        isAuthenticated: true,
        isSuperUser: userData.isSuperUser === true
      };

      this.sessionSubject.next(session);
    } catch (error) {
      console.error('Error setting session:', error);
    }
  }

  /**
   * Limpia la sesión (logout)
   */
  clearSession(): void {
    // Limpiar sessionStorage
    Object.values(this.SESSION_KEYS).forEach(key => {
      sessionStorage.removeItem(key);
    });

    // Resetear el subject
    this.sessionSubject.next(this.getInitialSession());
  }

  /**
   * Obtiene el usuario actual de forma síncrona
   */
  getCurrentUser(): Usuario | null {
    return this.sessionSubject.value.user;
  }

  /**
   * Obtiene los contratos del usuario actual
   */
  getUserContracts(): any[] | null {
    return this.sessionSubject.value.contratos;
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return this.sessionSubject.value.isAuthenticated;
  }

  /**
   * Obtiene un valor específico de sessionStorage (método de compatibilidad)
   * @deprecated Usar session$ observable en su lugar
   */
  getSessionValue(key: string): string | null {
    return sessionStorage.getItem(key);
  }

  /**
   * Observable para saber si el usuario está autenticado
   */
  get isAuthenticated$(): Observable<boolean> {
    return new BehaviorSubject(this.isAuthenticated()).asObservable();
  }

  /**
   * Obtiene todos los datos del usuario actual
   * Método agregado para compatibilidad con DinamicModuleComponent
   */
  getCurrentUserData(): any {
    const session = this.sessionSubject.value;
    return {
      ...session.user,
      Contratos: session.contratos,
      Nombre_Organismo: session.organismo,
      isSuperUser: session.isSuperUser
    };
  }
  
  /**
   * Verifica si el usuario actual es super usuario
   */
  isSuperUser(): boolean {
    return this.sessionSubject.value.isSuperUser;
  }
}