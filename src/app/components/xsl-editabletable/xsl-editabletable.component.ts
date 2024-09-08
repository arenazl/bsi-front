import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { XslTableService } from 'src/app/services/XslTableService.service';
import { dbResponse } from 'src/app/models/Model';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { TipoModulo } from 'src/app/enums/enums';

@Component({
  selector: 'app-xsl-editabletable',
  templateUrl: './xsl-editabletable.component.html',
  styleUrls: ['./xsl-editabletable.component.css']
})
export class XslEditabletableComponent implements OnInit {
  ld_header = false;
  headerTitle = '';
  municipio = '';
  cantidad = 0;
  validationData: any;
  metadata: any;
  filteredItems: any[] = [];
  selectedItems: any[] = [];
  newItem = { cbu: '', cuil: '', nombre: '', importe: 0, toggleEnabled: false };
  searchTerm = '';
  

  constructor(
    private xslTableService: XslTableService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.municipio = this.xslTableService.toProperCase(sessionStorage.getItem('Organismo') as string);
    this.ld_header = true;

    this.xslTableService
      .getNominaData(sessionStorage.getItem('Id') as string, 1, sessionStorage.getItem('IdOrganismo') as string)
      .subscribe({
        next: (res) => {
          sessionStorage.setItem('IdNomina', res.data.ID_Nomina);
          this.loadValidationData(res.data.ID_Nomina);
        },
        error: (err) => console.error(err)
      });
  }

  private loadValidationData(nomina: number): void {
    this.xslTableService.getResumenValidacion(nomina).subscribe({
      next: (res) => {
        this.validationData = res.data;
        this.filteredItems = this.validationData?.items || [];
        this.loadMetaData();
      },
      error: (err) => console.error(err)
    });
  }

  private loadMetaData(): void {
    this.xslTableService.getMetaData().subscribe({
      next: (mt) => {
        this.metadata = mt.RESULT;
        this.processValidationItems();
        this.ld_header = false;
      },
      error: (err) => console.error(err)
    });
  }

  private processValidationItems(): void {
    if (this.validationData?.items) {
      this.validationData.items.forEach((sol: any) => {
        sol.nombre = this.xslTableService.toProperCase(sol.nombre);
        sol.toggleEnabled = false;
      });
      this.validationData.header.cantidad = this.validationData.items.length;
    }
  }

  addNewItem(): void {

    this.newItem.nombre = this.xslTableService.toProperCase(this.newItem.nombre);

    if (this.newItem.cbu && this.newItem.cuil && this.newItem.nombre) {
      this.filteredItems.unshift({ ...this.newItem });
      this.newItem = { cbu: '', cuil: '', nombre: '', importe: 0, toggleEnabled: false };
      this.recalculateTotal();
    } else {
      console.error('Todos los campos deben ser completados.');
    }
  }

  applyFilter(): void {
    if (this.validationData?.items) {
      const term = this.searchTerm.toLowerCase();
      this.filteredItems = this.validationData.items.filter((item: any) =>
        Object.values(item).some((value: any) =>
          value?.toString().toLowerCase().includes(term)
        )
      );
    }
  }

  applyMassiveImporte(value: number): void {
    if (this.validationData?.items) {
      this.validationData.items.forEach((item: any) => {
        if (item.toggleEnabled) {
          item.importe = value;
        }
      });
      this.recalculateTotal();
    }
  }

  toggleImporte(sol: any): void {

    if (sol.importe == undefined) {
      sol.toggleEnabled = false;
      return;
    }


    if (sol.importe > 0) {


      if (sol.toggleEnabled) {

        this.addToSelected(sol);
      } else {

        this.removeFromSelected(sol);
      }
    } else {

      sol.toggleEnabled = false;
      console.error('El importe debe ser mayor que cero para activar el toggle.');
    }
    this.recalculateTotal();
  }

  addToSelected(item: any): void {

    if (!this.selectedItems.includes(item)) {
      this.selectedItems.push(item);
    }

    this.filteredItems = this.filteredItems.filter(i => i !== item);
  }

  removeFromSelected(item: any): void {

    item.toggleEnabled = false;
    this.selectedItems = this.selectedItems.filter(selected => selected !== item);

    if (!this.filteredItems.includes(item)) {
      this.filteredItems.push(item);
    }
    this.recalculateTotal();
  }

  updateImporte(sol: any, newValue: number): void {
    sol.importe = newValue || 0;
    this.recalculateTotal();
  }


  recalculateTotal(): void {
    let total = 0;
    let cantidad = 0;

    [...this.selectedItems, ...this.filteredItems].forEach((item) => {
      if (item.toggleEnabled) {
        total += parseFloat(item.importe) || 0;
        cantidad += 1;
      }
    });

    this.validationData.header.importe_total = total;
  }

  goBack(): void {
    this.location.back();
  }


  sendFile()
  {


    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0]; // Esto formatea la fecha como 'YYYY-MM-DD'

    const payload = {
      CONCEPTO: 'SUELDOS',
      FECHAPAGO: formattedDate,
      IDCONT: "1",
      IDORG: sessionStorage.getItem('IdOrganismo'),
      IDUSER: sessionStorage.getItem('Id'),
      ITEMS: this.selectedItems.map(item => ({
        CBU: item.cbu, 
        CUIL: item.cuil,
        IMPORTE: item.importe,
        NOMBRE: item.nombre 
      }))
    };

    
    this.xslTableService.sendFile(payload).subscribe({

      next: (res) => {  

        let response = res as dbResponse;
      
        if (response.estado >= 10) {  

          Swal.fire({
            title: "Error al subir el archivo",
            text:  response.descripcion,
            icon: "error",
          });
        }

        this.router.navigate(['/xslVerified/' + TipoModulo.PAGO   + '/' + response.data.id_insertado]);

      },
      error: (err) => console.error(err)
    });

    
  }

}