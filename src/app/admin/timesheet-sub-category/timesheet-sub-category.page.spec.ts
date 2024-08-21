import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimesheetSubCategoryPage } from './timesheet-sub-category.page';

describe('TimesheetSubCategoryPage', () => {
  let component: TimesheetSubCategoryPage;
  let fixture: ComponentFixture<TimesheetSubCategoryPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TimesheetSubCategoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
