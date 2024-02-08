import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeaveCardPage } from './leave-card.page';

describe('LeaveCardPage', () => {
  let component: LeaveCardPage;
  let fixture: ComponentFixture<LeaveCardPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LeaveCardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
