import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BiopagePage } from './biopage.page';

describe('BiopagePage', () => {
  let component: BiopagePage;
  let fixture: ComponentFixture<BiopagePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(BiopagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
