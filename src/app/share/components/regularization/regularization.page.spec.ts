import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegularizationPage } from './regularization.page';

describe('RegularizationPage', () => {
  let component: RegularizationPage;
  let fixture: ComponentFixture<RegularizationPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(RegularizationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
