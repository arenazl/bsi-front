import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

/**
 * EJEMPLO REAL 3: GUARD DE FEATURE FLAGS
 * Usado en: Despliegue gradual, A/B testing, features beta
 * 
 * Casos de uso:
 * - Facebook: Nuevas features se activan gradualmente por región
 * - Google: Funciones beta para usuarios seleccionados
 * - Netflix: Diferentes interfaces según grupo de prueba
 * - WhatsApp: Features nuevas por porcentaje de usuarios
 */
@Injectable({
  providedIn: 'root'
})
export class FeatureFlagGuard implements CanActivate {
  
  // Cache de feature flags para no consultar en cada navegación
  private featureCache: Map<string, boolean> = new Map();
  private cacheExpiry: Map<string, number> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
  
  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  canActivate(route: any): Observable<boolean> | boolean {
    const featureName = route.data?.['feature'];
    const fallbackBehavior = route.data?.['fallback'] || 'hide'; // hide, show, redirect
    
    if (!featureName) {
      console.error('FeatureFlagGuard - No se especificó feature');
      return false;
    }
    
    // Verificar cache
    if (this.isCacheValid(featureName)) {
      const cached = this.featureCache.get(featureName) || false;
      console.log(`FeatureFlagGuard - ${featureName}: ${cached} (cached)`);
      return this.handleFeatureAccess(cached, featureName, route);
    }
    
    // Consultar al servidor
    return this.checkFeatureFlag(featureName).pipe(
      map(isEnabled => {
        // Guardar en cache
        this.featureCache.set(featureName, isEnabled);
        this.cacheExpiry.set(featureName, Date.now() + this.CACHE_DURATION);
        
        console.log(`FeatureFlagGuard - ${featureName}: ${isEnabled} (from server)`);
        return this.handleFeatureAccess(isEnabled, featureName, route);
      }),
      catchError(error => {
        console.error('Error verificando feature flag:', error);
        
        // Comportamiento en caso de error
        if (fallbackBehavior === 'show') {
          return of(true);
        } else if (fallbackBehavior === 'redirect') {
          this.router.navigate(['/features-unavailable']);
          return of(false);
        }
        
        return of(false);
      })
    );
  }
  
  private checkFeatureFlag(featureName: string): Observable<boolean> {
    // Simular llamada al servidor
    // En producción esto consultaría un servicio real
    
    // Obtener datos del usuario para segmentación
    const userId = sessionStorage.getItem('idUser') || '0';
    const userRegion = this.getUserRegion();
    const userSegment = this.getUserSegment(userId);
    
    // Simular respuesta del servidor basada en reglas
    return new Observable(observer => {
      setTimeout(() => {
        const isEnabled = this.evaluateFeatureRules(featureName, {
          userId,
          userRegion,
          userSegment,
          randomBucket: this.getRandomBucket(userId)
        });
        
        observer.next(isEnabled);
        observer.complete();
      }, 300); // Simular latencia de red
    });
  }
  
  private evaluateFeatureRules(featureName: string, context: any): boolean {
    // Reglas de ejemplo para diferentes features
    const rules: { [key: string]: () => boolean } = {
      // Nueva UI - Rollout gradual por porcentaje
      'new-ui': () => {
        const percentage = 30; // 30% de usuarios
        return context.randomBucket < percentage;
      },
      
      // Feature Premium - Solo para usuarios específicos
      'ai-assistant': () => {
        const betaUsers = ['1234', '5678', '9012'];
        return betaUsers.includes(context.userId);
      },
      
      // Feature por región
      'instant-payments': () => {
        const enabledRegions = ['AR', 'BR', 'MX'];
        return enabledRegions.includes(context.userRegion);
      },
      
      // A/B Testing - 50/50
      'new-checkout': () => {
        return context.randomBucket < 50;
      },
      
      // Feature en mantenimiento
      'social-features': () => {
        return false; // Deshabilitado temporalmente
      },
      
      // Feature por segmento de usuario
      'advanced-analytics': () => {
        return ['power-user', 'enterprise'].includes(context.userSegment);
      }
    };
    
    const rule = rules[featureName];
    return rule ? rule() : false;
  }
  
