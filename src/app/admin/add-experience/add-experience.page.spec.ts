import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddExperiencePage } from './add-experience.page';

describe('AddExperiencePage', () => {
  let component: AddExperiencePage;
  let fixture: ComponentFixture<AddExperiencePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddExperiencePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
