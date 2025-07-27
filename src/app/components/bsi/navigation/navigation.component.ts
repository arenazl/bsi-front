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
  currentTheme = 'corporate-blue';

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
      'corporate-blue': {
        '--primary-color': '#1e3a8a',
        '--primary-color-rgb': '30, 58, 138',
        '--accent-color-rgb': '96, 165, 250',
        '--secondary-color': '#3b82f6',
        '--secondary-color-rgb': '59, 130, 246',
        '--accent-color': '#60a5fa',
        '--complementary-color': '#FFF8DC',
        '--navbar-bg': '#1e3a8a',
        '--navbar-text': '#ffffff',
        '--navbar-hover': 'rgba(255, 255, 255, 0.1)',
        '--header-gradient-start': '#1e3a8a',
        '--header-gradient-end': '#2563eb',
        '--header-text': '#ffffff',
        '--header-text-secondary': 'rgba(255, 255, 255, 0.9)',
        '--btn-primary-bg': '#2563eb',
        '--btn-primary-hover': '#1d4ed8',
        '--btn-primary-text': '#ffffff',
        '--btn-secondary-bg': '#eff6ff',
        '--btn-secondary-hover': '#dbeafe',
        '--btn-secondary-text': '#1e3a8a',
        '--btn-accent-bg': '#FFF8DC',
        '--btn-accent-hover': '#FFF0C1',
        '--btn-accent-border': '#F5A623',
        '--btn-accent-text': '#000000',
        '--btn-border-radius': '0.75rem',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f8fafc',
        '--bg-tertiary': '#f1f5f9',
        '--border-color': '#e2e8f0',
        '--text-primary': '#0f172a',
        '--text-secondary': '#475569',
        '--shadow-color': 'rgba(30, 58, 138, 0.1)',
        '--shadow-hover': 'rgba(30, 58, 138, 0.2)'
      },
      'enterprise-green': {
        '--primary-color': '#14532d',
        '--primary-color-rgb': '20, 83, 45',
        '--accent-color-rgb': '74, 222, 128',
        '--secondary-color': '#16a34a',
        '--secondary-color-rgb': '22, 163, 74',
        '--accent-color': '#4ade80',
        '--complementary-color': '#FFCCBC',
        '--navbar-bg': '#14532d',
        '--navbar-text': '#ffffff',
        '--navbar-hover': 'rgba(255, 255, 255, 0.1)',
        '--header-gradient-start': '#166534',
        '--header-gradient-end': '#15803d',
        '--header-text': '#ffffff',
        '--header-text-secondary': 'rgba(255, 255, 255, 0.9)',
        '--btn-primary-bg': '#16a34a',
        '--btn-primary-hover': '#15803d',
        '--btn-primary-text': '#ffffff',
        '--btn-secondary-bg': '#f0fdf4',
        '--btn-secondary-hover': '#dcfce7',
        '--btn-secondary-text': '#14532d',
        '--btn-accent-bg': '#FFCCBC',
        '--btn-accent-hover': '#FFB6A3',
        '--btn-accent-border': '#FF8A65',
        '--btn-accent-text': '#000000',
        '--btn-border-radius': '0.75rem',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#fafffe',
        '--bg-tertiary': '#f0fdf4',
        '--border-color': '#d1fae5',
        '--text-primary': '#052e16',
        '--text-secondary': '#166534',
        '--shadow-color': 'rgba(20, 83, 45, 0.1)',
        '--shadow-hover': 'rgba(20, 83, 45, 0.2)'
      },
      'modern-purple': {
        '--primary-color': '#6b21a8',
        '--primary-color-rgb': '107, 33, 168',
        '--accent-color-rgb': '192, 132, 252',
        '--secondary-color': '#9333ea',
        '--secondary-color-rgb': '147, 51, 234',
        '--accent-color': '#c084fc',
        '--complementary-color': '#DCEDC8',
        '--navbar-bg': '#6b21a8',
        '--navbar-text': '#ffffff',
        '--navbar-hover': 'rgba(255, 255, 255, 0.15)',
        '--header-gradient-start': '#7c3aed',
        '--header-gradient-end': '#8b5cf6',
        '--header-text': '#ffffff',
        '--header-text-secondary': 'rgba(255, 255, 255, 0.95)',
        '--btn-primary-bg': '#8b5cf6',
        '--btn-primary-hover': '#7c3aed',
        '--btn-primary-text': '#ffffff',
        '--btn-secondary-bg': '#faf5ff',
        '--btn-secondary-hover': '#f3e8ff',
        '--btn-secondary-text': '#6b21a8',
        '--btn-accent-bg': '#DCEDC8',
        '--btn-accent-hover': '#C5E1A5',
        '--btn-accent-border': '#9CCC65',
        '--btn-accent-text': '#000000',
        '--btn-border-radius': '0.75rem',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#fdfcff',
        '--bg-tertiary': '#faf5ff',
        '--border-color': '#e9d5ff',
        '--text-primary': '#1e1b4b',
        '--text-secondary': '#581c87',
        '--shadow-color': 'rgba(107, 33, 168, 0.1)',
        '--shadow-hover': 'rgba(107, 33, 168, 0.2)'
      },
      'executive-gray': {
        '--primary-color': '#1f2937',
        '--primary-color-rgb': '31, 41, 55',
        '--accent-color-rgb': '156, 163, 175',
        '--secondary-color': '#6b7280',
        '--secondary-color-rgb': '107, 114, 128',
        '--accent-color': '#9ca3af',
        '--complementary-color': '#FFFFF0',
        '--navbar-bg': '#1f2937',
        '--navbar-text': '#ffffff',
        '--navbar-hover': 'rgba(255, 255, 255, 0.1)',
        '--header-gradient-start': '#374151',
        '--header-gradient-end': '#4b5563',
        '--header-text': '#ffffff',
        '--header-text-secondary': 'rgba(255, 255, 255, 0.9)',
        '--btn-primary-bg': '#374151',
        '--btn-primary-hover': '#1f2937',
        '--btn-primary-text': '#ffffff',
        '--btn-secondary-bg': '#f9fafb',
        '--btn-secondary-hover': '#f3f4f6',
        '--btn-secondary-text': '#1f2937',
        '--btn-accent-bg': '#FFFFF0',
        '--btn-accent-hover': '#FFFAE0',
        '--btn-accent-border': '#D4D4AA',
        '--btn-accent-text': '#1f2937',
        '--btn-border-radius': '0.75rem',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#fcfcfd',
        '--bg-tertiary': '#f9fafb',
        '--border-color': '#e5e7eb',
        '--text-primary': '#111827',
        '--text-secondary': '#4b5563',
        '--shadow-color': 'rgba(31, 41, 55, 0.1)',
        '--shadow-hover': 'rgba(31, 41, 55, 0.2)'
      },
      'ocean-teal': {
        '--primary-color': '#0f766e',
        '--primary-color-rgb': '15, 118, 110',
        '--accent-color-rgb': '94, 234, 212',
        '--secondary-color': '#14b8a6',
        '--secondary-color-rgb': '20, 184, 166',
        '--accent-color': '#5eead4',
        '--complementary-color': '#F8BBD9',
        '--navbar-bg': '#0f766e',
        '--navbar-text': '#ffffff',
        '--navbar-hover': 'rgba(255, 255, 255, 0.12)',
        '--header-gradient-start': '#0d9488',
        '--header-gradient-end': '#0f766e',
        '--header-text': '#ffffff',
        '--header-text-secondary': 'rgba(255, 255, 255, 0.9)',
        '--btn-primary-bg': '#0d9488',
        '--btn-primary-hover': '#0f766e',
        '--btn-primary-text': '#ffffff',
        '--btn-secondary-bg': '#f0fdfa',
        '--btn-secondary-hover': '#ccfbf1',
        '--btn-secondary-text': '#0f766e',
        '--btn-accent-bg': '#F8BBD9',
        '--btn-accent-hover': '#F48FB1',
        '--btn-accent-border': '#EC407A',
        '--btn-accent-text': '#000000',
        '--btn-border-radius': '0.75rem',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#fafffc',
        '--bg-tertiary': '#f0fdfa',
        '--border-color': '#a7f3d0',
        '--text-primary': '#042f2e',
        '--text-secondary': '#0f766e',
        '--shadow-color': 'rgba(15, 118, 110, 0.1)',
        '--shadow-hover': 'rgba(15, 118, 110, 0.2)'
      }
    };
    
    // Aplicar las variables CSS directamente en el elemento root
    const root = document.documentElement;
    const themeVars = themes[theme] || themes['corporate-blue'];
    
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
