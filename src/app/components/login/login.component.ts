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

  finca: string = 'Finca Don Eugenio II';
  yachting: string  = 'Don Luis (Yachting Club)';
  login_txt="Ingresar";

  constructor(private legajoService: LegajoService, private router: Router, private activatedRoute: ActivatedRoute, private sharedService:SharedService) { }

  form= new FormGroup({
    barrio:new FormControl(null),
    user:new FormControl(null),
    pass:new FormControl(null),
  });

  barrioId:number=0;
  barrioDesc:string='';

  usuario = <Usuario>{};

  ngOnInit() {

      this.usuario.panel=false;
      this.sharedService.sendClickEvent(this.usuario);
  }

  onCitySelect(event:any) {
    this.barrioId = event.target.value as number;
  }

  onSubmit(){

    this.login_txt = "Espere..."

    this.usuario = {
    nombre: this.form.value.user as unknown as string,
    password: this.form.value.pass as unknown as string,
    id_barrio: 1
    };

    if(this.barrioId == 1) this.barrioDesc=this.finca; else this.barrioDesc= this.yachting;

    this.legajoService.getUsuario(this.usuario)
    .subscribe(
      res => {    

        this.login_txt = "Registrado!";

        this.usuario = (res as any)[0];
        

        if(this.usuario.nombre)
        { 
          this.usuario.panel=true
          //from db
          sessionStorage.setItem('nombre', this.usuario.nombre);
          sessionStorage.setItem('password', this.usuario.password as string);
          sessionStorage.setItem('grupo', this.usuario.grupo as string);
          sessionStorage.setItem('id_grupo', this.usuario.id_grupo as unknown as string);
  

          this.sharedService.sendClickEvent(this.usuario);

          this.router.navigate(['/tranfe']);
          return;
          
          if (this.usuario.rol == 'Vendedor') {
            this.router.navigate(['/reservar']);
          }
          if (this.usuario.rol == 'Control') {
            this.router.navigate(['/auditoria']);
          }
          if (this.usuario.rol == 'Documentacion') {
            this.router.navigate(['/auditoria']);
          }
          if (this.usuario.rol == 'Admin') {
            this.router.navigate(['/legajo']);
          }

        }
      },
      err => console.error(err)
    )
  }
}
