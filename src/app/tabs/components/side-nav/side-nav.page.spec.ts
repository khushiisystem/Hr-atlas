import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SideNavPage } from './side-nav.page';

describe('SideNavPage', () => {
  let component: SideNavPage;
  let fixture: ComponentFixture<SideNavPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(SideNavPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
