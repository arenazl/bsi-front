import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuService } from '../../../services/menu.service';
import { UserSessionService } from '../../../services/user-session.service';
import Swal from 'sweetalert2';

interface MenuActivity {
  title: string;
  description: string;
  enabled: boolean;
  items?: any[];
}

@Component({
  selector: 'app-menu-showcase',
  templateUrl: './menu-showcase.component.html',
  styleUrls: ['./menu-showcase.component.css']
})
export class MenuShowcaseComponent implements OnInit {
  menuConfiguration: MenuActivity[] = [];
  currentDesign = 1; // 1-5 para cambiar entre diseños
  
  constructor(
    private menuService: MenuService,
    private userSessionService: UserSessionService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadMenuConfiguration();
  }

  loadMenuConfiguration() {
    this.menuService.getMenuConfiguration().subscribe(
      res => {
        this.menuConfiguration = res;
      },
      err => {
        console.error('Error:', err);
        this.menuConfiguration = [];
      }
    );
  }

  changeDesign(designNumber: number) {
    this.currentDesign = designNumber;
  }

  shouldShowActivity(activity: MenuActivity): boolean {
    if (activity.title === 'Administración Backoffice' || 
        activity.title === 'Administración Usuarios') {
      return this.userSessionService.isSuperUser();
    }
    return true;
  }

  getEnabledCount(): number {
    return this.menuConfiguration.filter(a => a.enabled).length;
  }

  showAccessDeniedModal() {
    Swal.fire({
      icon: 'info',
      title: 'Próximamente',
      text: 'Esta funcionalidad estará disponible pronto'
    });
  }
}