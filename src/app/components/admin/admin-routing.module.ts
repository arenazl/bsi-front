import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Componente principal
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
// Guard para proteger las rutas de admin
import { AdminGuard } from '../../guards/admin.guard';

const routes: Routes = [
  { path: '', component: AdminPanelComponent },
  { path: 'panel', component: AdminPanelComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }