import { EnumLotes, LotesFilterOptions } from '../../models/Model';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Lotes } from 'src/app/models/Model';
import { LotesService } from 'src/app/services/lotes.service';
import { SharedService } from 'src/app/services/shared.service';
import { Location } from '@angular/common';
import { isNgTemplate, ThisReceiver } from '@angular/compiler';
import Swal from 'sweetalert2';
import { FileService } from 'src/app/services/file.service';


@Component({
  selector: 'app-dinamic-module',
  templateUrl: './dinamic-module.component.html',
  styleUrls: ['./dinamic-module.component.css']
})
export class DinamicModuleComponent implements OnInit {

  @Input() data: any;

  constructor(private fileService: FileService,
    private router: Router,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService) {
  }

  ngOnInit() {

    this.activatedRoute.params.subscribe((params) => {

      let module = params["screen"];
      
      if (params["contrato"] != undefined)
      {
        sessionStorage.setItem('IdContrato', params["contrato"]);
      }
      
      this.fileService.getJsonForScreen(module).subscribe((data: any) => {
        this.data = data;
      });
    });
  }

  goBack(): void {
    this.location.back();
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
