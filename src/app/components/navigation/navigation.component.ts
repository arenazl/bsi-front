import { Usuario } from 'src/app/models/Model';
import { SharedService } from './../../services/shared.service';
import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';


@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})

export class NavigationComponent implements OnInit {

  clickEventsubscription: Subscription;
  usuario = <Usuario>{};
  showNav? = true;

  constructor(private sharedService: SharedService, private router: Router) {

    this.clickEventsubscription = this.sharedService.getClickEvent().subscribe(us => {
      this.usuario = us;
      this.showNav = us.Apellido != null ? true : false;
    });

  }

  ngOnInit() {
    if (sessionStorage.getItem('Nombre') == '' || sessionStorage.getItem('Nombre') == null) {
      this.router.navigate(['/login']);
    } else {
      this.usuario.Nombre = sessionStorage.getItem('Nombre') as string;
      this.usuario.Apellido = sessionStorage.getItem('Apellido') as string;
      this.usuario.Nombre_Organismo = sessionStorage.getItem('Organismo') as string;
    }
  }
}
