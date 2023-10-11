import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeePayslipPage } from './employee-payslip.page';

describe('EmployeePayslipPage', () => {
  let component: EmployeePayslipPage;
  let fixture: ComponentFixture<EmployeePayslipPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EmployeePayslipPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
