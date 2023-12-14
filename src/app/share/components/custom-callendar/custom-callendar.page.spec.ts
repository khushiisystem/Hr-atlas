import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CustomCallendarPage } from './custom-callendar.page';

describe('CustomCallendarPage', () => {
  let component: CustomCallendarPage;
  let fixture: ComponentFixture<CustomCallendarPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CustomCallendarPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
