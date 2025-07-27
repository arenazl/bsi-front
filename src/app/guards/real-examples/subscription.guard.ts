import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserSessionService } from '../../services/user-session.service';
import Swal from 'sweetalert2';

/**
 * EJEMPLO REAL 1: GUARD DE SUSCRIPCIÓN/PLAN
 * Usado en: SaaS, plataformas con planes (Basic, Pro, Enterprise)
 * 
 * Casos de uso:
 * - Spotify: Solo usuarios Premium pueden descargar música
 * - LinkedIn: Solo usuarios Pro pueden ver quién vio su perfil
 * - Zoom: Solo usuarios pagos pueden hacer reuniones de +40 min
 */
@Injectable({
  providedIn: 'root'
})
export class SubscriptionGuard implements CanActivate {
  
  constructor(
    private userSessionService: UserSessionService,
    private router: Router
  ) {}

  canActivate(route: any): boolean {
    // Obtener el plan requerido de la configuración de ruta
    const requiredPlan = route.data?.['requiredPlan'] || 'basic';
    const feature = route.data?.['feature'] || 'esta función';
    
    // Simular datos del usuario (en producción vendría del backend)
    const user = this.userSessionService.getCurrentUserData();
    const userPlan = user?.subscription?.plan || 'basic';
    const daysLeft = user?.subscription?.daysLeft || 0;
    
    // Jerarquía de planes
    const planHierarchy: { [key: string]: number } = {
      'basic': 1,
      'pro': 2,
      'enterprise': 3
    };
    
    const userPlanLevel = planHierarchy[userPlan] || 0;
    const requiredPlanLevel = planHierarchy[requiredPlan] || 999;
    
    console.log(`SubscriptionGuard - Usuario tiene plan: ${userPlan}, requiere: ${requiredPlan}`);
    
    // Verificar si tiene el plan adecuado
    if (userPlanLevel >= requiredPlanLevel) {
      
      // Advertir si está por vencer
      if (daysLeft > 0 && daysLeft <= 7) {
        Swal.fire({
          icon: 'warning',
          title: 'Tu suscripción está por vencer',
          text: `Te quedan ${daysLeft} días de tu plan ${userPlan}`,
          confirmButtonText: 'Entendido',
          showCancelButton: true,
          cancelButtonText: 'Renovar ahora'
        }).then((result) => {
          if (!result.isConfirmed) {
            this.router.navigate(['/billing/upgrade']);
          }
        });
      }
      
      return true;
    }
    
    // No tiene el plan adecuado - Mostrar opciones de upgrade
    Swal.fire({
      icon: 'info',
      title: 'Función Premium',
      html: `
        <p>Para acceder a <strong>${feature}</strong> necesitás el plan <strong>${requiredPlan}</strong> o superior.</p>
        <p>Tu plan actual: <strong>${userPlan}</strong></p>
        <br>
        <p>¿Querés ver los beneficios del plan ${requiredPlan}?</p>
      `,
      showCancelButton: true,
      confirmButtonText: 'Ver planes',
      cancelButtonText: 'Volver',
      confirmButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/pricing'], { 
          queryParams: { 
            feature: feature,
            suggestedPlan: requiredPlan 
          }
        });
      } else {
        this.router.navigate(['/dashboard']);
      }
    });
    
    return false;
  }
}

/**
 * USO EN RUTAS:
 * 
 * {
 *   path: 'reports/advanced',
 *   component: AdvancedReportsComponent,
 *   canActivate: [AuthGuard, SubscriptionGuard],
 *   data: { 
 *     requiredPlan: 'pro',
 *     feature: 'Reportes Avanzados'
 *   }
 * }
 * 
 * {
 *   path: 'api/unlimited',
 *   component: ApiConfigComponent,
 *   canActivate: [AuthGuard, SubscriptionGuard],
 *   data: { 
 *     requiredPlan: 'enterprise',
 *     feature: 'API Ilimitada'
 *   }
 * }
 */