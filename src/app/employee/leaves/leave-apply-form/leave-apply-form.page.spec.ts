import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeaveApplyFormPage } from './leave-apply-form.page';

describe('LeaveApplyFormPage', () => {
  let component: LeaveApplyFormPage;
  let fixture: ComponentFixture<LeaveApplyFormPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LeaveApplyFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
