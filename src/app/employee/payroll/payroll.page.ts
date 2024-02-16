import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import * as moment from "moment";
import { FileSaverService } from "ngx-filesaver";
import { ICreditLogsResponse } from "src/app/interfaces/request/IPayrollSetup";
import { ISalarySetupResponse } from "src/app/interfaces/response/ISalaryResponse";
import { IPayslipResponse } from "src/app/interfaces/response/payslipResponse";
import { AdminService } from "src/app/services/admin.service";
import { LoaderService } from "src/app/services/loader.service";
import { ShareService } from "src/app/services/share.service";
@Component({
  selector: "app-payroll",
  templateUrl: "./payroll.page.html",
  styleUrls: ["./payroll.page.scss"],
})
export class PayrollPage implements OnInit {
  selectedYear!: string;
  selectedMonth!: string;
  selectedMonthName!: string;
  workingDays!: number;
  salary: number | undefined;
  salaryReceipt: boolean = false;
  advanceLoaded: boolean = false;
  advanceLogs: ICreditLogsResponse[] = [];
  dateModal: boolean = false;
  payslipDate: Date = new Date();
  today: Date = new Date();
  activeTab: string = "payslip";
  employeeId: string = "";
  payslipData!: IPayslipResponse;
  salaryStructure!: ISalarySetupResponse;
  payslipLoaded = false;
  structureLoaded = false;

  constructor(
    private router: Router,
    private activeRoute: ActivatedRoute,
    private fileSaverService: FileSaverService,
    private adminServ: AdminService,
    private shareServ: ShareService,
    private loader: LoaderService
  ) {}

  ngOnInit() {
    this.employeeId = this.activeRoute.snapshot.params?.["id"];
    // this.today.setFullYear(this.today.getFullYear(), this.today.getMonth() - 1, this.today.getDate());
    this.payslipDate = this.today;
    if (this.employeeId.trim() !== "") {
      this.getPaySlip();
      this.getSalaryStructure();
      this.getLogHistory();
    }
    if (this.payslipDate) {
      const selectedYear = new Date(this.payslipDate).getFullYear();
      const selectedMonth = new Date(this.payslipDate).getMonth();
      this.calculateSalary(selectedYear, selectedMonth);
    }
  }

  getPaySlip() {
    this.payslipLoaded = false;
    this.loader.present('');
    this.adminServ.getEmployeePayslip({employeeId: this.employeeId, date: moment(this.payslipDate).utc().format()}).subscribe(res => {
      if(res != null){
        this.payslipData = res;
      } else {
        this.payslipData = null as any;
      }
      this.payslipLoaded = true;
      this.loader.dismiss();
    }, (error) => {
      this.payslipData = null as any;
      this.payslipLoaded = true;
      this.shareServ.presentToast(error.error, 'top', 'danger');
      this.loader.dismiss();
    });
  }

  getSalaryStructure() {
    this.structureLoaded = false;
    this.adminServ.getEmloyeePayStructure(this.employeeId, moment(this.payslipDate).utc().format()).subscribe(res => {
      if(res != null) {
        this.salaryStructure = res;
      }
      this.structureLoaded = true;
      this.loader.dismiss();
    }, (error) => {
      this.structureLoaded = true;
      this.loader.dismiss();
    });
  }

  goBack() {
    history.back();
  }

  calculateSalary(selectedYear: number, selectedMonth: number) {
    const daysInMonth = new Date(
      Number(selectedYear),
      Number(selectedMonth),
      0
    ).getDate();

    let workingDays = 0;
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(
        Number(selectedYear),
        Number(selectedMonth) - 1,
        i
      );
      if (currentDate.getDay() !== 0) {
        workingDays++;
      }
    }

    // Calculate the salary
    const salary = workingDays * 1000;

    this.selectedMonthName = this.getMonthName(Number(selectedMonth));
    this.workingDays = workingDays;
    this.salary = salary;
    this.salaryReceipt = true;
  }

  selectPayslipDate(event: any) {
    if (event.detail.value) {
      const selectedYear = new Date(this.payslipDate).getFullYear();
      const selectedMonth = new Date(this.payslipDate).getMonth();
      this.calculateSalary(selectedYear, selectedMonth);
      this.getPaySlip();
      this.getSalaryStructure();
    }
  }

  getLogHistory(){
    this.advanceLoaded = false;
    this.adminServ.getLogHistoryByEmployeeId(this.employeeId).subscribe(res => {
      if(res){
        this.advanceLogs = res.sort((item1, item2) => moment(item1.payslipDate).diff(moment(item2.payslipDate)));
        this.advanceLoaded = true;
      }
    }, (error) => {
      this.advanceLoaded = true;
    });
  }

  downloadReceipt() {
    // Generate the receipt content
    const receiptContent = `Spundan Consultancy & IT Solutions Pvt Ltd\n3rd Floor, 315.Sai, Ram Plaza, 63 Mangal Nagar Road, Vishru Pari Colony Indor, Madhya Pradesh-152001\nMonth: ${
      this.selectedMonthName
    } ${this.payslipDate.getFullYear()}\nWorking Days: ${
      this.workingDays
    }\nLOP: 0\nLeaves Credited: 1.5\nSalary: ${this.salary}`;

    const blob = new Blob([receiptContent], {
      type: "text/plain;charset=utf-8",
    });

    // Save the Blob as a file using FileSaver.js
    this.fileSaverService.save(blob, "salary_receipt.txt");
  }

  getMonthName(month: number): string {
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return monthNames[month - 1];
  }
}
