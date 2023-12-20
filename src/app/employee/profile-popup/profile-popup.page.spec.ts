import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfilePopupPage } from './profile-popup.page';

describe('ProfilePopupPage', () => {
  let component: ProfilePopupPage;
  let fixture: ComponentFixture<ProfilePopupPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ProfilePopupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
