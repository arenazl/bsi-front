import { Component, OnInit, HostListener } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { BsiHelper } from 'src/app/services/bsiHelper.service';
import { DatabaseService } from 'src/app/services/database.service';
import { OrganismosService } from 'src/app/services/organismos.service';
import { PagosService } from 'src/app/services/pagos.service';
import { obtenerContextoActual, tieneContextoValido } from 'src/app/helpers/session.helper';
import { dbRequest, dbResponse } from 'src/app/models/Model';
import { NominaItem as ModelNominaItem } from 'src/app/models/operation-context.model';
import { TipoModulo } from 'src/app/enums/enums';
import Swal from 'sweetalert2';

interface NominaItem {
  cbu: string;
  cuil: string;
  apellido: string;
  nombre: string;
  importe: number;
  toggleEnabled: boolean;
  VALIDO?: number;
  [key: string]: any; // Esto permite acceso a propiedades dinámicas
}

@Component({
  selector: 'app-xsl-editabletable',
  templateUrl: './xsl-editabletable.component.html',
  styleUrls: ['./xsl-editabletable.component.css']
})
export class XslEditabletableComponent implements OnInit {
  
  isButtonVisible = false;
  
  @HostListener('window:scroll', ['$event'])
  onScroll() {
    this.checkScrollPosition();
  }
  
  checkScrollPosition() {
    // Mostrar botón siempre que haya elementos seleccionados
    this.isButtonVisible = this.selectedItems.length > 0;
  }
 
  headerTitle = '';
  contrato = 0;
  tipoContrato ='';
  organismo = 0;
  user = 0;
  ente='';
  rotulo='';
  fechaPago: string = '';
  isLoading = false;
  organismoDescription = '';

  metadata: any = { HEADER: [], 'TABLE-COLUMN': [] };
  dbNominas: { header: any; items: any[] } = { header: {}, items: [] };
  editingField: { rowIndex: number; field: string } | null = null; 

  filteredItems: NominaItem[] = [];
  selectedItems: NominaItem[] = [];
  nuevasNominas: NominaItem[] = [];
  isNominasEmpty = false;
  fecha = new Date().toISOString().split('T')[0]

  tranfeList: any[] = [];

  newItem: NominaItem = { cbu: '', cuil: '', apellido: '', nombre: '', importe: 0, toggleEnabled: false };
  searchTerm = '';

  constructor(
    private bsiHelper: BsiHelper,
    private location: Location,
    private router: Router,
    private databaseService: DatabaseService,
    private organismosService: OrganismosService,
    private pagosService: PagosService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadSessionData();
    this.loadNominaImporte();
    this.getListCombo()
  }

  showEditPopup(item: any, index: number) {
    Swal.fire({
      title: 'Editar CBU',
      html: `
        <div style="text-align: left;">
          <p><strong>Nombre:</strong> ${item.nombre}</p>
          <p><strong>CUIL:</strong> ${item.cuil}</p>
          <p><strong>CBU Actual:</strong> ${item.cbu}</p>
          <label for="newCbu" style="margin-top: 1rem;">Nuevo CBU:</label>
          <input id="newCbu" class="swal2-input" placeholder="Ingrese nuevo CBU" style="width: 80%;" maxlength="22" /></div>`,
      focusConfirm: false,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      preConfirm: () => {
        const newCbu = (document.getElementById('newCbu') as HTMLInputElement).value;
        if (!newCbu || newCbu.length !== 22) {
          Swal.showValidationMessage('El CBU debe tener exactamente 22 caracteres.');
          return false;
        }

        const payloadUpdate =
        {
          sp_name: "NOMINA_ACTUALIZAR_CBU_BYCUIL",
          jsonUnify: true,
          body: {
            IDCONT: sessionStorage.getItem('IdContrato'),
            IDORG: sessionStorage.getItem('IdOrganismo'),
            IDUSER: sessionStorage.getItem('idUser'),
            CUIL: item.cuil,
            CBU: newCbu,
           
          }
        };
    
        this.databaseService.ejecutarInsertSP(payloadUpdate).subscribe({
 
          next: (res) => this.handleUpdateCuil(index, newCbu),
          error: (err) => this.handleError(err)

        });

        return ""; 

      },
    }).then((result) => {
      if (result.isConfirmed) {

        Swal.fire('¡Actualizado!', 'El CBU ha sido actualizado correctamente.', 'success');
      }
    });
  }

