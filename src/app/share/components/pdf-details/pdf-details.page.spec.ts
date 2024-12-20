import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PdfDetailsPage } from './pdf-details.page';

describe('PdfDetailsPage', () => {
  let component: PdfDetailsPage;
  let fixture: ComponentFixture<PdfDetailsPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PdfDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
