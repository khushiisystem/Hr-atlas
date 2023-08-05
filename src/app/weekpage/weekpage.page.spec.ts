import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WeekpagePage } from './weekpage.page';

describe('WeekpagePage', () => {
  let component: WeekpagePage;
  let fixture: ComponentFixture<WeekpagePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(WeekpagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
