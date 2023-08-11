import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeWorkWeekPage } from './employee-work-week.page';

describe('EmployeeWorkWeekPage', () => {
  let component: EmployeeWorkWeekPage;
  let fixture: ComponentFixture<EmployeeWorkWeekPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EmployeeWorkWeekPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
