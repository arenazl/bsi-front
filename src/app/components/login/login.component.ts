import { LegajoService } from '../../services/legajo.service';
import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { dbResponse, Usuario } from 'src/app/models/Model';
import { FormControl, FormGroup } from '@angular/forms';
import { SharedService } from 'src/app/services/shared.service';
import { throwIfEmpty } from 'rxjs';
import { IfStmt } from '@angular/compiler';
import { FileService } from 'src/app/services/file.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  login_txt = "Ingresar";
  shakeError: boolean = false; // Variable para controlar la animación

  constructor(
    private legajoService: LegajoService, 
    private fileService: FileService,
    private router: Router, 
    private activatedRoute: ActivatedRoute, 
    private sharedService: SharedService,
    private renderer: Renderer2, // Para manipular el DOM de manera segura
    private el: ElementRef
    
  ) { }

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

  triggerShake() {
    // Encuentra el elemento del formulario
    const formContent = this.el.nativeElement.querySelector('#formContent');
    // Añadir la clase para la animación
    this.renderer.addClass(formContent, 'shake');
    // Remueve la clase después de la animación para poder reutilizarla
    setTimeout(() => {
      this.renderer.removeClass(formContent, 'shake');
    }, 500); // Duración de la animación en milisegundos
  }

  updatetext() {
    this.login_txt = "Ingresar";
  }

  onSubmit() {

    this.login_txt = "Validando...";

    var userPayload = {
      nombre: this.form.value.user as unknown as string,
      password: this.form.value.pass as unknown as string
    };

    this.legajoService.getUsuario(userPayload)
      .subscribe(
        (res: dbResponse) => {

          if (res.estado == 0) {
            
           this.triggerShake();
           this.login_txt = "Uusario incorrecto";
            return;
          }

          this.login_txt = "Registrado!";

          this.usuario.panel = true

          sessionStorage.setItem('Id', res.data.ID_User);
          sessionStorage.setItem('Nombre', res.data.Nombre);
          sessionStorage.setItem('Apellido', res.data.Apellido);
          sessionStorage.setItem('IdOrganismo', res.data.ID_Organismo);
          sessionStorage.setItem('Organismo', res.data.Nombre_Organismo);

          this.sharedService.sendClickEvent(res.data);

          this.router.navigate(['/dinamicModule/mainmenu']);
          return;
        },
        err => console.error(err)
      )

  }

}
