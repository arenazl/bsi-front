import { EnumLotes, LotesFilterOptions, ContratoUsuario } from '../../../models/Model';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Lotes } from 'src/app/models/Model';
import { LotesService } from 'src/app/services/lotes.service';
import { SharedService } from 'src/app/services/shared.service';
import { Location } from '@angular/common';
import { isNgTemplate, ThisReceiver } from '@angular/compiler';
import Swal from 'sweetalert2';
import { FileService } from 'src/app/services/file.service';
import { NavigationService } from 'src/app/services/navigation.service';
import { UserSessionService } from 'src/app/services/user-session.service';
import { ContractStateService } from 'src/app/services/contract-state.service';


@Component({
  selector: 'app-dinamic-module',
  templateUrl: './dinamic-module.component.html',
  styleUrls: ['./dinamic-module.component.css', './icon-fix.css']
})
export class DinamicModuleComponent implements OnInit {

  @Input() data: any;
  currentDesign = 3; // Para cambiar entre diseños - Diseño 3 por defecto
  isDataLoaded = false; // Flag para controlar la animación

  constructor(private fileService: FileService,
    private navigationService: NavigationService,
    private userSession: UserSessionService,
    private contractState: ContractStateService,
    private router: Router,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService) {
  }

  ngOnInit() {

    this.activatedRoute.params.subscribe((params) => {

      let module = params["screen"];
      
      if (params["contrato"] != undefined)
      {
        sessionStorage.setItem('IdContrato', params["contrato"]);
      }
      
      // Primero intentar cargar desde BD, si falla usar JSON
      this.loadModuleConfig(module);
    });
  }

  private loadModuleConfig(module: string) {
    // Casos especiales que aún no están en BD
    if (module === 'mainmenu') {
      // Usar el endpoint de menú principal
      this.navigationService.getMainMenu().subscribe({
        next: (response: any) => {
          console.log('Respuesta del menú principal:', response);
          
          // Si la respuesta tiene la estructura {estado, descripcion, data}
          if (response && response.estado === 1 && response.data) {
            // Si data.items existe, usar esa estructura
            if (response.data.items && Array.isArray(response.data.items)) {
              this.data = response.data;
              // Pequeño delay para evitar parpadeo
              setTimeout(() => {
                this.isDataLoaded = true;
              }, 50);
            } else {
              console.error('Estructura inesperada en response.data:', response.data);
              this.loadFromJson(module);
            }
          } else {
            console.error('Respuesta inválida del servidor:', response);
            this.loadFromJson(module);
          }
        },
        error: (error) => {
          console.warn('Error cargando menú desde BD, usando JSON fallback:', error);
          this.loadFromJson(module);
        }
      });
    } else if (module === 'pagos' || module === 'nominas' || module === 'cuentas') {
      // Módulos que usan navegación dinámica
      this.loadDynamicModule(module);
    } else if (module === 'pagosmultiples' || module === 'altas-masivas') {
      // Módulos del menú principal que cargan desde JSON
      this.loadFromJson(module);
    } else {
      // Otros módulos que aún usan JSON
      this.loadFromJson(module);
    }
  }

  private loadDynamicModule(module: string) {
    // Primero obtener la configuración del módulo
    this.navigationService.getModuleConfig(module).subscribe({
      next: (config) => {
        if (config.estado === 1) {
          // Luego obtener los contratos del usuario
          const userData = this.userSession.getCurrentUserData();
          const contratos = userData?.Contratos || [];
          
          // Transformar la configuración en el formato esperado
          this.data = this.transformToModuleData(module, contratos, config.data);
          // Pequeño delay para evitar parpadeo
          setTimeout(() => {
            this.isDataLoaded = true;
          }, 50);
        } else {
          console.warn('Configuración no disponible:', config.descripcion);
          this.loadFromJson(module);
        }
      },
      error: (error) => {
        console.warn('Error cargando configuración desde BD, usando JSON fallback:', error);
        this.loadFromJson(module);
      }
    });
  }