  private handleFeatureAccess(isEnabled: boolean, featureName: string, route: any): boolean {
    if (isEnabled) {
      // Feature habilitada - Registrar uso
      this.trackFeatureUsage(featureName);
      return true;
    }
    
    // Feature deshabilitada - Mostrar mensaje apropiado
    const customMessage = route.data?.['disabledMessage'];
    const showNotification = route.data?.['showNotification'] !== false;
    
    if (showNotification) {
      this.showFeatureUnavailable(featureName, customMessage);
    }
    
    // Redirigir si se especificó
    const redirectTo = route.data?.['redirectTo'];
    if (redirectTo) {
      this.router.navigate([redirectTo]);
    }
    
    return false;
  }
  
  private showFeatureUnavailable(featureName: string, customMessage?: string) {
    const messages: { [key: string]: string } = {
      'new-ui': `
        <p>🎨 <strong>Nueva Interfaz (Beta)</strong></p>
        <p>Estamos desplegando gradualmente nuestra nueva interfaz.</p>
        <p>Tu cuenta será actualizada pronto.</p>
      `,
      'ai-assistant': `
        <p>🤖 <strong>Asistente IA</strong></p>
        <p>Esta función está en fase beta limitada.</p>
        <p><a href="/beta-signup">Solicitá acceso anticipado</a></p>
      `,
      'instant-payments': `
        <p>⚡ <strong>Pagos Instantáneos</strong></p>
        <p>Próximamente disponible en tu región.</p>
        <p>Mientras tanto, podés usar transferencias tradicionales.</p>
      `,
      'social-features': `
        <p>🔧 <strong>En Mantenimiento</strong></p>
        <p>Las funciones sociales están temporalmente deshabilitadas.</p>
        <p>Volverán pronto con mejoras.</p>
      `
    };
    
    const message = customMessage || messages[featureName] || `
      <p>Esta función no está disponible actualmente.</p>
      <p>Estamos trabajando para habilitarla pronto.</p>
    `;
    
    Swal.fire({
      icon: 'info',
      title: 'Función No Disponible',
      html: message,
      confirmButtonText: 'Entendido',
      showCloseButton: true
    });
  }
  
  private isCacheValid(featureName: string): boolean {
    const expiry = this.cacheExpiry.get(featureName);
    return expiry !== undefined && Date.now() < expiry;
  }
  
  private getUserRegion(): string {
    // En producción vendría del perfil del usuario o geolocalización
    return 'AR';
  }
  
  private getUserSegment(userId: string): string {
    // En producción vendría del análisis de uso
    const id = parseInt(userId) || 0;
    if (id < 1000) return 'early-adopter';
    if (id < 10000) return 'regular';
    return 'power-user';
  }
  
  private getRandomBucket(userId: string): number {
    // Generar número consistente basado en userId (0-99)
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % 100;
  }
  
  private trackFeatureUsage(featureName: string) {
    // En producción enviaría métricas al servidor
    console.log(`Analytics: Feature "${featureName}" accessed`);
  }
  
  // Método público para forzar recarga de flags
  public clearCache(featureName?: string) {
    if (featureName) {
      this.featureCache.delete(featureName);
      this.cacheExpiry.delete(featureName);
    } else {
      this.featureCache.clear();
      this.cacheExpiry.clear();
    }
  }
}

/**
 * USO EN RUTAS:
 * 
 * // Nueva UI con rollout gradual
 * {
 *   path: 'dashboard-v2',
 *   component: DashboardV2Component,
 *   canActivate: [AuthGuard, FeatureFlagGuard],
 *   data: { 
 *     feature: 'new-ui',
 *     fallback: 'redirect',
 *     redirectTo: '/dashboard'
 *   }
 * }
 * 
 * // Feature beta con mensaje custom
 * {
 *   path: 'ai/assistant',
 *   component: AiAssistantComponent,
 *   canActivate: [AuthGuard, FeatureFlagGuard],
 *   data: { 
 *     feature: 'ai-assistant',
 *     disabledMessage: '<p>🚀 El asistente IA llegará en Q2 2024</p>'
 *   }
 * }
 * 
 * // A/B Testing silencioso
 * {
 *   path: 'checkout',
 *   component: NewCheckoutComponent,
 *   canActivate: [AuthGuard, FeatureFlagGuard],
 *   data: { 
 *     feature: 'new-checkout',
 *     fallback: 'redirect',
 *     redirectTo: '/checkout-classic',
 *     showNotification: false // Sin avisos al usuario
 *   }
 * }
 */