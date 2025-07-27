import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuService, MenuActivity } from 'src/app/services/menu.service';
import { SharedService } from 'src/app/services/shared.service';
import { UserSessionService } from 'src/app/services/user-session.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css'],
  encapsulation: ViewEncapsulation.None,
  styles: [`
    .activity-card {
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      border: none;
    }
    
    .activity-card:hover:not(.disabled) {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }
    
    .card-header-custom {
      background: linear-gradient(135deg, #0d6efd 0%, #0099ff 100%);
      color: white;
      padding: 1.5rem;
    }
    
    .btn-custom {
      background: linear-gradient(135deg, #0d6efd 0%, #0099ff 100%);
      border: none;
      color: white !important;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .btn-custom:hover {
      transform: scale(1.05);
      box-shadow: 0 5px 15px rgba(13, 110, 253, 0.4);
    }
    
    .activity-card.disabled {
      opacity: 0.6;
      filter: grayscale(100%);
    }
  `]
})
export class MainMenuComponent implements OnInit {

  menuConfiguration: MenuActivity[] = [];
  currentDesign: string = 'dark-neon'; // Puede ser: 'glassmorphism', 'neumorphism', 'minimalist', 'dark-neon', 'bento'
  
  // Card images mapping
  private cardImages: { [key: string]: string } = {
    'Alta De Cuentas Masiva (Becas)': 'assets/images/cards/card-altas-cuentas.jpg',
    'Pagos Múltiples': 'assets/images/cards/card-pagos-multiples.jpg',
    'Transferencias Inmediatas': 'assets/images/cards/card-transferencias.jpg',
    'Administración Backoffice': 'assets/images/cards/card-admin-backoffice.jpg',
    'Tableros': 'assets/images/cards/card-tableros.jpg',
    'Códigos De Barras': 'assets/images/cards/card-codigos-barras.jpg',
    'Validación De CBU': 'assets/images/cards/card-validacion-cbu.jpg',
    'Servicio De Consultoría': 'assets/images/cards/card-consultoria.jpg',
    'Migración De Archivos': 'assets/images/cards/card-migracion.jpg'
  };

  // Card icons mapping
  private cardIcons: { [key: string]: string } = {
    'Alta De Cuentas Masiva (Becas)': 'fas fa-user-plus',
    'Pagos Múltiples': 'fas fa-credit-card',
    'Transferencias Inmediatas': 'fas fa-bolt',
    'Administración Backoffice': 'fas fa-cogs',
    'Tableros': 'fas fa-chart-pie',
    'Códigos De Barras': 'fas fa-barcode',
    'Validación De CBU': 'fas fa-shield-check',
    'Servicio De Consultoría': 'fas fa-handshake',
    'Migración De Archivos': 'fas fa-exchange-alt'
  };

  // New features
  private newFeatures = ['Tableros', 'Validación De CBU'];
  
  // Modal state
  showModal = false;

  constructor(private menuService: MenuService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private userSessionService: UserSessionService) {
  }

  ngOnInit() {
    this.loadMenuConfiguration();
  }

  loadMenuConfiguration() {
    this.menuService.getMenuConfiguration()
      .subscribe(
        res => {
          console.log('Configuración del menú recibida:', res);
          this.menuConfiguration = res;
        },
        err => {
          console.error('Error cargando menú:', err);
          this.menuConfiguration = [];
        }
      );
  }

  // Get card image with fallback
  getCardImage(title: string, index: number): string {
    return this.cardImages[title] || `assets/images/cards/card-default-${(index % 8) + 1}.jpg`;
  }

  // Get card icon with dynamic fallback
  getCardIcon(title: string, index: number): string {
    if (this.cardIcons[title]) {
      return this.cardIcons[title];
    }
    
    // Dynamic icon based on keywords
    const titleLower = title.toLowerCase();
    if (titleLower.includes('pago') || titleLower.includes('transferencia')) {
      return 'fas fa-money-bill-wave';
    } else if (titleLower.includes('admin') || titleLower.includes('gestión')) {
      return 'fas fa-cogs';
    } else if (titleLower.includes('tabla') || titleLower.includes('dashboard')) {
      return 'fas fa-chart-line';
    } else if (titleLower.includes('código') || titleLower.includes('barras')) {
      return 'fas fa-qrcode';
    } else if (titleLower.includes('validación') || titleLower.includes('verificación')) {
      return 'fas fa-check-double';
    } else if (titleLower.includes('consultoría') || titleLower.includes('servicio')) {
      return 'fas fa-headset';
    } else if (titleLower.includes('migración') || titleLower.includes('archivo')) {
      return 'fas fa-file-export';
    }
    
    return 'fas fa-cog'; // Default fallback
  }

  // Get card stats
  getCardStats(title: string): string {
    const statsMap: { [key: string]: string } = {
      'Alta De Cuentas Masiva (Becas)': '1,247 cuentas',
      'Pagos Múltiples': '89 pagos hoy',
      'Transferencias Inmediatas': 'Próximamente',
      'Administración Backoffice': '24 organismos',
      'Tableros': '12 dashboards',
      'Códigos De Barras': 'En desarrollo',
      'Validación De CBU': 'Nuevo sistema',
      'Servicio De Consultoría': 'Contactanos',
      'Migración De Archivos': 'Beta testing'
    };
    
    return statsMap[title] || 'Disponible';
  }

