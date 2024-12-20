import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { IPayslipResponse } from 'src/app/interfaces/response/payslipResponse';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-pdf-details',
  templateUrl: './pdf-details.page.html',
  styleUrls: ['./pdf-details.page.scss'],
})
export class PdfDetailsPage implements OnInit {

  isDataLoaded: boolean = true;
  selectAll: boolean = false;
  payslipData: IPayslipResponse[] = []
  payslipLoaded = false;
  payslipDate: Date = new Date();
  today: Date = new Date();
  openCalendar: boolean = false;
  
  constructor( 
    private adminServ: AdminService,
    private loader: LoaderService,
    private shareServ: ShareService,
   ) { }

  ngOnInit() {
    // this.payslipDate = this.today;
      this.getPaySlip();
  }

  selectPayslipDate(event: any){
    if(event.detail.value){
      this.payslipDate = new Date(event.detail.value);
      this.getPaySlip();
    }
  }

  // employees = [
  //   { name: 'abc', payment: 2000, checked: false },
  //   { name: 'xyz', payment: 3000, checked: false },
  //   { name: 'lmn', payment: 4000, checked: false },
  // ];

  // toggleSelectAll() {
  //   this.employees.forEach((employee) => {
  //     employee.checked = this.selectAll;
  //   });
  // }

  // checkSelectAllStatus() {
  //   this.selectAll = this.employees.every((employee) => employee.checked);
  // }

  // moment.utc(this.payslipDate).format()

  // getPaySlip() {
  //   this.loader.present('');
  //   // this.adminServ.getPaySlipData(moment(this.payslipDate).utc().format()).subscribe(res => {
  //     this.adminServ.getPaySlipData(moment.utc(this.payslipDate).format()).subscribe(res => {
  //     if(res != null){
  //       this.payslipData = res;
  //       console.log("getPaySlipData: ", res);
  //     } else {
  //       this.payslipData = null as any;
  //     }
  //     this.loader.dismiss();
  //   }, (error) => {
  //     this.payslipData = null as any;
  //     this.shareServ.presentToast(error.error, 'top', 'danger');
  //     this.loader.dismiss();
  //   });
  // }

  getPaySlip() {
    this.loader.present('');
    this.adminServ.getPaySlipData(moment.utc(this.payslipDate).format()).subscribe((res: any) => {
      if (res && res.length > 0) {
        this.payslipData = res;
      } else {
        this.payslipData = [];
      }
      this.loader.dismiss();
    }, (error) => {
      this.payslipData = [];
      this.shareServ.presentToast(error.error, 'top', 'danger');
      this.loader.dismiss();
    });
  }

  sendData() {
    console.log('Data sent:', this.payslipData);
    alert('Data has been sent!');
    // this.getPaySlip();
  }

}
