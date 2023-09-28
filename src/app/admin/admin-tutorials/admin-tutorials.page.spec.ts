import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminTutorialsPage } from './admin-tutorials.page';

describe('AdminTutorialsPage', () => {
  let component: AdminTutorialsPage;
  let fixture: ComponentFixture<AdminTutorialsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(AdminTutorialsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
