import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XslEditabletableComponent } from './xsl-editabletable.component';

describe('XslEditabletableComponent', () => {
  let component: XslEditabletableComponent;
  let fixture: ComponentFixture<XslEditabletableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ XslEditabletableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(XslEditabletableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
