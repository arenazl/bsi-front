import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TipoMetada, TipoModulo } from 'src/app/enums/enums';
import { dbResponse } from 'src/app/models/Model';
import { FileService } from 'src/app/services/file.service';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-xsl-editabletable',
  templateUrl: './xsl-editabletable.component.html',
  styleUrls: ['./xsl-editabletable.component.css']
})
export class XslEditabletableComponent implements OnInit {


  ld_header: boolean = false;

  TipoModulo = "";
  headerTitle = "";
  municipio = '';
  cantidad = 0;

  validationData: any;  
  metadata: any;    
  
  user = sessionStorage.getItem('Id') as string;
  contrato = 1; //sessionStorage.getItem('Contrato') as string;
  organismo = sessionStorage.getItem('IdOrganismo') as string;
  nomina = 0;

  importeMasivo: number = 0;
  totalImporte: number = 0;

  searchTerm: string = '';
  filteredItems: any[] = [];
  selectedItems: any[] = [];


  newItem = { cbu: '', cuil: '', Nombre: '', importe: 0, toggleEnabled: false }; // Objeto para almacenar los nuevos datos ingresados

  constructor(private fileService: FileService,
              private location: Location,
              private route: ActivatedRoute) 
              {}

  ngOnInit(): void {
    
    this.municipio = this.toProperCase(sessionStorage.getItem('Organismo') as string)

    this.ld_header = true;

    let payload = { sp_name: 'NOMINA_OBTENER_ID', 
      body: { id_user: this.user, 
              id_contrato: this.contrato, 
              id_organismo: this.organismo } };

              
    this.fileService.postGenericSP(payload).subscribe((res: dbResponse) => {   

        sessionStorage.setItem('IdNomina', res.data.ID_Nomina);
        this.nomina = res.data.ID_Nomina;

        this.fileService.getResumenValidacion(TipoModulo.NOMINA, this.nomina).subscribe((res: any) => {

          this.fileService.getMetaData(TipoModulo.NOMINA , TipoMetada.FILL).subscribe((mt: any) => {
    
              this.metadata = mt.RESULT;

              this.validationData = res.data;

              if (this.validationData?.items) {
                this.filteredItems = this.validationData.items;
              } else {
                this.filteredItems = []; // Asigna un array vacío si no hay items
              }
             
              if (this.validationData?.items) {
                this.validationData.items.forEach((sol: any) => {
    
                  this.cantidad += 1;    
                  sol.toggleEnabled = false;
    
                });
              }
    
              this.validationData.header.cantidad = this.cantidad;
              
              this.ld_header = false;
            });
        },
          (err) => console.error(err)
        );
      },
      err => console.error(err)
    )
  }

    // Método para añadir un nuevo elemento a la lista superior, al inicio
    addNewItem() {
      if (this.newItem.cbu && this.newItem.cuil && this.newItem.Nombre) {
        // Añadir el nuevo elemento al inicio de la lista principal (filteredItems)
        this.filteredItems.unshift({ ...this.newItem });
        
        // Limpiar los campos después de agregar
        this.newItem = { cbu: '', cuil: '', Nombre: '', importe: 0, toggleEnabled: false };
        
        // Opcional: recalcular si necesitas actualizar totales o alguna otra lógica
        this.recalculateTotal();
      } else {
        // Puedes mostrar un mensaje de error si algún campo está vacío
        console.error('Todos los campos deben ser completados.');
      }
    }

 // Método de filtrado
    applyFilter() {

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
    if (this.validationData && this.validationData.items) {
      this.validationData.items.forEach((item: { toggleEnabled: any; importe: number; }) => {
        if (item.toggleEnabled) {
          item.importe = value;
        }
      });
      this.recalculateTotal();
    }
  }


  updateImporte(sol: any, newValue: number) {
    sol.importe = newValue;
      // Recalcular el importe total
      this.recalculateTotal();
  }


  // Método para actualizar la lista de seleccionados al activar el toggle
  toggleImporte(sol: any) {
    if (sol.toggleEnabled) {
      // Mover a lista de seleccionados si se activa
      this.selectedItems.push(sol);
      this.filteredItems = this.filteredItems.filter(item => item !== sol);
    } else {
      // Resetear el importe si se desactiva
      sol.importe = 0;
      this.recalculateTotal();
    }
  }

  // Método para eliminar un elemento de la lista de seleccionados y devolverlo a la principal
  removeFromSelected(item: any) {
    item.toggleEnabled = false; // Desactivar toggle
    this.selectedItems = this.selectedItems.filter(selected => selected !== item);
    this.filteredItems.push(item); // Devolver a la lista principal
    this.recalculateTotal();
  }

  // Método existente para recalcular el importe total
  recalculateTotal() {
    if (this.validationData?.items) {
      let total = 0;
      let cantidad = 0;
      this.selectedItems.forEach((item: any) => {
        if (item.toggleEnabled) {
          total += parseFloat(item.importe) || 0; // Sumar solo si está habilitado
          cantidad += 1;
        }
      });

      this.validationData.header.importe_total = total;
      this.validationData.header.cantidad = cantidad;
    }
  }

 

  goBack(): void {
    this.location.back();
  }


  toProperCase(str: string): string {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

}
