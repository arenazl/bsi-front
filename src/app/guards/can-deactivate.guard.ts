import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import Swal from 'sweetalert2';

/**
 * Interface que deben implementar los componentes
 * que quieran usar este guard
 */
export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

/**
 * Guard para prevenir que el usuario salga de una página con cambios sin guardar
 * Útil para formularios y editores
 */
@Injectable({
  providedIn: 'root'
})
export class CanDeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
  
  canDeactivate(
    component: CanComponentDeactivate
  ): Observable<boolean> | Promise<boolean> | boolean {
    
    // Si el componente no implementa canDeactivate, permitir salir
    if (!component.canDeactivate) {
      return true;
    }

    // Delegar la decisión al componente
    const result = component.canDeactivate();
    
    // Si el componente retorna false, mostrar confirmación
    if (result === false) {
      return Swal.fire({
        title: '¿Estás seguro?',
        text: 'Hay cambios sin guardar. ¿Querés salir de todas formas?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, salir',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        return result.isConfirmed;
      });
    }

    return result;
  }
}