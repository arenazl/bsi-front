import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import Swal from 'sweetalert2';

/**
 * EJEMPLO REAL 2: GUARD DE HORARIO COMERCIAL
 * Usado en: Bancos, sistemas de trading, soporte técnico
 * 
 * Casos de uso:
 * - Homebanking: Transferencias solo en horario bancario
 * - Trading: Operaciones solo cuando el mercado está abierto  
 * - Soporte: Chat solo en horario de atención
 * - Sistemas escolares: Inscripciones solo en fechas específicas
 */
@Injectable({
  providedIn: 'root'
})
export class BusinessHoursGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(route: any): boolean {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Domingo, 6 = Sábado
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const currentTime = hour + minutes / 60;
    
    // Obtener configuración de la ruta
    const config = route.data?.['businessHours'] || {
      days: [1, 2, 3, 4, 5], // Lun-Vie por defecto
      startHour: 9,
      endHour: 18,
      timezone: 'America/Argentina/Buenos_Aires'
    };
    
    const operation = route.data?.['operation'] || 'esta operación';
    const customMessage = route.data?.['message'];
    
    console.log(`BusinessHoursGuard - Día: ${dayOfWeek}, Hora: ${hour}:${minutes}`);
    
    // Verificar día de la semana
    const isWorkingDay = config.days.includes(dayOfWeek);
    
    // Verificar horario
    const isWorkingHours = currentTime >= config.startHour && currentTime < config.endHour;
    
    // Casos especiales (feriados, mantenimiento, etc)
    const isHoliday = this.checkHoliday(now);
    const isMaintenanceWindow = this.checkMaintenance(now);
    
    // Si es horario válido y no hay restricciones
    if (isWorkingDay && isWorkingHours && !isHoliday && !isMaintenanceWindow) {
      
      // Advertencia si está cerca del cierre
      if (currentTime >= config.endHour - 0.5) { // 30 min antes del cierre
        const minutesLeft = Math.floor((config.endHour - currentTime) * 60);
        Swal.fire({
          icon: 'warning',
          title: 'Próximo al cierre',
          text: `El servicio cierra en ${minutesLeft} minutos. Completá tu operación rápidamente.`,
          timer: 5000,
          timerProgressBar: true,
          showConfirmButton: false
        });
      }
      
      return true;
    }
    
    // Construir mensaje según el caso
    let message = customMessage || this.buildMessage(
      isWorkingDay, 
      isWorkingHours, 
      isHoliday, 
      isMaintenanceWindow,
      config,
      operation
    );
    
    // Mostrar mensaje y opciones
    Swal.fire({
      icon: 'info',
      title: 'Fuera de Horario',
      html: message,
      confirmButtonText: 'Entendido',
      showCancelButton: true,
      cancelButtonText: 'Ver horarios',
      footer: '<a href="/contact">¿Necesitás ayuda urgente?</a>'
    }).then((result) => {
      if (!result.isConfirmed) {
        this.router.navigate(['/horarios']);
      }
    });
    
    return false;
  }
  
  private checkHoliday(date: Date): boolean {
    // Feriados argentinos 2024 (ejemplo)
    const holidays = [
      '2024-01-01', // Año nuevo
      '2024-03-29', // Viernes Santo
      '2024-05-01', // Día del trabajo
      '2024-05-25', // 25 de Mayo
      '2024-06-20', // Día de la Bandera
      '2024-07-09', // Día de la Independencia
      // ... más feriados
    ];
    
    const dateStr = date.toISOString().split('T')[0];
    return holidays.includes(dateStr);
  }
  
  private checkMaintenance(date: Date): boolean {
    // Ventana de mantenimiento: Domingos 2-6 AM
    return date.getDay() === 0 && date.getHours() >= 2 && date.getHours() < 6;
  }
  
  private buildMessage(
    isWorkingDay: boolean, 
    isWorkingHours: boolean, 
    isHoliday: boolean, 
    isMaintenance: boolean,
    config: any,
    operation: string
  ): string {
    
    if (isMaintenance) {
      return `
        <p>🔧 <strong>Mantenimiento programado</strong></p>
        <p>Estamos mejorando nuestros servicios.</p>
        <p>Horario de mantenimiento: Domingos 2:00 - 6:00 AM</p>
      `;
    }
    
    if (isHoliday) {
      return `
        <p>🏖️ <strong>Feriado Nacional</strong></p>
        <p>Nuestras oficinas están cerradas hoy.</p>
        <p>Te esperamos el próximo día hábil.</p>
      `;
    }
    
    if (!isWorkingDay) {
      return `
        <p>📅 ${operation} solo está disponible de lunes a viernes.</p>
        <p><strong>Horario:</strong> ${config.startHour}:00 - ${config.endHour}:00 hs</p>
      `;
    }
    
    if (!isWorkingHours) {
      const now = new Date();
      const nextOpen = new Date(now);
      
      if (now.getHours() >= config.endHour) {
        // Ya cerró hoy, abrir mañana
        nextOpen.setDate(nextOpen.getDate() + 1);
      }
      nextOpen.setHours(config.startHour, 0, 0, 0);
      
      return `
        <p>⏰ ${operation} está disponible en horario de atención.</p>
        <p><strong>Horario:</strong> ${config.startHour}:00 - ${config.endHour}:00 hs</p>
        <p><strong>Próxima apertura:</strong> ${nextOpen.toLocaleString('es-AR')}</p>
      `;
    }
    
    return 'El servicio no está disponible en este momento.';
  }
}

/**
 * USO EN RUTAS:
 * 
 * // Transferencias bancarias solo en horario bancario
 * {
 *   path: 'transferencias/otras-cuentas',
 *   component: TransferenciasComponent,
 *   canActivate: [AuthGuard, BusinessHoursGuard],
 *   data: { 
 *     businessHours: {
 *       days: [1, 2, 3, 4, 5], // Lun-Vie
 *       startHour: 10,
 *       endHour: 15
 *     },
 *     operation: 'Transferencias a terceros'
 *   }
 * }
 * 
 * // Inscripciones solo en período específico
 * {
 *   path: 'inscripciones/nuevo-ciclo',
 *   component: InscripcionesComponent,
 *   canActivate: [AuthGuard, BusinessHoursGuard],
 *   data: {
 *     businessHours: {
 *       days: [1, 2, 3, 4, 5, 6], // Lun-Sab
 *       startHour: 8,
 *       endHour: 20
 *     },
 *     operation: 'Inscripciones',
 *     message: '<p>📚 Las inscripciones están cerradas</p><p>Próximo período: Marzo 2024</p>'
 *   }
 * }
 */