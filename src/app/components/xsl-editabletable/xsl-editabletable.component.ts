import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { BsiHelper } from 'src/app/services/bsiHelper.service';
import { FileService } from 'src/app/services/file.service';
import { dbRequest, dbResponse } from 'src/app/models/Model';
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
 
  headerTitle = '';
  contrato = 0;
  organismo = 0;
  user = 0;
  fechaPago: string = '';
  isLoading = false;
  organismoDescription = '';

  metadata: any = { HEADER: [], 'TABLE-COLUMN': [] };
  dbNominas: { header: any; items: any[] } = { header: {}, items: [] };

  filteredItems: NominaItem[] = [];
  selectedItems: NominaItem[] = [];
  nuevasNominas: NominaItem[] = [];
  isNominasEmpty = false;

  newItem: NominaItem = { cbu: '', cuil: '', apellido: '', nombre: '', importe: 0, toggleEnabled: false };
  searchTerm = '';

  constructor(
    private bsiHelper: BsiHelper,
    private location: Location,
    private router: Router,
    private fileService: FileService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadSessionData();
    this.loadNominaImporte();
  }

  private loadSessionData(): void {

    this.contrato = Number(sessionStorage.getItem('IdContrato'));
    this.organismo = Number(sessionStorage.getItem('IdOrganismo'));
    this.organismoDescription = this.bsiHelper.toProperCase(sessionStorage.getItem('Organismo') || '');
    this.user = Number(sessionStorage.getItem('idUser'));
    this.fechaPago = sessionStorage.getItem('fechaPago') || '';
  }

  private loadNominaImporte(): void {
    const payload = {
      sp_name: "NOMINA_OBTENER_RESUMEN_BY_ID",
      body: {
        id_user: this.user,
        id_contrato: this.contrato,
        id_organismo: this.organismo,
      }
    };

    this.fileService.postSelectGenericSP(payload).subscribe({
      next: (res) => this.handleNominaImporteResponse(res),
      error: (err) => this.handleError(err)
    });
  }

  private handleNominaImporteResponse(res: any): void {
    if (res == null || res.data.items.length === 0) {
      this.isNominasEmpty = true;
      this.dbNominas.items = [];
      this.filteredItems = [];
    } else {
      this.dbNominas.header = res.data.header;
      this.dbNominas.items = res.data.items;
      this.dbNominas.header.importe_total = 0;
      this.filteredItems = this.dbNominas.items;
    }

    this.loadMetadata();
  }

  private loadMetadata(): void {
    this.bsiHelper.getMetaData().subscribe({
      next: (mt) => {
        this.metadata = mt.RESULT;
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
      text: err.message || "Se produjo un error inesperado",
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
    this.filteredItems = this.filteredItems.filter((i: NominaItem) => i !== item);
    this.recalculateTotal();
  }

  removeFromSelected(item: NominaItem): void {
    item.toggleEnabled = false;
    this.selectedItems = this.selectedItems.filter((selected: NominaItem) => selected !== item);
    if (!this.filteredItems.includes(item)) {
      this.filteredItems.push(item);
    }
    this.recalculateTotal();
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

  sendFile(): void {
    const payloadNomina = this.createNominaPayload();
    
    this.fileService.postInsertGenericSP(payloadNomina).subscribe({
      next: (res_nomina: dbResponse) => this.handleNominaResponse(res_nomina),
      error: (err) => this.handleError(err)
    });
  }

  private createNominaPayload(): dbRequest {
    return {
      sp_name: "NOMINA_VALIDAD_INSERTAR_FULL_VALIDATION",
      jsonUnify: true,
      body: {
        IDCONT: sessionStorage.getItem('IdContrato'),
        IDORG: sessionStorage.getItem('IdOrganismo'),
        IDUSER: sessionStorage.getItem('idUser'),
        ITEMS: this.nuevasNominas.map(item => ({
          CBU: item.cbu,
          CUIL: item.cuil,    
          APELLIDO: item.apellido,
          NOMBRE: item.nombre.split(' ').slice(1).join(' '),
        }))
      }
    };
  }

  private handleNominaResponse(res_nomina: dbResponse): void {
    if (res_nomina.estado !== 1) {
      this.router.navigate(['/xslVerified/' + TipoModulo.NOMINA + '/' + res_nomina.data.id_insertado + "/true"]);
      return;
    }

    const payloadPagos = this.createPagosPayload();
    this.fileService.postInsertGenericSP(payloadPagos).subscribe({
      next: (res_pago: dbResponse) => this.handlePagoResponse(res_pago),
      error: (err) => this.handleError(err)
    });
  }

  private createPagosPayload(): dbRequest {
    const today = new Date().toISOString().split('T')[0];
    return {
      sp_name: "PAGO_VALIDAR_INSERTAR_ENTRADA",
      jsonUnify: true,
      body: {
        CONCEPTO: sessionStorage.getItem('Concepto'),
        FECHAPAGO: today,
        IDCONT: sessionStorage.getItem('IdContrato'),
        IDORG: sessionStorage.getItem('IdOrganismo'),
        IDUSER: sessionStorage.getItem('idUser'),
        ITEMS: this.selectedItems.map((item: NominaItem) => ({
          CBU: item.cbu,
          CUIL: item.cuil,
          IMPORTE: item.importe,
          NOMBRE: item.nombre
        }))
      }
    };
  }

  private handlePagoResponse(res_pago: dbResponse): void {
    this.router.navigate(['/xslVerified/' + TipoModulo.PAGO + '/' + res_pago.data.id_insertado]);
  }
}