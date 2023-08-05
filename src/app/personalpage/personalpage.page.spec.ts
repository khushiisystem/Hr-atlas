import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { PersonalpagePage } from './personalpage.page';

describe('PersonalpagePage', () => {
  let component: PersonalpagePage;
  let fixture: ComponentFixture<PersonalpagePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PersonalpagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
