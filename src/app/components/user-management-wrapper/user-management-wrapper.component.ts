import { Component, OnInit, OnDestroy, ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';
import UserManagement from './UserManagement';
import { FileService } from 'src/app/services/file.service';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-user-management-wrapper',
  templateUrl: './user-management-wrapper.component.html',
  styleUrls: ['../../../styles-react.css']
})
export class UserManagementWrapperComponent implements OnInit, AfterViewInit {
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

    const showAlert = (message: string, type: 'success' | 'error') => {
      Swal.fire({
        title: type === 'success' ? 'Éxito' : 'Error',
        text: message,
        icon: type,
        confirmButtonText: 'OK'
      });
    };

    const props: any = {
      getUsers: () => this.fileService.getUsers().toPromise(),
      createUser: (user: any) => this.fileService.createUser(user).toPromise(),
      updateUser: (id: number, user: any) => this.fileService.updateUser(id, user).toPromise(),
      deleteUser: (id: number) => this.fileService.deleteUser(id).toPromise(),
      showAlert: showAlert
    };
  
    if (this.containerRef && this.containerRef.nativeElement && !this.root) {
      this.root = createRoot(this.containerRef.nativeElement);
      this.root.render(React.createElement(UserManagement, props));
    } else {
      console.error('React container element not found');
    }
    
  }


}