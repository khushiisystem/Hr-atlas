import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { AddempPage } from './addemp.page';

describe('AddempPage', () => {
  let component: AddempPage;
  let fixture: ComponentFixture<AddempPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AddempPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
