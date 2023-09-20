import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewCalendarPage } from './view-calendar.page';

describe('ViewCalendarPage', () => {
  let component: ViewCalendarPage;
  let fixture: ComponentFixture<ViewCalendarPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ViewCalendarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
