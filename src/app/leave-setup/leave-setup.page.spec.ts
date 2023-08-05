import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LeaveSetupPage } from './leave-setup.page';

describe('LeaveSetupPage', () => {
  let component: LeaveSetupPage;
  let fixture: ComponentFixture<LeaveSetupPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LeaveSetupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
