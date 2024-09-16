import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SubCategoryFormPage } from './sub-category-form.page';

describe('SubCategoryFormPage', () => {
  let component: SubCategoryFormPage;
  let fixture: ComponentFixture<SubCategoryFormPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SubCategoryFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
