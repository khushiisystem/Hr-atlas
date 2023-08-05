import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { LeaveadminPage } from './leaveadmin.page';

describe('LeaveadminPage', () => {
  let component: LeaveadminPage;
  let fixture: ComponentFixture<LeaveadminPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LeaveadminPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
