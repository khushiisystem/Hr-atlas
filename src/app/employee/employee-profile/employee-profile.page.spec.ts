import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeProfilePage } from './employee-profile.page';

describe('EmployeeProfilePage', () => {
  let component: EmployeeProfilePage;
  let fixture: ComponentFixture<EmployeeProfilePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EmployeeProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
