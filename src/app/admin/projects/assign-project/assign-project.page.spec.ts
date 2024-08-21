import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignProjectPage } from './assign-project.page';

describe('AssignProjectPage', () => {
  let component: AssignProjectPage;
  let fixture: ComponentFixture<AssignProjectPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AssignProjectPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
