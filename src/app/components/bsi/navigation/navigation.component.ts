import { Usuario } from 'src/app/models/Model';
import { SharedService } from '../../../services/shared.service';
import { UserSessionService, UserSession } from '../../../services/user-session.service';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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
  mobileMenuOpen = false;
  themeMenuOpen = false;
  currentTheme = 'azul-etereo';

  constructor(
    private sharedService: SharedService, 
    private userSessionService: UserSessionService,
    private router: Router
  ) {
    // Mantener compatibilidad con el sistema actual de eventos
    const clickEventSubscription = this.sharedService.getClickEvent().subscribe(us => {
      console.log('NavigationComponent - Evento recibido:', us);
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
    console.log('NavigationComponent - ngOnInit');
    
    // Verificar autenticación usando el servicio
    if (!this.userSessionService.isAuthenticated()) {
      const nombre = sessionStorage.getItem('Nombre');
      console.log('NavigationComponent - Verificando auth, nombre:', nombre);
      if (!nombre) {
        this.router.navigate(['/login']);
        return;
      }
    }

    // Si hay datos en sessionStorage pero no en el servicio, cargarlos
    if (!this.session?.user) {
      const nombre = sessionStorage.getItem('Nombre');
      const apellido = sessionStorage.getItem('Apellido');
      const organismo = sessionStorage.getItem('Organismo');
      
      console.log('NavigationComponent - Datos de sessionStorage:', { nombre, apellido, organismo });

      if (nombre && apellido) {
        this.usuario.Nombre = nombre;
        this.usuario.Apellido = apellido;
        this.usuario.Nombre_Organismo = organismo || '';
        this.showNav = true;
        console.log('NavigationComponent - Usuario configurado:', this.usuario);
      }
    }

    // Cargar tema guardado
    const savedTheme = localStorage.getItem('bsi-theme');
    if (savedTheme) {
      this.currentTheme = savedTheme;
      this.applyTheme(savedTheme);
    }
  }

  ngOnDestroy() {
    // Limpiar suscripciones para evitar memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const themeButton = document.querySelector('[title="Cambiar tema"]');
    const themeDropdown = document.querySelector('.absolute.right-0.mt-2.w-56');
    
    if (themeButton && !themeButton.contains(target) && themeDropdown && !themeDropdown.contains(target)) {
      this.themeMenuOpen = false;
    }
  }

  /**
   * Método para cerrar sesión
   */
  logout() {
    this.userSessionService.clearSession();
    this.router.navigate(['/login']);
  }

  /**
   * Cambiar tema
   */
  changeTheme(theme: string) {
    console.log('Cambiando tema a:', theme);
    this.currentTheme = theme;
    this.applyTheme(theme);
    localStorage.setItem('bsi-theme', theme);
    this.themeMenuOpen = false;
  }

  /**
   * Aplicar tema
   */
  private applyTheme(theme: string) {
    console.log('Aplicando tema:', theme);
    
    // Mapa de temas con sus colores
    const themes: { [key: string]: any } = {
      'azul-etereo': {
        '--primary-color': '#E0EFFF',
        '--primary-color-rgb': '224, 239, 255',
        '--accent-color-rgb': '255, 107, 0',
        '--secondary-color': '#B8D4F1',
        '--secondary-color-rgb': '184, 212, 241',
        '--accent-color': '#FF6B00',
        '--complementary-color': '#FFE5D0',
        '--navbar-bg': '#4A7EC7',
        '--navbar-text': '#ffffff',
        '--navbar-hover': 'rgba(255, 255, 255, 0.15)',
        '--header-gradient-start': '#E0EFFF',
        '--header-gradient-end': '#B8D4F1',
        '--header-text': '#1e3a8a',
        '--header-text-secondary': 'rgba(30, 58, 138, 0.85)',
        '--btn-primary-bg': '#FF6B00',
        '--btn-primary-hover': '#E85D00',
        '--btn-primary-text': '#ffffff',
        '--btn-secondary-bg': '#E0EFFF',
        '--btn-secondary-hover': '#C5E0FF',
        '--btn-secondary-text': '#1e3a8a',
        '--btn-accent-bg': '#FFE5D0',
        '--btn-accent-hover': '#FFD9B8',
        '--btn-accent-border': '#FF6B00',
        '--btn-accent-text': '#000000',
        '--btn-border-radius': '0.75rem',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#F8FBFF',
        '--bg-tertiary': '#E0EFFF',
        '--border-color': '#C5E0FF',
        '--text-primary': '#0f172a',
        '--text-secondary': '#475569',
        '--shadow-color': 'rgba(74, 126, 199, 0.1)',
        '--shadow-hover': 'rgba(255, 107, 0, 0.2)'
      },
      'verde-natural': {
        '--primary-color': '#4A5D23',
        '--primary-color-rgb': '74, 93, 35',
        '--accent-color-rgb': '245, 245, 220',
        '--secondary-color': '#6B8E3A',
        '--secondary-color-rgb': '107, 142, 58',
        '--accent-color': '#F5F5DC',
        '--complementary-color': '#F5F5DC',
        '--navbar-bg': '#4A5D23',
        '--navbar-text': '#ffffff',
        '--navbar-hover': 'rgba(245, 245, 220, 0.2)',
        '--header-gradient-start': '#4A5D23',
        '--header-gradient-end': '#6B8E3A',
        '--header-text': '#ffffff',
        '--header-text-secondary': 'rgba(255, 255, 255, 0.9)',
        '--btn-primary-bg': '#4A5D23',
        '--btn-primary-hover': '#3B4A1C',
        '--btn-primary-text': '#ffffff',
        '--btn-secondary-bg': '#F5F5DC',
        '--btn-secondary-hover': '#EBEBC4',
        '--btn-secondary-text': '#4A5D23',
        '--btn-accent-bg': '#F5F5DC',
        '--btn-accent-hover': '#EBEBC4',
        '--btn-accent-border': '#8FAF4C',
        '--btn-accent-text': '#2C3A13',
        '--btn-border-radius': '0.75rem',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#FAFAF8',
        '--bg-tertiary': '#F5F5DC',
        '--border-color': '#D4D4B8',
        '--text-primary': '#1A2010',
        '--text-secondary': '#4A5D23',
        '--shadow-color': 'rgba(74, 93, 35, 0.1)',
        '--shadow-hover': 'rgba(74, 93, 35, 0.2)'
      },
      'indigo-mistico': {
        '--primary-color': '#4C51A2',
        '--primary-color-rgb': '76, 81, 162',
        '--accent-color-rgb': '251, 234, 235',
        '--secondary-color': '#6B70C4',
        '--secondary-color-rgb': '107, 112, 196',
        '--accent-color': '#FBEAEB',
        '--complementary-color': '#FBEAEB',
        '--navbar-bg': '#4C51A2',
        '--navbar-text': '#ffffff',
        '--navbar-hover': 'rgba(251, 234, 235, 0.2)',
        '--header-gradient-start': '#4C51A2',
        '--header-gradient-end': '#6B70C4',
        '--header-text': '#ffffff',
        '--header-text-secondary': 'rgba(255, 255, 255, 0.95)',
        '--btn-primary-bg': '#4C51A2',
        '--btn-primary-hover': '#3C4192',
        '--btn-primary-text': '#ffffff',
        '--btn-secondary-bg': '#FBEAEB',
        '--btn-secondary-hover': '#F7D5D7',
        '--btn-secondary-text': '#4C51A2',
        '--btn-accent-bg': '#FBEAEB',
        '--btn-accent-hover': '#F7D5D7',
        '--btn-accent-border': '#D8A7CA',
        '--btn-accent-text': '#2E3156',
        '--btn-border-radius': '0.75rem',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#FCFBFD',
        '--bg-tertiary': '#F5F4FA',
        '--border-color': '#D5D7E8',
        '--text-primary': '#1A1C34',
        '--text-secondary': '#4C51A2',
        '--shadow-color': 'rgba(76, 81, 162, 0.1)',
        '--shadow-hover': 'rgba(76, 81, 162, 0.2)'
      },
      'negro-intenso': {
        '--primary-color': '#1A1A1A',
        '--primary-color-rgb': '26, 26, 26',
        '--accent-color-rgb': '255, 215, 0',
        '--secondary-color': '#2D2D2D',
        '--secondary-color-rgb': '45, 45, 45',
        '--accent-color': '#FFD700',
        '--complementary-color': '#FFD700',
        '--navbar-bg': '#1A1A1A',
        '--navbar-text': '#ffffff',
        '--navbar-hover': 'rgba(255, 215, 0, 0.2)',
        '--header-gradient-start': '#1A1A1A',
        '--header-gradient-end': '#2D2D2D',
        '--header-text': '#FFD700',
        '--header-text-secondary': 'rgba(255, 215, 0, 0.85)',
        '--btn-primary-bg': '#FFD700',
        '--btn-primary-hover': '#FFC700',
        '--btn-primary-text': '#1A1A1A',
        '--btn-secondary-bg': '#2D2D2D',
        '--btn-secondary-hover': '#3A3A3A',
        '--btn-secondary-text': '#FFD700',
        '--btn-accent-bg': '#FFD700',
        '--btn-accent-hover': '#FFC700',
        '--btn-accent-border': '#FFB700',
        '--btn-accent-text': '#1A1A1A',
        '--btn-border-radius': '0.75rem',
        '--bg-primary': '#0D0D0D',
        '--bg-secondary': '#1A1A1A',
        '--bg-tertiary': '#2D2D2D',
        '--border-color': '#3A3A3A',
        '--text-primary': '#F5F5F5',
        '--text-secondary': '#CCCCCC',
        '--shadow-color': 'rgba(255, 215, 0, 0.1)',
        '--shadow-hover': 'rgba(255, 215, 0, 0.3)'
      }
    };
    
    // Aplicar las variables CSS directamente en el elemento root
    const root = document.documentElement;
    const themeVars = themes[theme] || themes['azul-etereo'];
    
    Object.keys(themeVars).forEach(varName => {
      root.style.setProperty(varName, themeVars[varName]);
    });
    
    // También establecer el atributo para mantener compatibilidad
    root.setAttribute('data-theme', theme);
    
    // Verificar que los estilos se están aplicando
    setTimeout(() => {
      console.log('Variables CSS aplicadas directamente');
      console.log('--navbar-bg:', root.style.getPropertyValue('--navbar-bg'));
      
      const navbarElement = document.querySelector('.navbar-theme');
      if (navbarElement) {
        const navbarStyle = window.getComputedStyle(navbarElement);
        console.log('Background actual de navbar:', navbarStyle.backgroundColor);
      }
    }, 100);
  }
}
