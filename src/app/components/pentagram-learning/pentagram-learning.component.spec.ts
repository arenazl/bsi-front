import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PentagramLearningComponent } from './pentagram-learning.component';

describe('PentagramLearningComponent', () => {
  let component: PentagramLearningComponent;
  let fixture: ComponentFixture<PentagramLearningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PentagramLearningComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PentagramLearningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
