import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PayrollSetupPage } from './payroll-setup.page';

describe('PayrollSetupPage', () => {
  let component: PayrollSetupPage;
  let fixture: ComponentFixture<PayrollSetupPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PayrollSetupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
