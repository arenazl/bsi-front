import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FileUploadModule } from 'ng2-file-upload';

// Components
import { GamesListComponent } from './games-list/games-list.component';
import { GameFormComponent } from './game-form/game-form.component';
import { AuditoriaComponent } from './auditoria/auditoria.component';
import { MapComponent } from './map/map.component';
import { RankingComponent } from './ranking/ranking.component';

@NgModule({
  declarations: [
    GamesListComponent,
    GameFormComponent,
    AuditoriaComponent,
    MapComponent,
    RankingComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FileUploadModule
  ],
  exports: [
    GamesListComponent,
    GameFormComponent,
    AuditoriaComponent,
    MapComponent,
    RankingComponent
  ]
})
export class LegacyModule { }