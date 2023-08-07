import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranfeComponent } from './tranfe.component';

describe('TranfeComponent', () => {
  let component: TranfeComponent;
  let fixture: ComponentFixture<TranfeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TranfeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TranfeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
