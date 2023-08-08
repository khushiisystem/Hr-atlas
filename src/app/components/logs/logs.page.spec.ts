import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LOGSPage } from './logs.page';

describe('LOGSPage', () => {
  let component: LOGSPage;
  let fixture: ComponentFixture<LOGSPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(LOGSPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
