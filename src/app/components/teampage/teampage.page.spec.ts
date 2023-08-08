import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TeampagePage } from './teampage.page';

describe('TeampagePage', () => {
  let component: TeampagePage;
  let fixture: ComponentFixture<TeampagePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(TeampagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
