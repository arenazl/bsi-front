import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { UserManagementWrapperComponent } from './user-management-wrapper/user-management-wrapper.component';
import { PaymentsMetricsComponent } from './payments-metrics-wrapper/payments-metrics.component';
import { ContratoManagementWrapperComponent } from './contrato-management-wrapper/contrato-management-wrapper.component';
import { OrganismoManagementWrapperComponent } from './organismo-management-wrapper/organismo-management-wrapper.component';

const routes: Routes = [
  { path: 'userManagement', component: UserManagementWrapperComponent },
  { path: 'payments-metrics', component: PaymentsMetricsComponent },
  { path: 'contratoManagement', component: ContratoManagementWrapperComponent },
  { path: 'organismoManagement', component: OrganismoManagementWrapperComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }