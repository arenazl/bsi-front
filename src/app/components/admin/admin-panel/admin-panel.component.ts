import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})
export class AdminPanelComponent implements OnInit {
  activeTab: string = 'organismos';

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Primero verificar si hay un tab en la URL
    this.route.queryParams.subscribe(params => {
      const tabFromUrl = params['tab'];
      if (tabFromUrl && ['organismos', 'contratos', 'usuarios'].includes(tabFromUrl)) {
        this.activeTab = tabFromUrl;
        // Guardar la preferencia
        localStorage.setItem('adminActiveTab', tabFromUrl);
      } else {
        // Si no hay tab en URL, usar la preferencia guardada
        const savedTab = localStorage.getItem('adminActiveTab');
        if (savedTab && ['organismos', 'contratos', 'usuarios'].includes(savedTab)) {
          this.activeTab = savedTab;
        }
      }
    });
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    // Save tab preference
    localStorage.setItem('adminActiveTab', tab);
  }

  isTabActive(tab: string): boolean {
    return this.activeTab === tab;
  }
}