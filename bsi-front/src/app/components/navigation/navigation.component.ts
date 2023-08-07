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

  clickEventsubscription:Subscription;
  public isCollapsed = true;
  usuario = <Usuario>{};

  nombre?= ""
  rol?=""
  grupo?=""
  barrio="";
  showNav?=true;

  constructor(private sharedService:SharedService, private router: Router) {

    this.clickEventsubscription=this.sharedService.getClickEvent().subscribe(us=>{

      this.showNav =us.panel;
      this.usuario.nombre = sessionStorage.getItem('nombre') as string;
      this.usuario.rol = sessionStorage.getItem('rol') as string;
      this.usuario.grupo = sessionStorage.getItem('grupo') as string;
      this.usuario.barrio = sessionStorage.getItem('barrio') as string;

      this.nombre = this.usuario.nombre;
      this.rol = this.usuario.rol;
      this.grupo = this.usuario.grupo;
      this.barrio = this.usuario.barrio;

    });

    }

    ngOnInit() {

      if(sessionStorage.getItem('nombre') == '' || sessionStorage.getItem('nombre') == null){
        this.router.navigate(['/login']);
      } else {

        this.usuario.nombre = sessionStorage.getItem('nombre') as string;
        this.usuario.rol = sessionStorage.getItem('rol') as string;
        this.usuario.grupo = sessionStorage.getItem('grupo') as string;
        this.usuario.barrio = sessionStorage.getItem('barrio') as string;

        this.nombre = this.usuario.nombre;
        this.rol = this.usuario.rol;
        this.grupo = this.usuario.grupo;
        this.barrio = this.usuario.barrio;

      }

    }

}
