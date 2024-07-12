import { EnumLotes, LotesFilterOptions } from '../../models/Model';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Lotes } from 'src/app/models/Model';
import { LotesService } from 'src/app/services/lotes.service';
import { SharedService } from 'src/app/services/shared.service';
import { isNgTemplate, ThisReceiver } from '@angular/compiler';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservar',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {

  movements: any;

  constructor(private lotesService: LotesService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService) {
  }

  ngOnInit() {

    this.getMainMenuItems();
  }

  getMainMenuItems() {

    this.lotesService.getMovements()
      .subscribe(
        res => {
          this.movements = res;
        },
        err => console.error(err)
      );
  }

  showAds() {

    Swal.fire({
      title: "Lo sentimos, no tienes acceso a esta funcionalidad, si considerás que puede serte útil, contactate para más información. </br> </br> </br> </br> </br> </br> </br> ",
      width: "160vh",
      padding: "6em",
      color: "#0B5ED7",
      confirmButtonText: "Contactanos",
      background: "#fff url(../../../../../assets/img/reunion.jpg)",
      backdrop: `
        rgba(0,0,123,0.4)
        url("/images/nyan-cat.gif")
        left top
        no-repeat
        heigthAuto 
      `
    });

  }



}
