import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttendanceSetupPage } from './attendance-setup.page';

describe('AttendanceSetupPage', () => {
  let component: AttendanceSetupPage;
  let fixture: ComponentFixture<AttendanceSetupPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AttendanceSetupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
