import { Component, OnInit } from '@angular/core';
import { TipoMetada, TipoModulo } from 'src/app/enums/enums';
import { FileService } from 'src/app/services/file.service';

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
  ID = 0;
  cantidad = 0;

  validationData: any;  
  metadata: any;       


  constructor(private fileService: FileService ) {

   }

  ngOnInit(): void {

  
    this.municipio = this.toProperCase(sessionStorage.getItem('Organismo') as string)

    this.ld_header = true;

    this.fileService.getFill(TipoModulo.NOMINA, this.ID).subscribe((res) => {

      this.fileService.getMetaDataUI(TipoModulo.NOMINA , TipoMetada.FILL).subscribe((metadata) => {

          this.metadata = (metadata  as any)[0].metadata_json;
          this.validationData = (res as any)[0].resultado_json;

          if (this.validationData?.items) {
            this.validationData.items.forEach((sol: any) => {

              this.cantidad += 1;    
              sol.toggleEnabled = true;

            });
          }

          // Asignar el valor de la cantidad a la variable en la cabecera
          this.validationData.header.cantidad = this.cantidad;
          
          this.ld_header = false;
        });
    },
      (err) => console.error(err)
    );
  

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
    this.recalculateTotal();
  }

  toProperCase(str: string): string {
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

}
