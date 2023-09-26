import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalaryPage } from './salary.page';

describe('SalaryPage', () => {
  let component: SalaryPage;
  let fixture: ComponentFixture<SalaryPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SalaryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
