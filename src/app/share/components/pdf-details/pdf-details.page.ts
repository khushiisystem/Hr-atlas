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
    alert('Data has been sent!');
    // this.getPaySlip();
  }

}
