import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NameImgPage } from './name-img.page';

describe('NameImgPage', () => {
  let component: NameImgPage;
  let fixture: ComponentFixture<NameImgPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(NameImgPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
