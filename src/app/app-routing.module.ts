
import { MapComponent } from './components/legacy/map/map.component';
import { AuditoriaComponent } from './components/legacy/auditoria/auditoria.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GamesListComponent } from './components/legacy/games-list/games-list.component';
import { GameFormComponent } from './components/legacy/game-form/game-form.component';
import { LoginComponent } from './components/bsi/login/login.component';
import { MainMenuComponent } from './components/bsi/main-menu/main-menu.component';
import { RankingComponent } from './components/legacy/ranking/ranking.component';
import { XslVerifiedComponent } from './components/bsi/xsl-verified/xsl-verified.component';
import { DinamicModuleComponent } from './components/bsi/dinamic-module/dinamic-module.component';
import { XslImportComponent } from './components/bsi/xsl-import/xsl-import.component';
import { XslEditabletableComponent } from './components/bsi/xsl-editabletable/xsl-editabletable.component';
import { UserManagementWrapperComponent } from './components/admin/user-management-wrapper/user-management-wrapper.component';
import { ContratoManagementWrapperComponent } from './components/admin/contrato-management-wrapper/contrato-management-wrapper.component';
import { OrganismoManagementWrapperComponent } from './components/admin/organismo-management-wrapper/organismo-management-wrapper.component';
import { DashboardWrapperComponent } from './components/bsi/dashboard-wrapper/dashboard-wrapper.component';
import { ChatbotComponent } from './components/test/chatbot/chatbot.component';
import { PentagramLearningComponent } from './components/test/pentagram-learning/pentagram-learning.component';

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
    path: 'xslImport/:tipomodulo/:contrato/:modalidad',
    component: XslImportComponent
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
    path: 'contratoManagement',
    component: ContratoManagementWrapperComponent
  },
  {
    path: 'organismoManagement',
    component: OrganismoManagementWrapperComponent
  },


  {
    path: 'dashboard',
    component: DashboardWrapperComponent
  },
  {
    path: 'chatbot',
    component: ChatbotComponent
  } ,
  {
    path: 'penta',
    component: PentagramLearningComponent
  } 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
