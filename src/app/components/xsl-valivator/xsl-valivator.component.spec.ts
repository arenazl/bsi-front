import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XslValidatorComponent } from './xsl-valivator.component';

describe('FileValivatorComponent', () => {
  let component: XslValidatorComponent;
  let fixture: ComponentFixture<XslValidatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [XslValidatorComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(XslValidatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
