import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from '../../shared/shared.module';

// Componentes nativos de Angular
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { UserManagementComponent } from './user-management/user-management.component';
import { OrganismoManagementComponent } from './organismo-management/organismo-management.component';
import { ContratoManagementComponent } from './contrato-management/contrato-management.component';

@NgModule({
  declarations: [
    AdminPanelComponent,
    UserManagementComponent,
    OrganismoManagementComponent,
    ContratoManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule,
    SharedModule
  ],
  exports: [
    AdminPanelComponent,
    UserManagementComponent,
    OrganismoManagementComponent,
    ContratoManagementComponent
  ]
})
export class AdminModule { }