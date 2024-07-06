import { LegajoService } from '../../services/legajo.service';
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Usuario } from 'src/app/models/Model';
import { FormControl, FormGroup } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { throwIfEmpty } from 'rxjs';
import { IfStmt } from '@angular/compiler';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  login_txt = "Ingresar";

  constructor(private legajoService: LegajoService, private router: Router, private activatedRoute: ActivatedRoute, private sharedService: SharedService) { }

  form = new FormGroup({
    barrio: new FormControl(null),
    user: new FormControl(null),
    pass: new FormControl(null),
  });


  barrioId: number = 0;
  barrioDesc: string = '';

  usuario = <any>{};

  ngOnInit() {

    this.usuario.panel = false;
    this.sharedService.sendClickEvent(this.usuario);
  }

  onCitySelect(event: any) {
    this.barrioId = event.target.value as number;
  }

  onSubmit() {

    this.login_txt = "Espere..."

    var userPayload = {
      nombre: this.form.value.user as unknown as string,
      password: this.form.value.pass as unknown as string
    };

    this.legajoService.getUsuario(userPayload)
      .subscribe(
        (res: any) => {

          this.login_txt = "Registrado!";

          this.usuario.panel = true

          sessionStorage.setItem('Id', res.ID_USER);
          sessionStorage.setItem('Nombre', res.Nombre);
          sessionStorage.setItem('Apellido', res.Apellido);
          sessionStorage.setItem('IdOrganismo', res.ID_Organismo);
          sessionStorage.setItem('Organismo', res.Nombre_Organismo);

          this.sharedService.sendClickEvent(res);

          this.router.navigate(['/mainmenu']);
          return;



        },
        err => console.error(err)
      )

  }

}
