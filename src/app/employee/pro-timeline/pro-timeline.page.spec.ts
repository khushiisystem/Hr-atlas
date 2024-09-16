import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProTimelinePage } from './pro-timeline.page';

describe('ProTimelinePage', () => {
  let component: ProTimelinePage;
  let fixture: ComponentFixture<ProTimelinePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ProTimelinePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
