import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalarySetupPage } from './salary-setup.page';

describe('SalarySetupPage', () => {
  let component: SalarySetupPage;
  let fixture: ComponentFixture<SalarySetupPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SalarySetupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
