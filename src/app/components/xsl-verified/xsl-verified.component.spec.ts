import { ComponentFixture, TestBed } from '@angular/core/testing';

import { XslVerifiedComponent } from './xsl-verified.component';

describe('PagosListComponent', () => {
  let component: XslVerifiedComponent;
  let fixture: ComponentFixture<XslVerifiedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [XslVerifiedComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(XslVerifiedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
