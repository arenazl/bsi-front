import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { BsiHelper as BsiHelper } from 'src/app/services/bsiHelper.service';
import { dbRequest, dbResponse } from 'src/app/models/Model';
import Swal from 'sweetalert2';
import { Router, ActivatedRoute } from '@angular/router';
import { TipoModulo } from 'src/app/enums/enums';
import { FileService } from 'src/app/services/file.service';
import { switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-xsl-editabletable',
  templateUrl: './xsl-editabletable.component.html',
  styleUrls: ['./xsl-editabletable.component.css']
})
export class XslEditabletableComponent implements OnInit {
  ld_header = false;
  headerTitle = '';
  cantidad = 0;

  organismo_descripcion="";
  ID=0;
  contrato=0;
  organismo = 0;
  user = 0;

  metadata: any = { HEADER: [], 'TABLE-COLUMN': [] }; // Inicialización segura
  dbNominas: any = { header: {}, items: [] };

  filteredItems: any[] = []; 
  selectedItems: any[] = []; 
  nuevasNominas: any[] = []; 
  isNominasEmpty = false;

  newItem = { cbu: '', cuil: '', apellido: '', nombre: '', importe: 0, toggleEnabled: false };
  searchTerm = '';
  

  constructor(
    private bsiHelper: BsiHelper,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private fileservice: FileService
  ) { }

  ngOnInit(): void 
  {

    //session
    this.contrato = sessionStorage.getItem('IdContrato') as unknown as number;
    this.organismo = sessionStorage.getItem('IdOrganismo') as unknown as number;  
    this.organismo_descripcion = this.bsiHelper.toProperCase(sessionStorage.getItem('Organismo') as string)
    this.user = sessionStorage.getItem('idUser') as unknown as number;

    this.loadNominaImporte();   

  }

  private loadNominaImporte(): void {

    const payload = {
      sp_name: "NOMINA_OBTENER_RESUMEN_BY_ID",
      body:
      {
        id_user: this.user,
        id_contrato: this.contrato,
        id_organismo: this.organismo,
      }};


    this.fileservice.postSelectGenericSP(payload).subscribe({  
      next: (res) => {

        if(res == null)
        {
          this.isNominasEmpty = true;
          return;
        }

        this.dbNominas = {
          ...res.data,
          items: res.data?.items?.filter((sol: any) => {
              return sol.valido == 1;
            }) || [],
        };

        this.dbNominas.header.importe_total = 0
    
        this.filteredItems = this.dbNominas?.items || [];
       
        this.bsiHelper.getMetaData().subscribe({
          next: (mt) => {
            this.metadata = mt.RESULT;
            this.processValidationItems();
            this.ld_header = false; 
          },
          error: (err) => console.error(err)
        });
        
      },
      error: (err) => console.error(err)
    });
  }

    // Método de ejemplo donde se aplican las validaciones
    executeValidations(cuil: string, cbu: string, name: string): boolean {

      if(!this.newItem.cbu || !this.newItem.cuil || !this.newItem.nombre)
      {
        Swal.fire({
          icon: 'error',
          title: 'Error en la Validación',
          text: 'Todos los campos son obligatorios.',
          confirmButtonText: 'Entendido'
        });
        return false;
      }
  
      if (!this.bsiHelper.validateCuil(cuil)) {
        Swal.fire({
          icon: 'error',
          title: 'Error en la Validación',
          text: 'El CUIL ingresado es inválido. Asegúrate de que siga el formato correcto y el dígito verificador sea correcto.',
          confirmButtonText: 'Entendido'
        });
        return false;
      }
  
      if (!this.bsiHelper.validateCbu(cbu)) {
        Swal.fire({
          icon: 'error',
          title: 'Error en la Validación',
          text: 'El CBU ingresado es inválido. Debe tener 22 dígitos y un dígito verificador correcto.',
          confirmButtonText: 'Entendido'
        });
        return false;
      }
  
      if (!this.bsiHelper.validateName(name)) {
        Swal.fire({
          icon: 'error',
          title: 'Error en la Validación',
          text: 'El nombre ingresado debe tener al menos 5 caracteres.',
          confirmButtonText: 'Entendido'
        });
        return false;
      }
  
      // Si todas las validaciones pasan
      return true;
    }


