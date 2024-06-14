import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportXslComponent } from './import-xsl.component';

describe('ImportXslComponent', () => {
  let component: ImportXslComponent;
  let fixture: ComponentFixture<ImportXslComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportXslComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportXslComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
