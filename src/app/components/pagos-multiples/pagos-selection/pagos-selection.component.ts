import { Component, OnInit } from '@angular/core';
import { Item } from 'src/app/models/Model';
import { FileService } from 'src/app/services/file.service';

@Component({
  selector: 'app-tranfe',
  templateUrl: './pagos-selection.component.html',
  styleUrls: ['./pagos-selection.component.css']

})

export class PagosSelectionComponent implements OnInit {

  items: Item[] = [];
  ld_header: boolean = true;

  constructor(private fileService: FileService) { }

  ngOnInit(): void {
    this.loadItems();
  }

  loadItems(): void {

    /*
    this.fileService.getContratosBotones(1, 71).subscribe((data: any) => {
      this.ld_header = false;
      this.items = data;
    });*/

    /*
      this.items = [
        { id: 1, description: 'Pago de Beneficios', buttonText: 'Pago de Beneficios', link: '/pagosImport/1', active: true },
        { id: 2, description: 'Pago de Haberes', buttonText: 'Pago de Haberes', link: '/pagosImport/2', active: true },
        { id: 3, description: 'Pago a Proveedores', buttonText: 'Pago a Proveedores', link: '/pagosImport/3', active: true },
        { id: 4, description: 'Pago de Honorarios', buttonText: 'Pago de Honorarios', link: '/pagosImport/4', active: true },
        { id: 5, description: 'Embargos (Banco Provincia)', buttonText: 'Embargos (Banco Provincia)', link: '/pagosImport/5', active: false },
        { id: 6, description: 'Embargos (Otros Bancos)', buttonText: 'Embargos (Otros Bancos)', link: '/pagosImport/6', active: false }
      ];*/

  }



}
