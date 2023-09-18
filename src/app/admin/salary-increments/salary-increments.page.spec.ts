import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalaryIncrementsPage } from './salary-increments.page';

describe('SalaryIncrementsPage', () => {
  let component: SalaryIncrementsPage;
  let fixture: ComponentFixture<SalaryIncrementsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SalaryIncrementsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
