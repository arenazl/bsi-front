import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TipoMetada, TipoModulo } from 'src/app/enums/enums';
import { dbResponse } from 'src/app/models/Model';
import { FileService } from 'src/app/services/file.service';
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


  constructor(private fileService: FileService,
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


   // Método para recalcular el importe total
   recalculateTotal() {
    if (this.validationData?.items) {
      let total = 0;
      let cantidad = 0
      
      this.validationData.items.forEach((item: any) => {
        if (item.toggleEnabled) {
          total += parseFloat(item.importe) || 0; // Sumar sólo si está habilitado
          cantidad += 1;
        }
      });
      
      this.validationData.header.importe_total = total;
      this.validationData.header.cantidad = cantidad;
    }
  }

  toggleImporte(sol: any) {
    sol.importe = sol.toggleEnabled ? sol.importe : 0;
    this.recalculateTotal();
  }

  toProperCase(str: string): string {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

}