  private transformToModuleData(module: string, contratos: any[], actions: any[]) {
    // Parsear las acciones si vienen como string
    const parsedActions = typeof actions === 'string' ? JSON.parse(actions) : actions;
    
    // Mapear cada contrato con sus acciones
    const items = contratos.map(contrato => {
      const contractActions = this.navigationService.generateActionsForContract(
        contrato.IdContrato.toString(), 
        contrato.IdModalidad
      );
      
      return {
        title: contrato.NombreContrato || `Contrato ${contrato.IdContrato}`,
        description: contrato.DescripcionModalidad || 'Sin descripción',
        enabled: true,
        items: this.navigationService.transformActionsToMenuItems(
          contractActions,
          contrato.IdContrato.toString(),
          contrato.NombreContrato
        )
      };
    });

    return {
      header: this.getModuleHeader(module),
      description: this.getModuleDescription(module),
      items: items
    };
  }

  private getModuleHeader(module: string): string {
    const headers: { [key: string]: string } = {
      'pagos': 'Pagos Múltiples',
      'nominas': 'Gestión de Nóminas',
      'cuentas': 'Gestión de Cuentas'
    };
    return headers[module] || module;
  }

  private getModuleDescription(module: string): string {
    const descriptions: { [key: string]: string } = {
      'pagos': 'Seleccione un contrato para gestionar sus pagos',
      'nominas': 'Administre las nóminas de sus contratos',
      'cuentas': 'Gestione las cuentas bancarias asociadas'
    };
    return descriptions[module] || '';
  }

  private loadFromJson(module: string) {
    this.fileService.getJsonForScreen(module).subscribe({
      next: (data: any) => {
        console.log(`Datos cargados para módulo ${module}:`, data);
        
        // Verificar que data.items sea un array
        if (data && data.items && Array.isArray(data.items)) {
          this.data = data;
          console.log('data.items es un array con', data.items.length, 'elementos');
          // Pequeño delay para evitar parpadeo
          setTimeout(() => {
            this.isDataLoaded = true;
          }, 50);
        } else {
          console.error('La estructura del JSON no es válida, items no es un array:', data);
          this.data = {
            header: module,
            description: 'Error en la estructura de datos',
            items: []
          };
          this.isDataLoaded = true;
        }
      },
      error: (error) => {
        console.error('Error cargando JSON:', error);
        this.data = {
          header: 'Error',
          description: 'No se pudo cargar la configuración del módulo',
          items: []
        };
        this.isDataLoaded = true;
      }
    });
  }

  goBack(): void {
    this.location.back();
  }

  showAdsOption(option: number) {
    switch(option) {
      case 1:
        this.showAdsOption1();
        break;
      case 2:
        this.showAds(); // Ya está implementada como opción 2
        break;
      case 3:
        this.showAdsOption3();
        break;
      case 4:
        this.showAdsOption4();
        break;
      case 5:
        this.showAdsOption5();
        break;
    }
  }

