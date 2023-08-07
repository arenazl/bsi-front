import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ControladorComponent } from './controlador.component';

describe('ControladorComponent', () => {
  let component: ControladorComponent;
  let fixture: ComponentFixture<ControladorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ControladorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ControladorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
