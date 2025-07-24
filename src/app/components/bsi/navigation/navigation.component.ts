import { Usuario } from 'src/app/models/Model';
import { SharedService } from '../../../services/shared.service';
import { UserSessionService, UserSession } from '../../../services/user-session.service';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})

export class NavigationComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  usuario = <Usuario>{};
  showNav = true;
  session: UserSession | null = null;

  constructor(
    private sharedService: SharedService, 
    private userSessionService: UserSessionService,
    private router: Router
  ) {
    // Mantener compatibilidad con el sistema actual de eventos
    const clickEventSubscription = this.sharedService.getClickEvent().subscribe(us => {
      this.usuario = us;
      this.showNav = us.Apellido != null ? true : false;
    });
    this.subscriptions.push(clickEventSubscription);

    // Suscribirse a cambios de sesión
    const sessionSubscription = this.userSessionService.session$.subscribe(session => {
      this.session = session;
      if (session.user) {
        this.usuario = session.user;
        this.showNav = session.isAuthenticated;
      }
    });
    this.subscriptions.push(sessionSubscription);
  }

  ngOnInit() {
    // Verificar autenticación usando el servicio
    if (!this.userSessionService.isAuthenticated()) {
      const nombre = this.userSessionService.getSessionValue('Nombre');
      if (!nombre) {
        this.router.navigate(['/login']);
        return;
      }
    }

    // Si hay datos en sessionStorage pero no en el servicio, cargarlos
    if (!this.session?.user) {
      const nombre = this.userSessionService.getSessionValue('Nombre');
      const apellido = this.userSessionService.getSessionValue('Apellido');
      const organismo = this.userSessionService.getSessionValue('Organismo');

      if (nombre && apellido) {
        this.usuario.Nombre = nombre;
        this.usuario.Apellido = apellido;
        this.usuario.Nombre_Organismo = organismo || '';
      }
    }
  }

  ngOnDestroy() {
    // Limpiar suscripciones para evitar memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Método para cerrar sesión
   */
  logout() {
    this.userSessionService.clearSession();
    this.router.navigate(['/login']);
  }
}
