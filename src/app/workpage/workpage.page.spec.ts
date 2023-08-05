import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkpagePage } from './workpage.page';

describe('WorkpagePage', () => {
  let component: WorkpagePage;
  let fixture: ComponentFixture<WorkpagePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(WorkpagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
