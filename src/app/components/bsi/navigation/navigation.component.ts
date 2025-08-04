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
  currentTheme = 'foco-energia';

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
      'foco-energia': {
        '--primary-color': '#FDEEAA',
        '--primary-color-rgb': '253, 238, 170',
        '--accent-color-rgb': '44, 62, 80',
        '--secondary-color': '#FDE68A',
        '--secondary-color-rgb': '253, 230, 138',
        '--accent-color': '#2C3E50',
        '--complementary-color': '#2C3E50',
        '--navbar-bg': '#2C3E50',
        '--navbar-text': '#ffffff',
        '--navbar-hover': 'rgba(253, 238, 170, 0.2)',
        '--header-gradient-start': '#FDEEAA',
        '--header-gradient-end': '#FDE68A',
        '--header-text': '#2C3E50',
        '--header-text-secondary': 'rgba(44, 62, 80, 0.85)',
        '--btn-primary-bg': '#2C3E50',
        '--btn-primary-hover': '#1a252f',
        '--btn-primary-text': '#ffffff',
        '--btn-secondary-bg': '#FDEEAA',
        '--btn-secondary-hover': '#FDE68A',
        '--btn-secondary-text': '#2C3E50',
        '--btn-accent-bg': '#FDE68A',
        '--btn-accent-hover': '#FDDC5C',
        '--btn-accent-border': '#F4D03F',
        '--btn-accent-text': '#2C3E50',
        '--btn-border-radius': '0.75rem',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#FFFEF5',
        '--bg-tertiary': '#FDF8E3',
        '--border-color': '#F4E7B3',
        '--text-primary': '#1a1a1a',
        '--text-secondary': '#2C3E50',
        '--shadow-color': 'rgba(44, 62, 80, 0.1)',
        '--shadow-hover': 'rgba(44, 62, 80, 0.2)'
      },
      'confianza-natural': {
        '--primary-color': '#556B2F',
        '--primary-color-rgb': '85, 107, 47',
        '--accent-color-rgb': '245, 245, 220',
        '--secondary-color': '#6B8E23',
        '--secondary-color-rgb': '107, 142, 35',
        '--accent-color': '#F5F5DC',
        '--complementary-color': '#F5F5DC',
        '--navbar-bg': '#556B2F',
        '--navbar-text': '#ffffff',
        '--navbar-hover': 'rgba(245, 245, 220, 0.2)',
        '--header-gradient-start': '#556B2F',
        '--header-gradient-end': '#6B8E23',
        '--header-text': '#ffffff',
        '--header-text-secondary': 'rgba(255, 255, 255, 0.9)',
        '--btn-primary-bg': '#556B2F',
        '--btn-primary-hover': '#3d4d21',
        '--btn-primary-text': '#ffffff',
        '--btn-secondary-bg': '#F5F5DC',
        '--btn-secondary-hover': '#EBEBC4',
        '--btn-secondary-text': '#556B2F',
        '--btn-accent-bg': '#F5F5DC',
        '--btn-accent-hover': '#EBEBC4',
        '--btn-accent-border': '#D2D2A4',
        '--btn-accent-text': '#2d3a18',
        '--btn-border-radius': '0.75rem',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#FAFAF5',
        '--bg-tertiary': '#F5F5DC',
        '--border-color': '#D4D4AA',
        '--text-primary': '#1a1a1a',
        '--text-secondary': '#556B2F',
        '--shadow-color': 'rgba(85, 107, 47, 0.1)',
        '--shadow-hover': 'rgba(85, 107, 47, 0.2)'
      },
      'innovacion-audaz': {
        '--primary-color': '#3F00FF',
        '--primary-color-rgb': '63, 0, 255',
        '--accent-color-rgb': '255, 255, 255',
        '--secondary-color': '#5D3FD3',
        '--secondary-color-rgb': '93, 63, 211',
        '--accent-color': '#FFFFFF',
        '--complementary-color': '#FFFFFF',
        '--navbar-bg': '#3F00FF',
        '--navbar-text': '#ffffff',
        '--navbar-hover': 'rgba(255, 255, 255, 0.2)',
        '--header-gradient-start': '#3F00FF',
        '--header-gradient-end': '#5D3FD3',
        '--header-text': '#ffffff',
        '--header-text-secondary': 'rgba(255, 255, 255, 0.95)',
        '--btn-primary-bg': '#3F00FF',
        '--btn-primary-hover': '#3000CC',
        '--btn-primary-text': '#ffffff',
        '--btn-secondary-bg': '#F0F0FF',
        '--btn-secondary-hover': '#E0E0FF',
        '--btn-secondary-text': '#3F00FF',
        '--btn-accent-bg': '#FFFFFF',
        '--btn-accent-hover': '#F5F5F5',
        '--btn-accent-border': '#3F00FF',
        '--btn-accent-text': '#3F00FF',
        '--btn-border-radius': '0.75rem',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#F8F8FF',
        '--bg-tertiary': '#F0F0FF',
        '--border-color': '#D0D0FF',
        '--text-primary': '#1a1a1a',
        '--text-secondary': '#3F00FF',
        '--shadow-color': 'rgba(63, 0, 255, 0.1)',
        '--shadow-hover': 'rgba(63, 0, 255, 0.2)'
      },
      'lujo-sutil': {
        '--primary-color': '#D8BFD8',
        '--primary-color-rgb': '216, 191, 216',
        '--accent-color-rgb': '183, 110, 121',
        '--secondary-color': '#DDA0DD',
        '--secondary-color-rgb': '221, 160, 221',
        '--accent-color': '#B76E79',
        '--complementary-color': '#B76E79',
        '--navbar-bg': '#B76E79',
        '--navbar-text': '#ffffff',
        '--navbar-hover': 'rgba(216, 191, 216, 0.3)',
        '--header-gradient-start': '#D8BFD8',
        '--header-gradient-end': '#B76E79',
        '--header-text': '#4a2c4a',
        '--header-text-secondary': 'rgba(74, 44, 74, 0.85)',
        '--btn-primary-bg': '#B76E79',
        '--btn-primary-hover': '#9F5D66',
        '--btn-primary-text': '#ffffff',
        '--btn-secondary-bg': '#D8BFD8',
        '--btn-secondary-hover': '#C9ACC9',
        '--btn-secondary-text': '#4a2c4a',
        '--btn-accent-bg': '#F0E6F0',
        '--btn-accent-hover': '#E6D6E6',
        '--btn-accent-border': '#B76E79',
        '--btn-accent-text': '#4a2c4a',
        '--btn-border-radius': '0.75rem',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#FDF9FD',
        '--bg-tertiary': '#F5EFF5',
        '--border-color': '#E6D6E6',
        '--text-primary': '#2a1a2a',
        '--text-secondary': '#6a4a6a',
        '--shadow-color': 'rgba(183, 110, 121, 0.1)',
        '--shadow-hover': 'rgba(183, 110, 121, 0.2)'
      },
      'pasion-poder': {
        '--primary-color': '#990000',
        '--primary-color-rgb': '153, 0, 0',
        '--accent-color-rgb': '0, 0, 0',
        '--secondary-color': '#CC0000',
        '--secondary-color-rgb': '204, 0, 0',
        '--accent-color': '#000000',
        '--complementary-color': '#000000',
        '--navbar-bg': '#000000',
        '--navbar-text': '#ffffff',
        '--navbar-hover': 'rgba(153, 0, 0, 0.3)',
        '--header-gradient-start': '#990000',
        '--header-gradient-end': '#660000',
        '--header-text': '#ffffff',
        '--header-text-secondary': 'rgba(255, 255, 255, 0.9)',
        '--btn-primary-bg': '#990000',
        '--btn-primary-hover': '#660000',
        '--btn-primary-text': '#ffffff',
        '--btn-secondary-bg': '#1a1a1a',
        '--btn-secondary-hover': '#333333',
        '--btn-secondary-text': '#ffffff',
        '--btn-accent-bg': '#CC0000',
        '--btn-accent-hover': '#990000',
        '--btn-accent-border': '#660000',
        '--btn-accent-text': '#ffffff',
        '--btn-border-radius': '0.75rem',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f5f5f5',
        '--bg-tertiary': '#e8e8e8',
        '--border-color': '#cccccc',
        '--text-primary': '#1a1a1a',
        '--text-secondary': '#4a4a4a',
        '--shadow-color': 'rgba(153, 0, 0, 0.1)',
        '--shadow-hover': 'rgba(153, 0, 0, 0.3)'
      },
      'calma-oceanica': {
        '--primary-color': '#4169E1',
        '--primary-color-rgb': '65, 105, 225',
        '--accent-color-rgb': '135, 206, 235',
        '--secondary-color': '#1E90FF',
        '--secondary-color-rgb': '30, 144, 255',
        '--accent-color': '#87CEEB',
        '--complementary-color': '#87CEEB',
        '--navbar-bg': '#4169E1',
        '--navbar-text': '#ffffff',
        '--navbar-hover': 'rgba(135, 206, 235, 0.2)',
        '--header-gradient-start': '#87CEEB',
        '--header-gradient-end': '#4169E1',
        '--header-text': '#1a3a6e',
        '--header-text-secondary': 'rgba(26, 58, 110, 0.85)',
        '--btn-primary-bg': '#4169E1',
        '--btn-primary-hover': '#3154C4',
        '--btn-primary-text': '#ffffff',
        '--btn-secondary-bg': '#87CEEB',
        '--btn-secondary-hover': '#6BB6DD',
        '--btn-secondary-text': '#1a3a6e',
        '--btn-accent-bg': '#E6F3FF',
        '--btn-accent-hover': '#CCE7FF',
        '--btn-accent-border': '#4169E1',
        '--btn-accent-text': '#1a3a6e',
        '--btn-border-radius': '0.75rem',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#F0F8FF',
        '--bg-tertiary': '#E6F3FF',
        '--border-color': '#B8D4F1',
        '--text-primary': '#1a1a1a',
        '--text-secondary': '#1a3a6e',
        '--shadow-color': 'rgba(65, 105, 225, 0.1)',
        '--shadow-hover': 'rgba(65, 105, 225, 0.2)'
      },
      'contraste-jugueton': {
        '--primary-color': '#FF6F61',
        '--primary-color-rgb': '255, 111, 97',
        '--accent-color-rgb': '64, 224, 208',
        '--secondary-color': '#FF8A65',
        '--secondary-color-rgb': '255, 138, 101',
        '--accent-color': '#40E0D0',
        '--complementary-color': '#40E0D0',
        '--navbar-bg': '#FF6F61',
        '--navbar-text': '#ffffff',
        '--navbar-hover': 'rgba(64, 224, 208, 0.3)',
        '--header-gradient-start': '#FF6F61',
        '--header-gradient-end': '#40E0D0',
        '--header-text': '#ffffff',
        '--header-text-secondary': 'rgba(255, 255, 255, 0.95)',
        '--btn-primary-bg': '#FF6F61',
        '--btn-primary-hover': '#FF5443',
        '--btn-primary-text': '#ffffff',
        '--btn-secondary-bg': '#40E0D0',
        '--btn-secondary-hover': '#2EC4B6',
        '--btn-secondary-text': '#ffffff',
        '--btn-accent-bg': '#FFE5E2',
        '--btn-accent-hover': '#FFD4CF',
        '--btn-accent-border': '#40E0D0',
        '--btn-accent-text': '#1a1a1a',
        '--btn-border-radius': '0.75rem',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#FFF5F4',
        '--bg-tertiary': '#E6FFFC',
        '--border-color': '#FFD4CF',
        '--text-primary': '#1a1a1a',
        '--text-secondary': '#4a4a4a',
        '--shadow-color': 'rgba(255, 111, 97, 0.1)',
        '--shadow-hover': 'rgba(64, 224, 208, 0.2)'
      },
      'atardecer-desierto': {
        '--primary-color': '#E2725B',
        '--primary-color-rgb': '226, 114, 91',
        '--accent-color-rgb': '255, 218, 185',
        '--secondary-color': '#CD5C5C',
        '--secondary-color-rgb': '205, 92, 92',
        '--accent-color': '#FFDAB9',
        '--complementary-color': '#FFDAB9',
        '--navbar-bg': '#E2725B',
        '--navbar-text': '#ffffff',
        '--navbar-hover': 'rgba(255, 218, 185, 0.3)',
        '--header-gradient-start': '#E2725B',
        '--header-gradient-end': '#CD5C5C',
        '--header-text': '#ffffff',
        '--header-text-secondary': 'rgba(255, 255, 255, 0.9)',
        '--btn-primary-bg': '#E2725B',
        '--btn-primary-hover': '#D15A3F',
        '--btn-primary-text': '#ffffff',
        '--btn-secondary-bg': '#FFDAB9',
        '--btn-secondary-hover': '#FFC299',
        '--btn-secondary-text': '#8B4513',
        '--btn-accent-bg': '#FFF5EE',
        '--btn-accent-hover': '#FFE4D1',
        '--btn-accent-border': '#E2725B',
        '--btn-accent-text': '#8B4513',
        '--btn-border-radius': '0.75rem',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#FFF9F5',
        '--bg-tertiary': '#FFF5EE',
        '--border-color': '#FFE4D1',
        '--text-primary': '#1a1a1a',
        '--text-secondary': '#8B4513',
        '--shadow-color': 'rgba(226, 114, 91, 0.1)',
        '--shadow-hover': 'rgba(226, 114, 91, 0.2)'
      },
      'misterio-botanico': {
        '--primary-color': '#50C878',
        '--primary-color-rgb': '80, 200, 120',
        '--accent-color-rgb': '106, 13, 173',
        '--secondary-color': '#3CB371',
        '--secondary-color-rgb': '60, 179, 113',
        '--accent-color': '#6A0DAD',
        '--complementary-color': '#6A0DAD',
        '--navbar-bg': '#6A0DAD',
        '--navbar-text': '#ffffff',
        '--navbar-hover': 'rgba(80, 200, 120, 0.3)',
        '--header-gradient-start': '#50C878',
        '--header-gradient-end': '#6A0DAD',
        '--header-text': '#ffffff',
        '--header-text-secondary': 'rgba(255, 255, 255, 0.95)',
        '--btn-primary-bg': '#50C878',
        '--btn-primary-hover': '#3FB866',
        '--btn-primary-text': '#ffffff',
        '--btn-secondary-bg': '#6A0DAD',
        '--btn-secondary-hover': '#580A91',
        '--btn-secondary-text': '#ffffff',
        '--btn-accent-bg': '#E6FFE6',
        '--btn-accent-hover': '#CCFFCC',
        '--btn-accent-border': '#6A0DAD',
        '--btn-accent-text': '#1a1a1a',
        '--btn-border-radius': '0.75rem',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#F5FFF5',
        '--bg-tertiary': '#E6FFE6',
        '--border-color': '#B3E6B3',
        '--text-primary': '#1a1a1a',
        '--text-secondary': '#2d5a2d',
        '--shadow-color': 'rgba(80, 200, 120, 0.1)',
        '--shadow-hover': 'rgba(106, 13, 173, 0.2)'
      },
      'minimalismo-calido': {
        '--primary-color': '#6F4E37',
        '--primary-color-rgb': '111, 78, 55',
        '--accent-color-rgb': '248, 248, 248',
        '--secondary-color': '#8B6946',
        '--secondary-color-rgb': '139, 105, 70',
        '--accent-color': '#F8F8F8',
        '--complementary-color': '#F8F8F8',
        '--navbar-bg': '#6F4E37',
        '--navbar-text': '#ffffff',
        '--navbar-hover': 'rgba(248, 248, 248, 0.2)',
        '--header-gradient-start': '#6F4E37',
        '--header-gradient-end': '#8B6946',
        '--header-text': '#ffffff',
        '--header-text-secondary': 'rgba(255, 255, 255, 0.9)',
        '--btn-primary-bg': '#6F4E37',
        '--btn-primary-hover': '#5A3E2B',
        '--btn-primary-text': '#ffffff',
        '--btn-secondary-bg': '#F8F8F8',
        '--btn-secondary-hover': '#ECECEC',
        '--btn-secondary-text': '#6F4E37',
        '--btn-accent-bg': '#FFF8F0',
        '--btn-accent-hover': '#FFF0E0',
        '--btn-accent-border': '#D2B48C',
        '--btn-accent-text': '#6F4E37',
        '--btn-border-radius': '0.75rem',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#FAFAFA',
        '--bg-tertiary': '#F8F8F8',
        '--border-color': '#E0E0E0',
        '--text-primary': '#1a1a1a',
        '--text-secondary': '#6F4E37',
        '--shadow-color': 'rgba(111, 78, 55, 0.1)',
        '--shadow-hover': 'rgba(111, 78, 55, 0.2)'
      }
    };

    // Aplicar las variables CSS directamente en el elemento root
    const root = document.documentElement;
    const themeVars = themes[theme] || themes['calma-oceanica'];

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
