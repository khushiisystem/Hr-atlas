import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FileSaverService } from 'ngx-filesaver';
@Component({
  selector: 'app-payroll',
  templateUrl: './payroll.page.html',
  styleUrls: ['./payroll.page.scss'],
})
export class PayrollPage implements OnInit {
  selectedYear!: string;
  selectedMonth!: string;
  selectedMonthName!: string;
  workingDays!: number;
  salary: number | undefined;
  salaryReceipt: boolean = false;

  constructor(private router: Router,private fileSaverService: FileSaverService) { }

  ngOnInit() {
  }

  goBackpage() {
    this.router.navigate(['./home']);
  }
  calculateSalary() {

    const daysInMonth = new Date(
      Number(this.selectedYear),
      Number(this.selectedMonth),
      0
    ).getDate();

    let workingDays = 0;
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(
        Number(this.selectedYear),
        Number(this.selectedMonth) - 1,
        i
      );
      if (currentDate.getDay() !== 0) {
        workingDays++;
      }
    }

    // Calculate the salary
    const salary = workingDays * 1000;

   
    this.selectedMonthName = this.getMonthName(Number(this.selectedMonth));
    this.workingDays = workingDays;
    this.salary = salary;
    this.salaryReceipt = true;
  }

  downloadReceipt() {
    // Generate the receipt content
    const receiptContent = `Spundan Consultancy & IT Solutions Pvt Ltd\n3rd Floor, 315.Sai, Ram Plaza, 63 Mangal Nagar Road, Vishru Pari Colony Indor, Madhya Pradesh-152001\nMonth: ${this.selectedMonthName} ${this.selectedYear}\nWorking Days: ${this.workingDays}\nSalary: ${this.salary}`;

  
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });

    // Save the Blob as a file using FileSaver.js
    this.fileSaverService.save(blob, 'salary_receipt.txt');
  }

  getMonthName(month: number): string {
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return monthNames[month - 1];
  }
}