  // Opción 1: Modal Minimalista con Icono Animado Central
  showAdsOption1() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-sm z-50';
    modalOverlay.innerHTML = `
      <div class="bg-white rounded-2xl max-w-md w-full transform transition-all duration-500 modal-scale-up">
        <!-- Icono central grande -->
        <div class="relative -mt-16 mb-4">
          <div class="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse-slow">
            <i class="fas fa-gem text-white text-5xl"></i>
          </div>
        </div>
        
        <!-- Contenido -->
        <div class="p-8 pt-4 text-center">
          <h3 class="text-2xl font-bold text-gray-800 mb-3">Función Exclusiva</h3>
          <p class="text-gray-600 mb-6 leading-relaxed">
            Esta característica está reservada para nuestros usuarios más especiales. Actualiza tu cuenta para acceder.
          </p>
          
          <!-- Separador visual -->
          <div class="flex items-center gap-4 mb-6">
            <div class="flex-1 h-px bg-gray-200"></div>
            <i class="fas fa-sparkles text-purple-500"></i>
            <div class="flex-1 h-px bg-gray-200"></div>
          </div>
          
          <!-- Lista de beneficios minimalista -->
          <div class="grid grid-cols-3 gap-4 mb-6">
            <div class="text-center">
              <i class="fas fa-infinity text-purple-500 text-2xl mb-2"></i>
              <p class="text-xs text-gray-600">Sin límites</p>
            </div>
            <div class="text-center">
              <i class="fas fa-bolt text-purple-500 text-2xl mb-2"></i>
              <p class="text-xs text-gray-600">Ultra rápido</p>
            </div>
            <div class="text-center">
              <i class="fas fa-shield-alt text-purple-500 text-2xl mb-2"></i>
              <p class="text-xs text-gray-600">Seguro</p>
            </div>
          </div>
          
          <!-- Botones -->
          <button id="unlockBtn" class="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 mb-3">
            Desbloquear Ahora
          </button>
          <button id="closeBtn" class="text-gray-500 hover:text-gray-700 text-sm transition-colors">
            No, gracias
          </button>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes scaleUp {
        from {
          opacity: 0;
          transform: scale(0.8);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      @keyframes pulseSlow {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.8;
          transform: scale(1.05);
        }
      }
      
      .modal-scale-up {
        animation: scaleUp 0.3s ease-out;
      }
      
      .animate-pulse-slow {
        animation: pulseSlow 3s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(modalOverlay);

    this.setupModalListeners(modalOverlay, style, 'unlockBtn');
  }


  showAds() {
    // Usar la opción 1 como predeterminada
    this.showAdsOption1();
  }

  // Función común para configurar los event listeners de los modales
  private setupModalListeners(modalOverlay: HTMLElement, style: HTMLStyleElement, actionBtnId: string) {
    const closeModal = () => {
      modalOverlay.classList.add('opacity-0');
      setTimeout(() => {
        modalOverlay.remove();
        style.remove();
      }, 300);
    };

    // Cerrar con el botón close
    document.getElementById('closeBtn')?.addEventListener('click', closeModal);

    // Cerrar al hacer clic fuera del modal
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });

    // Acción del botón principal
    document.getElementById(actionBtnId)?.addEventListener('click', () => {
      console.log(`Usuario hizo click en ${actionBtnId}`);
      closeModal();
    });

    // Cerrar con tecla Escape
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }

  // Opción 3: Modal Minimalista Tipo Pricing Card
  showAdsOption3() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm z-50';
    modalOverlay.innerHTML = `
      <div class="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl transform transition-all duration-500 modal-bounce-in">
        <!-- Ribbon -->
        <div class="relative">
          <div class="absolute top-4 -right-12 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold py-1 px-12 rotate-45 transform">
            PREMIUM
          </div>
        </div>
        
        <!-- Content -->
        <div class="p-8">
          <!-- Icon badge -->
          <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl mb-4">
            <i class="fas fa-fire text-2xl text-orange-500"></i>
          </div>
          
          <h3 class="text-2xl font-bold text-gray-800 mb-2">Potencia tu Experiencia</h3>
          <p class="text-gray-600 mb-6">
            Desbloquea características avanzadas y lleva tu productividad al máximo nivel.
          </p>
          
          <!-- Pricing -->
          <div class="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 mb-6">
            <div class="flex items-baseline gap-1 mb-2">
              <span class="text-4xl font-bold text-gray-800">$9</span>
              <span class="text-gray-500">/mes</span>
            </div>
            <p class="text-sm text-gray-600">Cancela cuando quieras</p>
          </div>
          
          <!-- Quick benefits -->
          <div class="flex gap-3 mb-6">
            <div class="flex-1 text-center p-3 bg-orange-50 rounded-lg">
              <i class="fas fa-rocket text-orange-500 mb-1"></i>
              <p class="text-xs text-gray-600">Rápido</p>
            </div>
            <div class="flex-1 text-center p-3 bg-orange-50 rounded-lg">
              <i class="fas fa-lock text-orange-500 mb-1"></i>
              <p class="text-xs text-gray-600">Seguro</p>
            </div>
            <div class="flex-1 text-center p-3 bg-orange-50 rounded-lg">
              <i class="fas fa-headset text-orange-500 mb-1"></i>
              <p class="text-xs text-gray-600">Soporte</p>
            </div>
          </div>
          
