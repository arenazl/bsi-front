
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { GamesListComponent } from './components/games-list/games-list.component';

// Services
import { LegajoService } from './services/legajo.service';
import { GameFormComponent } from './components/game-form/game-form.component';
import { FileUploadModule } from 'ng2-file-upload';
import { LoginComponent } from './components/login/login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AuditoriaComponent } from './components/auditoria/auditoria.component';
import { MapComponent } from './components/map/map.component';
import { MainMenuComponent } from './components/main-menu/main-menu.component';
import { RankingComponent } from './components/ranking/ranking.component';
import { SafeHtmlPipe } from '../app/sanitize'
import { NgxImageCompressService } from 'ngx-image-compress';
import { PagosSelectionComponent } from './components/pagos-multiples/pagos-selection/pagos-selection.component';
import { PagosImportComponent } from './components/pagos-multiples/pagos-import/pagos-import.component';
import { PagosListComponent } from './components/pagos-multiples/pagos-list/pagos-list.component';
import { BsiCurrencyPipe } from "./pipes/bsi-currency";
import { DinamicModuleComponent } from './components/dinamic-module/dinamic-module.component';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    GamesListComponent,
    GameFormComponent,
    LoginComponent,
    AuditoriaComponent,
    MapComponent,
    MainMenuComponent,
    RankingComponent,
    SafeHtmlPipe,
    PagosSelectionComponent,
    PagosImportComponent,
    PagosListComponent,
    BsiCurrencyPipe,
    DinamicModuleComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    FileUploadModule,
    ReactiveFormsModule,
  ],
  providers: [
    BsiCurrencyPipe,
    LegajoService,
    NgxImageCompressService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
