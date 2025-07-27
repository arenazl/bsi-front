import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { LoginComponent } from './login/login.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { MenuShowcaseComponent } from './menu-showcase/menu-showcase.component';
import { DinamicModuleComponent } from './dinamic-module/dinamic-module.component';
import { DashboardWrapperComponent } from './dashboard-wrapper/dashboard-wrapper.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dinamicModule/mainmenu', component: MainMenuComponent },
  { path: 'menu-showcase', component: MenuShowcaseComponent },
  { path: 'dinamicModule/:tipomodulo/:contrato/:modalidad', component: DinamicModuleComponent },
  { path: 'dinamicModule/:tipomodulo/:contrato', component: DinamicModuleComponent },
  { path: 'dashboard', component: DashboardWrapperComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BsiRoutingModule { }