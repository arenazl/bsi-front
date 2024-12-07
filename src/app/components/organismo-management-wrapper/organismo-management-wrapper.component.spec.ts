import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganismoManagementWrapperComponent } from './organismo-management-wrapper.component';

describe('OrganismoManagementWrapperComponent', () => {
  let component: OrganismoManagementWrapperComponent;
  let fixture: ComponentFixture<OrganismoManagementWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrganismoManagementWrapperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrganismoManagementWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
