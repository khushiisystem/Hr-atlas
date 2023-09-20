import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HollydaySetupPage } from './hollyday-setup.page';

describe('HollydaySetupPage', () => {
  let component: HollydaySetupPage;
  let fixture: ComponentFixture<HollydaySetupPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(HollydaySetupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
