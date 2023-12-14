import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttendaceUpdatePage } from './attendace-update.page';

describe('AttendaceUpdatePage', () => {
  let component: AttendaceUpdatePage;
  let fixture: ComponentFixture<AttendaceUpdatePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AttendaceUpdatePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
