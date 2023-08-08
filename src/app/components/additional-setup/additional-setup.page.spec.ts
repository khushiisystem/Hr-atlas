import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdditionalSetupPage } from './additional-setup.page';

describe('AdditionalSetupPage', () => {
  let component: AdditionalSetupPage;
  let fixture: ComponentFixture<AdditionalSetupPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AdditionalSetupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
