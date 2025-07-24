import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DownloadPayslipPage } from './download-payslip.page';

describe('DownloadPayslipPage', () => {
  let component: DownloadPayslipPage;
  let fixture: ComponentFixture<DownloadPayslipPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(DownloadPayslipPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
