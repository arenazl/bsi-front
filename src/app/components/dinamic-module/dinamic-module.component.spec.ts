import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DinamicModuleComponent } from './dinamic-module.component';

describe('DinamicModuleComponent', () => {
  let component: DinamicModuleComponent;
  let fixture: ComponentFixture<DinamicModuleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DinamicModuleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DinamicModuleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