          <!-- CTA -->
          <button id="startTrialBtn" class="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 mb-3">
            Comenzar Prueba Gratis
          </button>
          <button id="closeBtn" class="w-full text-gray-500 hover:text-gray-700 text-sm transition-colors">
            Ver comparación de planes
          </button>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes bounceIn {
        0% {
          opacity: 0;
          transform: scale(0.3);
        }
        50% {
          transform: scale(1.05);
        }
        70% {
          transform: scale(0.9);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
      
      .modal-bounce-in {
        animation: bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(modalOverlay);

    this.setupModalListeners(modalOverlay, style, 'startTrialBtn');
  }

  // Opción 4: Modal Minimalista con Timeline
  showAdsOption4() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 flex items-center justify-center p-4 bg-indigo-900/80 backdrop-blur-sm z-50';
    modalOverlay.innerHTML = `
      <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl transform transition-all duration-500 modal-slide-up">
        <!-- Header minimalista -->
        <div class="p-6 pb-0">
          <div class="flex items-center justify-between mb-6">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                <i class="fas fa-chart-line text-indigo-600 text-xl"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-gray-800">Función Avanzada</h3>
                <p class="text-sm text-gray-500">Análisis Premium</p>
              </div>
            </div>
            <button id="closeBtn" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <!-- Timeline de características -->
        <div class="px-6 pb-6">
          <div class="relative">
            <!-- Línea vertical -->
            <div class="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            
            <!-- Items -->
            <div class="space-y-4">
              <div class="flex gap-4 items-start">
                <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
                  <i class="fas fa-check text-white"></i>
                </div>
                <div class="flex-1 pt-2">
                  <p class="font-medium text-gray-800">Funciones Básicas</p>
                  <p class="text-sm text-gray-500">Ya tienes acceso</p>
                </div>
              </div>
              
              <div class="flex gap-4 items-start">
                <div class="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 animate-pulse">
                  <i class="fas fa-lock text-white"></i>
                </div>
                <div class="flex-1 pt-2">
                  <p class="font-medium text-gray-800">Análisis Avanzado</p>
                  <p class="text-sm text-gray-500">Requiere Premium</p>
                </div>
              </div>
              
              <div class="flex gap-4 items-start opacity-50">
                <div class="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0 relative z-10">
                  <i class="fas fa-star text-white"></i>
                </div>
                <div class="flex-1 pt-2">
                  <p class="font-medium text-gray-600">Más por descubrir</p>
                  <p class="text-sm text-gray-400">Próximamente</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- CTA -->
          <div class="mt-8 space-y-3">
            <button id="unlockPremiumBtn" class="w-full py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-all duration-300">
              Desbloquear Premium
            </button>
            <button id="remindLaterBtn" class="w-full py-3 text-gray-500 hover:text-gray-700 transition-colors text-sm">
              Recordármelo después
            </button>
          </div>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(100px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .modal-slide-up {
        animation: slideUp 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(modalOverlay);

    this.setupModalListeners(modalOverlay, style, 'unlockPremiumBtn');
    
    // Listener adicional para el botón recordar
    document.getElementById('remindLaterBtn')?.addEventListener('click', () => {
      modalOverlay.classList.add('opacity-0');
      setTimeout(() => {
        modalOverlay.remove();
        style.remove();
      }, 300);
    });
  }

  // Opción 5: Modal Minimalista con Testimonial
  showAdsOption5() {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'fixed inset-0 flex items-center justify-center p-4 bg-gray-800/75 backdrop-blur-md z-50';
    modalOverlay.innerHTML = `
      <div class="bg-white rounded-3xl max-w-md w-full shadow-2xl transform transition-all duration-500 modal-rotate-in">
        <!-- Quote decoration -->
        <div class="relative">
          <i class="fas fa-quote-left text-6xl text-gray-100 absolute top-4 left-6"></i>
        </div>
        
        <!-- Content -->
        <div class="p-8 relative">
          <!-- Success badge -->
          <div class="absolute -top-4 right-8">
            <div class="bg-green-500 text-white text-xs font-bold py-1 px-3 rounded-full shadow-lg">
              +45% productividad
            </div>
          </div>
          
          <!-- Testimonial -->
          <div class="mb-6 mt-8">
            <p class="text-gray-700 italic mb-4">
              "Actualizar a Premium fue la mejor decisión. Las funciones avanzadas me ahorran horas de trabajo cada semana."
            </p>
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full"></div>
              <div>
                <p class="font-semibold text-gray-800">María García</p>
                <p class="text-sm text-gray-500">Gerente de Proyectos</p>
              </div>
            </div>
          </div>
          
          <!-- Feature highlight -->
          <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 mb-6">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow">
                <i class="fas fa-magic text-purple-600"></i>
              </div>
              <div>
                <p class="font-semibold text-gray-800">La función que intentas usar</p>
                <p class="text-sm text-gray-600">Solo disponible en Premium</p>
              </div>
            </div>
          </div>
          
          <!-- Stats -->
          <div class="grid grid-cols-3 gap-3 mb-6 text-center">
            <div>
              <p class="text-2xl font-bold text-purple-600">10k+</p>
              <p class="text-xs text-gray-500">Usuarios</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-purple-600">4.9</p>
              <p class="text-xs text-gray-500">Rating</p>
            </div>
            <div>
              <p class="text-2xl font-bold text-purple-600">24/7</p>
              <p class="text-xs text-gray-500">Soporte</p>
            </div>
          </div>
          
          <!-- Actions -->
          <button id="joinPremiumBtn" class="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:shadow-xl transform hover:scale-105 transition-all duration-300 mb-3">
            Unirme a Premium
          </button>
          <button id="closeBtn" class="w-full text-gray-500 hover:text-gray-700 text-sm transition-colors">
            Seguir con plan básico
          </button>
        </div>
      </div>
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes rotateIn {
        from {
          opacity: 0;
          transform: rotate(-10deg) scale(0.8);
        }
        to {
          opacity: 1;
          transform: rotate(0) scale(1);
        }
      }
      
      .modal-rotate-in {
        animation: rotateIn 0.5s ease-out;
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(modalOverlay);

    this.setupModalListeners(modalOverlay, style, 'joinPremiumBtn');
  }

  logNavigation(item: any) {
    // Obtener el módulo actual de los parámetros de ruta
    const currentModule = this.activatedRoute.snapshot.params['screen'];
    
    // Analizar la ruta para extraer información
    const linkParts = item.link?.split('/').filter((p: string) => p) || [];
    
    if (linkParts.length >= 2) {
      // Por ejemplo: /xslImport/NOMINA/3
      const [component, tipoModulo, contratoParam] = linkParts;
      
      // Si es una ruta con contrato
      if (component === 'xslImport' && contratoParam) {
        // Buscar el contrato en la sesión del usuario
        const contratos: ContratoUsuario[] = this.userSession.getCurrentUserData()?.Contratos || [];
        let contractContext = null;
        
        // Si el parámetro es numérico, buscar por ID
        if (!isNaN(Number(contratoParam))) {
          const contrato = contratos.find((c: ContratoUsuario) => c.IdContrato === Number(contratoParam));
          if (contrato) {
            contractContext = {
              contractId: contrato.IdContrato,
              contractName: contrato.NombreContrato,
              modalidad: contrato.Modalidad,
              tipoModulo: tipoModulo,
              metadata: {
                descripcionModalidad: contrato.DescripcionModalidad,
                rotulo: contrato.Rotulo
              }
            };
          }
        } else {
          // Si es texto, buscar por modalidad
          const contrato = contratos.find((c: ContratoUsuario) => 
            c.Modalidad === contratoParam || 
            c.DescripcionModalidad === contratoParam
          );
          if (contrato) {
            contractContext = {
              contractId: contrato.IdContrato,
              contractName: contrato.NombreContrato,
              modalidad: contrato.Modalidad,
              tipoModulo: tipoModulo,
              metadata: {
                descripcionModalidad: contrato.DescripcionModalidad,
                rotulo: contrato.Rotulo
              }
            };
          }
        }
        
        // Guardar el contexto antes de navegar
        if (contractContext) {
          this.contractState.setContractContext(contractContext);
        }
      }
    }
    
    // Registrar el acceso
    this.navigationService.logNavigationAccess(
      currentModule,
      item.type || item.description || 'view',
      undefined
    ).subscribe({
      next: () => console.log('Acceso registrado'),
      error: (error) => console.warn('Error registrando acceso:', error)
    });
  }




}
