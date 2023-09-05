import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminLeavesPage } from './admin-leaves.page';

describe('AdminLeavesPage', () => {
  let component: AdminLeavesPage;
  let fixture: ComponentFixture<AdminLeavesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AdminLeavesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
