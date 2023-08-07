import { FileForTable, FinPago, Refuerzo, Ventas } from './../../models/Model';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl } from '@angular/forms';
import { LegajoService } from '../../services/legajo.service';
import { Component, OnInit, HostBinding, AfterViewInit, ElementRef } from '@angular/core';
import { Solicitud, Usuario, Params } from 'src/app/models/Model';
import { FileService } from './../../services/file.service';
import {saveAs} from 'file-saver';
import { SharedService } from 'src/app/services/shared.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-ranking',
  templateUrl: './ranking.component.html',
  styleUrls: ['./ranking.component.css']
})
export class RankingComponent implements OnInit {

  ventas: any = [];

  constructor(private legajoService: LegajoService) { }

  ngOnInit(): void {

let barrio_id = sessionStorage.getItem('id_barrio') as unknown as number


    this.legajoService.getVentas(barrio_id)
    .subscribe(
      res => {


        let list = res as Array<any>;
        let maxValue = 0;

        list.forEach((item: Ventas, index: number) => {

        if(index == 0){
          item.indice=1;
          maxValue=item.total;
        }
        item.indice =  item.total / maxValue;

       });

           this.ventas = list;

      },
      err => console.error(err)
    );

  }

  closeRanking(id: any){

    let myElement = document.getElementById(id);
    if(myElement)
      myElement.style.display = "none";
  }


}