  // Check if feature is new
  isNewFeature(title: string): boolean {
    return this.newFeatures.includes(title);
  }

  // Get last update timestamp
  getLastUpdate(title: string): string {
    const updates: { [key: string]: string } = {
      'Alta De Cuentas Masiva (Becas)': '2h ago',
      'Pagos Múltiples': '1h ago',
      'Transferencias Inmediatas': '1 sem',
      'Administración Backoffice': '30min',
      'Tableros': '15min',
      'Códigos De Barras': '3d ago',
      'Validación De CBU': '1h ago',
      'Servicio De Consultoría': '1d ago',
      'Migración De Archivos': '2d ago'
    };
    
    return updates[title] || 'Hoy';
  }

  // Get category from index for data attributes
  getCategoryFromIndex(index: number): string {
    const categories = ['payments', 'admin', 'analytics', 'services', 'tools', 'migration', 'validation', 'consulting'];
    return categories[index % categories.length];
  }

  // Get Material UI card gradient
  getCardGradient(index: number): string {
    const gradients = [
      'linear-gradient(135deg, #4680FF 0%, #7c4dff 100%)',
      'linear-gradient(135deg, #00e676 0%, #00c853 100%)',
      'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
      'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
      'linear-gradient(135deg, #00bcd4 0%, #0097a7 100%)',
      'linear-gradient(135deg, #8bc34a 0%, #689f38 100%)',
      'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
      'linear-gradient(135deg, #673ab7 0%, #512da8 100%)',
      'linear-gradient(135deg, #ff5722 0%, #d84315 100%)'
    ];
    return gradients[index % gradients.length];
  }

  // Get card shadow color
  getCardShadowColor(index: number): string {
    const shadowColors = [
      'rgba(70, 128, 255, 0.25)',
      'rgba(0, 230, 118, 0.25)',
      'rgba(255, 152, 0, 0.25)',
      'rgba(156, 39, 176, 0.25)',
      'rgba(0, 188, 212, 0.25)',
      'rgba(139, 195, 74, 0.25)',
      'rgba(233, 30, 99, 0.25)',
      'rgba(103, 58, 183, 0.25)',
      'rgba(255, 87, 34, 0.25)'
    ];
    return shadowColors[index % shadowColors.length];
  }

  // Handle card hover effects
  onCardHover(isHovering: boolean): void {
    // Add any card hover logic here
  }

  // Handle button hover effects
  onButtonHover(event: any, isHovering: boolean): void {
    if (isHovering) {
      event.target.style.transform = 'translateY(-2px)';
      event.target.style.boxShadow = event.target.style.boxShadow.replace('0.25)', '0.4)');
    } else {
      event.target.style.transform = 'translateY(0)';
      event.target.style.boxShadow = event.target.style.boxShadow.replace('0.4)', '0.25)');
    }
  }

  // Count enabled services
  getEnabledCount(): number {
    return this.menuConfiguration.filter(activity => activity.enabled).length;
  }

  // Close modal
  closeModal() {
    this.showModal = false;
  }

  // Modern access denied modal
  showAccessDeniedModal() {
    this.showModal = true;
    return;
    Swal.fire({
      title: '🔒 Funcionalidad en Desarrollo',
      html: `
        <div class="text-center p-6">
          <div class="mb-4">
            <i class="fas fa-rocket text-6xl text-blue-500 mb-4"></i>
          </div>
          <p class="text-lg text-gray-600 mb-4">
            Esta funcionalidad estará disponible próximamente.
          </p>
          <p class="text-sm text-gray-500 mb-6">
            ¿Te interesa ser parte del programa beta? ¡Contáctanos!
          </p>
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
            <div class="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div class="flex items-center space-x-2">
                <i class="fas fa-envelope text-blue-500"></i>
                <span>info@bsi.com</span>
              </div>
              <div class="flex items-center space-x-2">
                <i class="fas fa-phone text-blue-500"></i>
                <span>+54 11 1234-5678</span>
              </div>
            </div>
          </div>
        </div>
      `,
      width: '500px',
      padding: '0',
      showCloseButton: true,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-envelope mr-2"></i>Contactar',
      cancelButtonText: '<i class="fas fa-times mr-2"></i>Cerrar',
      confirmButtonColor: '#4680FF',
      cancelButtonColor: '#6b7280',
      buttonsStyling: true,
      customClass: {
        popup: 'rounded-3xl shadow-2xl border-0',
        confirmButton: 'rounded-xl px-6 py-3 font-semibold',
        cancelButton: 'rounded-xl px-6 py-3 font-semibold',
      },
      backdrop: `rgba(0, 0, 0, 0.4)`,
      allowOutsideClick: true,
      allowEscapeKey: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // Open email client or show contact form
        window.location.href = 'mailto:info@bsi.com?subject=Consulta sobre funcionalidades BSI';
      }
    });
  }
  
  // Método para verificar si debe mostrar la sección
  shouldShowActivity(activity: MenuActivity): boolean {
    // Si es la sección de administración
    if (activity.title === 'Administración Backoffice' || 
        activity.title === 'Administración Usuarios') {
      // Solo mostrar si es super usuario
      return this.userSessionService.isSuperUser();
    }
    
    // Para todas las demás secciones, mostrar siempre
    return true;
  }
}
