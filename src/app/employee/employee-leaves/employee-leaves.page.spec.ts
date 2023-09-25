import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeeLeavesPage } from './employee-leaves.page';

describe('EmployeeLeavesPage', () => {
  let component: EmployeeLeavesPage;
  let fixture: ComponentFixture<EmployeeLeavesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(EmployeeLeavesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