  private processValidationItems(): void {
    if (this.dbNominas?.items) {
      this.dbNominas.items.forEach((sol: any) => {
        sol.nombre = this.bsiHelper.toProperCase(sol.nombre);
        sol.toggleEnabled = false;
      });
      this.dbNominas.header.cantidad = this.dbNominas.items.length;
    }
  }
  

  addNewItem(): void {

    if(!this.executeValidations(this.newItem.cuil, this.newItem.cbu, this.newItem.nombre))
    {
      return;
    }
    else  
    {
      this.newItem.nombre = this.bsiHelper.toProperCase(this.newItem.nombre);
      this.newItem.apellido = this.bsiHelper.toProperCase(this.newItem.apellido);
  
        this.filteredItems.unshift({ ...this.newItem });  
        this.nuevasNominas.push({ ...this.newItem }); 
  
        this.newItem = { cbu: '', cuil: '', apellido: '', nombre: '', importe: 0, toggleEnabled: false };  
    } 
  }

  applyFilter(): void {
    if (this.dbNominas?.items) {
      const term = this.searchTerm.toLowerCase();
      this.filteredItems = this.dbNominas.items.filter((item: any) =>
        Object.values(item).some((value: any) =>
          value?.toString().toLowerCase().includes(term)
        )
      );
    }
  }

  applyMassiveImporte(value: number): void {
    if (this.dbNominas?.items) {
      this.dbNominas.items.forEach((item: any) => {
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

    this.filteredItems = this.filteredItems.filter((i: any) => i !== item);

    this.recalculateTotal();
  }

  removeFromSelected(item: any): void {

    item.toggleEnabled = false;
    this.selectedItems = this.selectedItems.filter((selected: any) => selected !== item);

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
        this.dbNominas.header.importe_total = total;
      }
    });

  }

  goBack(): void {
    this.location.back();
  }

  sendFile() {
    const payloadNomina: dbRequest = {
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
          NOMBRE: item.nombre
        }))
      }
    };
  
    // Llamada al servicio genérico para la validación de nómina
    this.fileservice.postInsertGenericSP(payloadNomina).subscribe({
      next: (res_nomina: dbResponse) => {
        // Si la validación de nómina falla, redirige a la verificación de nómina
        if (res_nomina.estado !== 1) {
          this.router.navigate(['/xslVerified/' + TipoModulo.NOMINA + '/' + res_nomina.data.id_insertado + "/true" ]);
          return;
        }
   
        // Si la validación de nómina es exitosa, procede con el payload de pagos
        const today = new Date().toISOString().split('T')[0];
        const payloadPagos = {
          sp_name: "PAGO_VALIDAR_INSERTAR_ENTRADA", // Nombre del SP para pagos
          jsonUnify: true,
          body: {
            CONCEPTO: 'SUELDOS',
            FECHAPAGO: today,
            IDCONT: sessionStorage.getItem('IdContrato'),
            IDORG: sessionStorage.getItem('IdOrganismo'),
            IDUSER: sessionStorage.getItem('idUser'),
            ITEMS: this.selectedItems.map((item : any) => ({
              CBU: item.cbu,
              CUIL: item.cuil,
              IMPORTE: item.importe,
              NOMBRE: item.nombre
            }))
          }
        };
  
        // Llamada al servicio genérico para la inserción de pagos
        this.fileservice.postInsertGenericSP(payloadPagos).subscribe({

          next: (res_pago: dbResponse) => {
              this.router.navigate(['/xslVerified/' + TipoModulo.PAGO + '/' + res_pago.data.id_insertado]);
          },
          error: (err) => {
            console.error(err);
            Swal.fire({
              title: "Error",
              text: err.message || "Se produjo un error inesperado",
              icon: "error",
            });
          }
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          title: "Error",
          text: err.message || "Se produjo un error inesperado",
          icon: "error",
        });

      }
    });
    
  }

}

