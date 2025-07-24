import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FileUploadModule } from 'ng2-file-upload';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { SharedModule } from '../../shared/shared.module';

// Components
import { NavigationComponent } from './navigation/navigation.component';
import { LoginComponent } from './login/login.component';
import { MainMenuComponent } from './main-menu/main-menu.component';
import { XslImportComponent } from './xsl-import/xsl-import.component';
import { XslVerifiedComponent } from './xsl-verified/xsl-verified.component';
import { XslEditabletableComponent } from './xsl-editabletable/xsl-editabletable.component';
import { DinamicModuleComponent } from './dinamic-module/dinamic-module.component';
import { DashboardWrapperComponent } from './dashboard-wrapper/dashboard-wrapper.component';

@NgModule({
  declarations: [
    NavigationComponent,
    LoginComponent,
    MainMenuComponent,
    XslImportComponent,
    XslVerifiedComponent,
    XslEditabletableComponent,
    DinamicModuleComponent,
    DashboardWrapperComponent
  ],
  imports: [
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FileUploadModule,
    CurrencyMaskModule
  ],
  exports: [
    NavigationComponent,
    LoginComponent,
    MainMenuComponent,
    XslImportComponent,
    XslVerifiedComponent,
    XslEditabletableComponent,
    DinamicModuleComponent,
    DashboardWrapperComponent
  ]
})
export class BsiModule { }