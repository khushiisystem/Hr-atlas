import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdvancePayCardPage } from './advance-pay-card.page';

describe('AdvancePayCardPage', () => {
  let component: AdvancePayCardPage;
  let fixture: ComponentFixture<AdvancePayCardPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AdvancePayCardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
