import { EnumLotes, LotesFilterOptions } from './../../models/Model';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Lotes } from 'src/app/models/Model';
import { LotesService } from 'src/app/services/lotes.service';
import { SharedService } from 'src/app/services/shared.service';
import { isNgTemplate, ThisReceiver } from '@angular/compiler';

@Component({
  selector: 'app-reservar',
  templateUrl: './reservar.component.html',
  styleUrls: ['./reservar.component.css']
})
export class ReservarComponent implements OnInit {

  lotes: any = [];
  loteEstado = {};
  lotesFilterOptions = <LotesFilterOptions>{};
  barrio=0;

  expand_text='Mas de un lote';
  expand_css='d-none';

  loteSeleccionado = 0;
  obs:string='';

  login_txt="Reservar";

  lotesArray= Array<Lotes>();

  movements : any;

  constructor(private lotesService: LotesService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private sharedService:SharedService) {
  }

  ngOnInit() {

    this.getLotes();
  }

  getLotes(){

    let barrio = sessionStorage.getItem('id_barrio') as string;
    this.lotesFilterOptions.estado = EnumLotes.Disponible;
    this.lotesFilterOptions.id_barrio = barrio as unknown as number;


    this.lotesService.getMovements()
    .subscribe(
      res => {
       this.movements = res;
      },
      err => console.error(err)
    );
  }


  onLoteSelect(event:any, loteCount:number) {

    let loteId = event.target.value as number
    let lote: Lotes={estado:EnumLotes.Reservado, id: loteId,id_barrio:this.lotesFilterOptions.id_barrio, observaciones:this.obs};
    this.lotesArray[loteCount-1] =lote;

  }

  showHideLotes(){

    if(this.expand_text == 'Mas de un lote')
    {
      this.expand_text = 'Ocultar Lotes';
      this.expand_css = 'block'
    }
    else {
    this.expand_text = 'Mas de un lote';
    this.expand_css = 'd-none'
    }

  }

}
