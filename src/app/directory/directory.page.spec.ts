import { ComponentFixture, TestBed, async } from '@angular/core/testing';
import { DirectoryPage } from './directory.page';

describe('DirectoryPage', () => {
  let component: DirectoryPage;
  let fixture: ComponentFixture<DirectoryPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DirectoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
