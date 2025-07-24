import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Components
import { UserManagementWrapperComponent } from './user-management-wrapper/user-management-wrapper.component';
import { PaymentsMetricsComponent } from './payments-metrics-wrapper/payments-metrics.component';
import { ContratoManagementWrapperComponent } from './contrato-management-wrapper/contrato-management-wrapper.component';
import { OrganismoManagementWrapperComponent } from './organismo-management-wrapper/organismo-management-wrapper.component';

@NgModule({
  declarations: [
    UserManagementWrapperComponent,
    PaymentsMetricsComponent,
    ContratoManagementWrapperComponent,
    OrganismoManagementWrapperComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  exports: [
    UserManagementWrapperComponent,
    PaymentsMetricsComponent,
    ContratoManagementWrapperComponent,
    OrganismoManagementWrapperComponent
  ]
})
export class AdminModule { }