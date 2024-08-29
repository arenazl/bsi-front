import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import Dashboard from './dashboard';
import { FileService } from 'src/app/services/file.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-dashboard-wrapper',
  templateUrl: './dashboard-wrapper.component.html',
  styleUrls: ['../../../styles-react.css']
})
export class DashboardWrapperComponent implements OnInit, AfterViewInit {

  @ViewChild('reactContainer', { static: true }) containerRef!: ElementRef;
  private root: Root | null = null;

  constructor(private elementRef: ElementRef, 
              private fileService: FileService) {}

  ngOnInit() {
    // Initialization logic if needed
  }

  ngAfterViewInit() {
    this.renderReactComponent();
  }

  private renderReactComponent() {

    const props: any = {
      getUsers: () => this.fileService.getUsers().toPromise(),
      createUser: (user: any) => this.fileService.createUser(user).toPromise(),
      updateUser: (id: number, user: any) => this.fileService.updateUser(id, user).toPromise(),
      deleteUser: (id: number) => this.fileService.deleteUser(id).toPromise(),
    };

    if (this.containerRef && this.containerRef.nativeElement && !this.root) {
      this.root = createRoot(this.containerRef.nativeElement);
      this.root.render(React.createElement(Dashboard, props));
    } else {
      console.error('React container element not found');
    }
    
  }

}