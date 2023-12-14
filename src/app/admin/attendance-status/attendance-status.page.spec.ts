import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttendanceStatusPage } from './attendance-status.page';

describe('AttendanceStatusPage', () => {
  let component: AttendanceStatusPage;
  let fixture: ComponentFixture<AttendanceStatusPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AttendanceStatusPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
