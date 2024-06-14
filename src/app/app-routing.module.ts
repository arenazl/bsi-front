
import { MapComponent } from './components/map/map.component';
import { AuditoriaComponent } from './components/auditoria/auditoria.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GamesListComponent } from './components/games-list/games-list.component';
import { GameFormComponent } from './components/game-form/game-form.component';
import { LoginComponent } from './components/login/login.component';
import { ReservarComponent } from './components/reservar/reservar.component';
import { RankingComponent } from './components/ranking/ranking.component';
import { TranfeComponent } from './components/tranfe/tranfe.component';
import { ImportXslComponent } from './import-xsl/import-xsl.component';

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
    path: 'reservar',
    component: ReservarComponent
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
    path: 'tranfe',
    component: TranfeComponent
  },

  {
    path: 'importxls/add',
    component: ImportXslComponent
  },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
