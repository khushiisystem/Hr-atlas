import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimesheetCategoryPage } from './timesheet-category.page';

describe('TimesheetCategoryPage', () => {
  let component: TimesheetCategoryPage;
  let fixture: ComponentFixture<TimesheetCategoryPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TimesheetCategoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
