import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalaryHistoryPage } from './salary-history.page';

describe('SalaryHistoryPage', () => {
  let component: SalaryHistoryPage;
  let fixture: ComponentFixture<SalaryHistoryPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SalaryHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
