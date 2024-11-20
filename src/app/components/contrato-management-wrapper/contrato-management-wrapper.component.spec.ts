import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratoManagementWrapperComponent } from './contrato-management-wrapper.component';

describe('ContratoManagementWrapperComponent', () => {
  let component: ContratoManagementWrapperComponent;
  let fixture: ComponentFixture<ContratoManagementWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ContratoManagementWrapperComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContratoManagementWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
