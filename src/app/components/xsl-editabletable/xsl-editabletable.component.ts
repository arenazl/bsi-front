import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { XslTableService } from 'src/app/services/XslTableService.service';
import { dbResponse } from 'src/app/models/Model';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { TipoModulo } from 'src/app/enums/enums';
import { FileService } from 'src/app/services/file.service';

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
  ID=0;
  filteredItems: any[] = [];
  selectedItems: any[] = [];
  nuevasNominas: any[] = []; 
  newItem = { cbu: '', cuil: '', apellido: '', nombre: '', importe: 0, toggleEnabled: false };
  searchTerm = '';
  

  constructor(
    private xslTableService: XslTableService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private fileservice: FileService
  ) { }

  ngOnInit(): void {

    this.route.params.subscribe((params) => {

      this.ID = params["id"]
      
      if (this.ID == 0) 
      {
        this.xslTableService
        .getNominaData(sessionStorage.getItem('Id') as string, 3, sessionStorage.getItem('IdOrganismo') as string)
        .subscribe({
          next: (res) => {

            this.ID = res.data.ID_Nomina;
    
            if(res.data.ID_Nomina == 0) 
            {  
              Swal.fire({
                title: "Error al cargar la nomina",
                text: "No se encontró la nomina",
                icon: "error",
              }).then(() => {
                this.location.back();
              });
             this.location.back();
            }  
            else
            {
              this.loadValidationData(this.ID);
            }   
          },
          error: (err) => console.error(err)
        });   
      } 
      else
      {
        this.loadValidationData(this.ID);
      }  
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
    this.newItem.apellido = this.xslTableService.toProperCase(this.newItem.apellido);

    if (this.newItem.cbu && this.newItem.cuil && this.newItem.nombre) {

      this.filteredItems.unshift({ ...this.newItem });
      this.nuevasNominas.push({ ...this.newItem }); // 


      this.newItem = { cbu: '', cuil: '', apellido: '', nombre: '', importe: 0, toggleEnabled: false };
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


    const payloadNomina = {

      IDCONT: "3",
      IDORG: sessionStorage.getItem('IdOrganismo'),
      IDUSER: sessionStorage.getItem('Id'),
      ITEMS: this.nuevasNominas.map(item => ({
        CBU: item.cbu, 
        CUIL: item.cuil,
        APELLIDO: item.apellido, 
        NOMBRE: item.nombre 
      }))
    };

    this.fileservice.postInsertValidateAndInsert(payloadNomina).subscribe({

      next: (res_nomina : dbResponse) => {
       
        if (res_nomina.estado == 1) {  

          const today = new Date();
          const formattedDate = today.toISOString().split('T')[0];
      
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
       
          this.xslTableService.postInsertPagosManual(payload).subscribe({
      
            next: (res_pago: dbResponse) => {  
            
              if (res_pago.estado > 10) {  
      
                Swal.fire({
                  title: "Error al subir el archivo",
                  text:  res_pago.descripcion,
                  icon: "error",
                });
  
              } 
     
              this.router.navigate(['/xslVerified/' + TipoModulo.PAGO   + '/' + res_pago.data.id_insertado]);
    
            },
            error: (err) => console.error(err)
          });
  
        }
        else
        {
          this.router.navigate(['/xslVerified/' + TipoModulo.NOMINA   + '/' + res_nomina.data.id_insertado]);     
        }
        
      },
      error: (err) => console.error(err)
    });

  }

}