  handleUpdateCuil(index: number, newCbu: string){
    this.filteredItems[index].cbu = newCbu;      
  }

  showDeletePopup(item: any, index: number) {
    Swal.fire({
      title: '¿Eliminar registro?',
      html: `
        <div style="text-align: left;">
          <p><strong>Nombre:</strong> ${item.nombre}</p>
          <p><strong>CUIL:</strong> ${item.cuil}</p>
          <p><strong>CBU:</strong> ${item.cbu}</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {

        const payloadUpdate =
        {
          sp_name: "NOMINA_ELIMINAR_BY_CUIT_CBU",
          jsonUnify: true,
          body: {
            IDCONT: sessionStorage.getItem('IdContrato'),
            IDORG: sessionStorage.getItem('IdOrganismo'),
            IDUSER: sessionStorage.getItem('idUser'),
            CUIL: item.cuil,
            CBU: item.cbu,
           
          }
        };
    
        this.databaseService.ejecutarInsertSP(payloadUpdate).subscribe({
 
          /*
          next: (res) => this.handleUpdateCuil(index, newCbu),
          error: (err) => this.handleError(err)*/

        });

        this.filteredItems.splice(index, 1);
        Swal.fire('Eliminado', 'El registro ha sido eliminado.', 'success');
      }
    });
  }

  getListComboById(event: any): void {

    let id = event.target.value;

    const payload = {
      sp_name: "NOMINA_OBTENER_FILL_BY_PAGO",
      body: {
        id_user: this.user,
        id_contrato: this.contrato,
        id_organismo: this.organismo, 
        id_pago: id
      }
    };

    this.databaseService.ejecutarSelectSP(payload).subscribe({
      next: (res) => this.handleNominaImporteResponse(res),
      error: (err) => this.handleError(err)
    });

  }

    getListCombo(): void {
    this.organismosService.obtenerParaCombo( TipoModulo.PAGO ).subscribe({
      next: (data) => {
        this.tranfeList = Array.isArray(data) ? data : [];
        console.log('Lista de transferencias:', this.tranfeList);
      },
      error: (error) => {
        console.error('Error al obtener lista para combo:', error);
        this.tranfeList = [];
      }
    });
  }

  private loadSessionData(): void {
    
    this.contrato = Number(sessionStorage.getItem('IdContrato'));
    this.tipoContrato = sessionStorage.getItem('TipoContrato') || '';
    this.organismo = Number(sessionStorage.getItem('IdOrganismo'));
    this.organismoDescription = this.bsiHelper.toProperCase(sessionStorage.getItem('Organismo') || '');
    this.user = Number(sessionStorage.getItem('idUser'));
    this.fechaPago = sessionStorage.getItem('fechaPago') || '';
    this.ente = sessionStorage.getItem('Ente') || '';
    this.rotulo = sessionStorage.getItem('Rotulo') || '';

  }

  private loadNominaImporte(): void {
    const payload = {
      sp_name: "NOMINA_OBTENER_FILL_BY_ID",
      body: {
        id_user: this.user,
        id_contrato: this.contrato,
        id_organismo: this.organismo
      }
    };

    this.databaseService.ejecutarSelectSP(payload).subscribe({
      next: (res) => this.handleNominaImporteResponse(res),
      error: (err) => this.handleError(err)
    });
  }


  private handleNominaImporteResponse(res: any): void {

    if (res == null || res.data.items.length === 0) {
      this.isNominasEmpty = true;   
      this.fillHeader();
      this.filteredItems = [];
    } else 
    {


    
      this.dbNominas.header = res.data.header;
      this.dbNominas.items = res.data.items;
      this.checkIfContratoisfromBapro();  
      this.dbNominas.header.importe_total = 0;
      this.filteredItems = this.dbNominas.items;
    }

    this.loadMetadata();
  }

  checkIfContratoisfromBapro() {

    if (this.tipoContrato === 'JUDICIALESBAPRO') {
      this.dbNominas.items = this.dbNominas.items.filter(item => item.cbu.startsWith('014'));
    } else if (this.tipoContrato === 'JUDICIALESOTROS') {
      this.dbNominas.items = this.dbNominas.items.filter(item => !item.cbu.startsWith('014'));
    }
  }

  private fillHeader(): void {

    this.dbNominas = {
        items: [], 
        header: {
          ente: `${this.ente}`,
          fecha: `${this.fecha}`, 
          rotulo: `${this.rotulo}`,
          cantidad_elementos: 0     
      }     
    };

  }

  private loadMetadata(): void {
    this.bsiHelper.getMetaData().subscribe({
      next: (mt) => {
        this.metadata = mt.data;
        this.processValidationItems();
        this.isLoading = false;
      },
      error: (err) => this.handleError(err)
    });
  }

  private handleError(err: any): void {
    console.error(err);
    this.isLoading = false;
    Swal.fire({
      title: "Error",
      text: "Se produjo un error inesperado, contacte al administrador.",
      icon: "error",
    });
  }

  executeValidations(cuil: string, cbu: string, name: string): boolean {
    if (!this.newItem.cbu || !this.newItem.cuil || !this.newItem.nombre) {
      this.showValidationError('Todos los campos son obligatorios.');
      return false;
    }

    if (!this.bsiHelper.validateCuil(cuil)) {
      this.showValidationError('El CUIL ingresado es inválido. Asegúrate de que siga el formato correcto y el dígito verificador sea correcto.');
      return false;
    }

    if (!this.bsiHelper.validateCbu(cbu)) {
      this.showValidationError('El CBU ingresado es inválido. Debe tener 22 dígitos y un dígito verificador correcto.');
      return false;
    }

    if (!this.bsiHelper.validateName(name)) {
      this.showValidationError('El nombre ingresado debe tener al menos 5 caracteres.');
      return false;
    }

    return true;
  }

  private showValidationError(message: string): void {
    Swal.fire({
      icon: 'error',
      title: 'Error en la Validación',
      text: message,
      confirmButtonText: 'Entendido'
    });
  }

  private processValidationItems(): void {
    if (this.dbNominas?.items) {
      this.dbNominas.items.forEach((sol: NominaItem) => {

        if(sol.nombre != null || sol.nombre != undefined)
        {
          sol.nombre = this.bsiHelper.toProperCase(sol.nombre);
        }
        sol.toggleEnabled = false;
      });
      this.dbNominas.header.cantidad = this.dbNominas.items.length;
    }
  }

  addNewItem(): void {
    if (!this.executeValidations(this.newItem.cuil, this.newItem.cbu, this.newItem.nombre)) {
      return;
    }

    const fullName = `${this.bsiHelper.toProperCase(this.newItem.apellido)} ${this.bsiHelper.toProperCase(this.newItem.nombre)}`;
    const newItemToAdd: NominaItem = { 
      ...this.newItem, 
      nombre: fullName, 
      apellido: this.bsiHelper.toProperCase(this.newItem.apellido),
      toggleEnabled: false
    };

    this.filteredItems.unshift(newItemToAdd);
    this.nuevasNominas.push(newItemToAdd);

    if (this.isNominasEmpty) {
      this.dbNominas.items = this.filteredItems;
      this.isNominasEmpty = false;
    }

    this.resetNewItem();
    this.recalculateTotal();
  }

  private resetNewItem(): void {
    this.newItem = { cbu: '', cuil: '', apellido: '', nombre: '', importe: 0, toggleEnabled: false };
  }

  applyFilter(): void {
    if (this.dbNominas?.items) {
      const term = this.searchTerm.toLowerCase();
      this.filteredItems = this.dbNominas.items.filter((item: NominaItem) =>
        Object.values(item).some((value: any) =>
          value?.toString().toLowerCase().includes(term)
        )
      );
    }
  }

  applyMassiveImporte(value: number): void {
    if (this.dbNominas?.items) {
      this.dbNominas.items.forEach((item: NominaItem) => {
        if (item.toggleEnabled) {
          item.importe = value;
        }
      });
      this.recalculateTotal();
    }
  }

  toggleImporte(sol: NominaItem): void {
    if (sol.importe === undefined) {
      sol.toggleEnabled = false;
      return;
    }

    if (sol.importe > 0) {
      sol.toggleEnabled ? this.addToSelected(sol) : this.removeFromSelected(sol);
    } else {
      sol.toggleEnabled = false;
      console.error('El importe debe ser mayor que cero para activar el toggle.');
    }
    this.recalculateTotal();
  }

  addToSelected(item: NominaItem): void {
    if (!this.selectedItems.includes(item)) {
      this.selectedItems.push(item);
    }
    // Remover de filteredItems para que desaparezca de la grilla principal
    this.filteredItems = this.filteredItems.filter((i: NominaItem) => i !== item);
    this.recalculateTotal();
    // Actualizar visibilidad del botón
    this.checkScrollPosition();
  }

  removeFromSelected(item: NominaItem): void {
    item.toggleEnabled = false;
    this.selectedItems = this.selectedItems.filter((selected: NominaItem) => selected !== item);
    // Devolver el elemento a filteredItems para que aparezca en la grilla principal
    if (!this.filteredItems.includes(item)) {
      this.filteredItems.push(item);
    }
    this.recalculateTotal();
    // Actualizar visibilidad del botón
    this.checkScrollPosition();
  }

  updateImporte(sol: NominaItem, newValue: number): void {
    sol.importe = newValue || 0;
    this.recalculateTotal();
  }

  recalculateTotal(): void {
    let total = 0;
    let cantidad = 0;

    [...this.selectedItems, ...this.filteredItems].forEach((item) => {
      if (item.toggleEnabled) {
        total += parseFloat(item.importe.toString()) || 0;
        cantidad += 1;
      }
    });

    if (this.dbNominas.header) {
      this.dbNominas.header.importe_total = total;
      this.dbNominas.header.cantidad = cantidad;
    } else {
      this.dbNominas.header = { importe_total: total, cantidad: cantidad };
    }
  }

  goBack(): void {
    this.location.back();
  }

  scrollToSelectedItems(): void {
    const selectedSection = document.getElementById('selected-items-section');
    if (selectedSection) {
      selectedSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Alternativa si scrollIntoView no funciona
      const yOffset = -100; // Offset para dejar espacio
      const y = selectedSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      console.log('No se encontró la sección de elementos seleccionados');
    }
  }

  scrollToTop(): void {
    // Buscar el card de la lista principal (tercera card)
    const mainTableCard = document.querySelectorAll('.card-theme')[2];
    if (mainTableCard) {
      mainTableCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      // Si no encuentra la card, ir al top de la página
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }


  async sendFile(): Promise<void> {
    try {
      this.isLoading = true;
      
      // Validar que tengamos contexto válido
      if (!tieneContextoValido()) {
        throw new Error('Contexto de sesión inválido. Por favor, recargue la página.');
      }

      // Validar que tengamos al menos elementos seleccionados para procesar pagos
      if (!this.selectedItems || this.selectedItems.length === 0) {
        throw new Error('No hay elementos seleccionados para procesar pagos.');
      }

      console.log('🚀 Iniciando proceso de nómina y pagos...');
      
      // Obtener contexto actual
      const contexto = obtenerContextoActual();
      
      // Convertir datos locales al formato del modelo
      // TODAS las nóminas (nuevas + seleccionadas) deben pasar por el SP de validación
      // El SP detecta automáticamente si son nuevas o actualizaciones
      const todasLasNominas: ModelNominaItem[] = [
        ...this.nuevasNominas,
        ...this.selectedItems
      ].map(item => ({
        cbu: item.cbu,
        cuil: item.cuil,
        apellido: item.apellido,
        nombre: item.nombre,
        importe: item.importe
      }));

      const pagosParaProcesar: ModelNominaItem[] = this.selectedItems.map(item => ({
        cbu: item.cbu,
        cuil: item.cuil,
        apellido: item.apellido,
        nombre: item.nombre,
        importe: item.importe
      }));

      // Procesar usando el servicio de pagos (que incluye coordinación con nóminas)
      const resultado = await this.pagosService.procesarNominaYPagos(
        todasLasNominas,  // Ahora pasamos TODAS las nóminas
        pagosParaProcesar,
        contexto
      );

      console.log('✅ Proceso completado:', resultado);

      // Navegar directamente a la pantalla de verificación
      // No mostramos mensaje de éxito porque la pantalla de verificación mostrará los resultados
      this.router.navigate([resultado.navigateTo]);

    } catch (error: any) {
      console.error('❌ Error en sendFile():', error);
      this.handleProcessError(error);
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Manejo específico de errores del proceso de nómina/pagos
   */
  private handleProcessError(error: any): void {
    let errorMessage = 'Se produjo un error inesperado durante el procesamiento.';
    
    if (error?.message) {
      errorMessage = error.message;
    } else if (error?.error?.descripcion) {
      errorMessage = error.error.descripcion;
    }

    Swal.fire({
      title: 'Error en Procesamiento',
      text: errorMessage,
      icon: 'error',
      confirmButtonText: 'Entendido'
    });
  }

}