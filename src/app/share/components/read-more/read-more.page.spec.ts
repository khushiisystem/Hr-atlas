import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReadMorePage } from './read-more.page';

describe('ReadMorePage', () => {
  let component: ReadMorePage;
  let fixture: ComponentFixture<ReadMorePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ReadMorePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
