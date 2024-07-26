
import { MapComponent } from './components/map/map.component';
import { AuditoriaComponent } from './components/auditoria/auditoria.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GamesListComponent } from './components/games-list/games-list.component';
import { GameFormComponent } from './components/game-form/game-form.component';
import { LoginComponent } from './components/login/login.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { RankingComponent } from './components/ranking/ranking.component';
import { PagosSelectionComponent } from './components/pagos-multiples/pagos-selection/pagos-selection.component';
import { PagosImportComponent } from './components/pagos-multiples/pagos-import/pagos-import.component';
import { PagosListComponent } from './components/pagos-multiples/pagos-list/pagos-list.component';
import { DinamicModuleComponent } from './components/dinamic-module/dinamic-module.component';

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
    path: 'pagoslist/:id',
    component: PagosListComponent
  },

  {
    path: 'ranking',
    component: RankingComponent
  },
  {
    path: 'pagosSelection',
    component: PagosSelectionComponent
  },

  {
    path: 'pagosImport/:id',
    component: PagosImportComponent
  },

  {
    path: 'dinamicModule/:screen',
    component: DinamicModuleComponent
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
