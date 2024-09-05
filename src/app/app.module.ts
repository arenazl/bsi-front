
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
import { XslImportComponent } from './components/xsl-import/xsl-import.component';
import { XslVerifiedComponent } from './components/xsl-verified/xsl-verified.component';
import { BsiCurrencyPipe } from "./pipes/bsi-currency";
import { DinamicModuleComponent } from './components/dinamic-module/dinamic-module.component';
import { DatePipe } from '@angular/common';
import { XslEditabletableComponent } from './components/xsl-editabletable/xsl-editabletable.component';
import { CurrencyMaskModule } from "ng2-currency-mask";
import { UserManagementWrapperComponent } from './components/user-management-wrapper/user-management-wrapper.component';
import { DashboardWrapperComponent } from './components/dashboard-wrapper/dashboard-wrapper.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';


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
    XslImportComponent,
    XslVerifiedComponent,
    BsiCurrencyPipe,
    DinamicModuleComponent,
    XslEditabletableComponent,
    UserManagementWrapperComponent,
    DashboardWrapperComponent,
    ChatbotComponent

  ],
  imports: [
    CurrencyMaskModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    FileUploadModule,
    ReactiveFormsModule,
  ],
  providers: [
    BsiCurrencyPipe,
    DatePipe,
    LegajoService,
    NgxImageCompressService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
