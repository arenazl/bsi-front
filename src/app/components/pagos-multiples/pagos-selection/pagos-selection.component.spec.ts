import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagosSelectionComponent } from './pagos-selection.component';

describe('TranfeComponent', () => {
  let component: PagosSelectionComponent;
  let fixture: ComponentFixture<PagosSelectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagosSelectionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagosSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
