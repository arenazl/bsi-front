import { EnumLotes, LotesFilterOptions } from '../../models/Model';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Lotes } from 'src/app/models/Model';
import { LotesService } from 'src/app/services/lotes.service';
import { SharedService } from 'src/app/services/shared.service';
import { isNgTemplate, ThisReceiver } from '@angular/compiler';

@Component({
  selector: 'app-reservar',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {

  movements : any;

  constructor(private lotesService: LotesService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private sharedService:SharedService) {
  }

  ngOnInit() {

    this.getMainMenuItems();
  }

  getMainMenuItems(){

    this.lotesService.getMovements()
    .subscribe(
      res => {
       this.movements = res;
      },
      err => console.error(err)
    );
  }




}
