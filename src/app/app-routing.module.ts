
import { MapComponent } from './components/map/map.component';
import { AuditoriaComponent } from './components/auditoria/auditoria.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GamesListComponent } from './components/games-list/games-list.component';
import { GameFormComponent } from './components/game-form/game-form.component';
import { LoginComponent } from './components/login/login.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { RankingComponent } from './components/ranking/ranking.component';
import { XslVerifiedComponent } from './components/xsl-verified/xsl-verified.component';
import { DinamicModuleComponent } from './components/dinamic-module/dinamic-module.component';
import { XslImportComponent } from './components/xsl-import/xsl-import.component';
import { XslEditabletableComponent } from './components/xsl-editabletable/xsl-editabletable.component';
import { UserManagementWrapperComponent } from './components/user-management-wrapper/user-management-wrapper.component';
import { DashboardWrapperComponent } from './components/dashboard-wrapper/dashboard-wrapper.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'mapa',
    component: MapComponent
  },
  {
    path: 'mainmenu',
    component: MainMenuComponent
  },
  {
    path: 'legajo',
    component: GamesListComponent
  },

  {
    path: 'legajo/add/:id',
    component: GameFormComponent
  },

  {
    path: 'legajo/edit/:id',
    component: GameFormComponent
  },
  {
    path: 'auditoria/:id',
    component: AuditoriaComponent
  },
  {
    path: 'ranking',
    component: RankingComponent
  },
  {
    path: 'xslVerified/:tipomodulo/:id',
    component: XslVerifiedComponent
  },

  {
    path: 'xslVerified/:tipomodulo/:id/:error',
    component: XslVerifiedComponent
  },

  {
    path: 'xslImport/:tipomodulo/:contrato',
    component: XslImportComponent
  },
  {
    path: 'xslEditabletable/:id',
    component: XslEditabletableComponent
  },

  {
    path: 'xslEditabletable/:id',
    component: XslEditabletableComponent
  },

  { path: 'xslEditabletable', 
    component: XslEditabletableComponent },
  {
    path: 'dinamicModule/:screen',
    component: DinamicModuleComponent
  },
  {
    path: 'dinamicModule/:screen/:contrato',
    component: DinamicModuleComponent
  },
  {
    path: 'userManagement',
    component: UserManagementWrapperComponent
  },
  {
    path: 'dashboard',
    component: DashboardWrapperComponent
  },
  {
    path: 'chatbot',
    component: ChatbotComponent
  } 

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
