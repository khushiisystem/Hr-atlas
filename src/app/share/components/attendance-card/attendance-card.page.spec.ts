import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttendanceCardPage } from './attendance-card.page';

describe('AttendanceCardPage', () => {
  let component: AttendanceCardPage;
  let fixture: ComponentFixture<AttendanceCardPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AttendanceCardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
