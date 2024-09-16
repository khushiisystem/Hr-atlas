import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminTimesheetsPage } from './admin-timesheets.page';

describe('AdminTimesheetsPage', () => {
  let component: AdminTimesheetsPage;
  let fixture: ComponentFixture<AdminTimesheetsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AdminTimesheetsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
