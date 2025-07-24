import { LegajoService } from '../../../services/legajo.service';
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

    // Cambio: Usar el nuevo servicio de autenticación
    this.fileService.login(userPayload)
      .subscribe(
        (res: any) => {

          if (res.estado == 0) {
            
           this.triggerShake();
           this.login_txt = "Usuario incorrecto";
            return;
          }

          this.login_txt = "Registrado!";

          this.usuario.panel = true

          // Guardar tokens JWT
          if (res.tokens) {
            localStorage.setItem('accessToken', res.tokens.accessToken);
            localStorage.setItem('refreshToken', res.tokens.refreshToken);
          }

          // Guardar datos del usuario
          sessionStorage.setItem('idUser', res.datos.ID_User);
          sessionStorage.setItem('Nombre', res.datos.Nombre);
          sessionStorage.setItem('Apellido', res.datos.Apellido);
          sessionStorage.setItem('IdOrganismo', res.datos.ID_Organismo);
          sessionStorage.setItem('Organismo', res.datos.Nombre_Organismo || '');

          const contratos = res.datos.Contratos || []; 

          sessionStorage.setItem('Contratos', JSON.stringify(contratos));

          this.sharedService.sendClickEvent(res.datos);

          this.router.navigate(['/dinamicModule/mainmenu']);
          return;
        },
        err => {
          console.error(err);
          this.triggerShake();
          this.login_txt = "Error al iniciar sesión";
        }
      )

  }

}
