import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagosImportComponent } from './pagos-import.component';

describe('ImportXslComponent', () => {
  let component: PagosImportComponent;
  let fixture: ComponentFixture<PagosImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PagosImportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PagosImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
