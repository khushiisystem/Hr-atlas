import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { FileSaverService } from 'ngx-filesaver';
import { IPayslipResponse } from 'src/app/interfaces/response/payslipResponse';
import { IEmpSelect } from 'src/app/share/employees/employees.page';

@Component({
  selector: 'app-employee-payslip',
  templateUrl: './employee-payslip.page.html',
  styleUrls: ['./employee-payslip.page.scss'],
})
export class EmployeePayslipPage implements OnInit {
  @Input() employee!: IEmpSelect;
  @Input() payslipData!: IPayslipResponse;
  employeeId: string = '';

  constructor(
    private fileSaverService: FileSaverService
  ) { }

  ngOnInit() {
    console.log(this.payslipData, 'payslip');
  }

  getPayslipDate() {
    const dateStr = this.payslipData.payslipDate;
    return dateStr ? new Date(dateStr) : new Date();
  }
  getMonth(){
    const monthArry = moment.months();
    return monthArry[this.getPayslipDate().getMonth()];
  }

  downloadReceipt() {
    // Generate the receipt content
    const receiptContent = `Spundan Consultancy & IT Solutions Pvt Ltd\n3rd Floor, 315.Sai, Ram Plaza, 63 Mangal Nagar Road, Vishru Pari Colony Indor, Madhya Pradesh-152001\nMonth: ${ this.getMonth() } ${ this.getPayslipDate().getFullYear() }\nWorking Days: ${this.payslipData.workingDays}\nLOP: ${this.payslipData.lop || 0}\nLeaves Credited: ${this.payslipData.leavesCarryForward || 0}\nSalary: ${this.payslipData.netPay}`;

  
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });

    // Save the Blob as a file using FileSaver.js
    this.fileSaverService.save(blob, 'salary_receipt.txt');
  }
}
