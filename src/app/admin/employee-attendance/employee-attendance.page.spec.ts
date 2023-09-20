import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeAttendancePage } from './employee-attendance.page';

describe('EmployeeAttendancePage', () => {
  let component: EmployeeAttendancePage;
  let fixture: ComponentFixture<EmployeeAttendancePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EmployeeAttendancePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
