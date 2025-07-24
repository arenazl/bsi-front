import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuService, MenuActivity } from 'src/app/services/menu.service';
import { SharedService } from 'src/app/services/shared.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.css']
})
export class MainMenuComponent implements OnInit {

  menuConfiguration: MenuActivity[] = [];

  constructor(private menuService: MenuService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService) {
  }

  ngOnInit() {

    this.loadMenuConfiguration();
  }

  loadMenuConfiguration() {

    this.menuService.getMenuConfiguration()
      .subscribe(
        res => {
          this.menuConfiguration = res;
        },
        err => console.error(err)
      );
  }

  showAccessDeniedModal() {

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
