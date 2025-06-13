import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { Platform } from "@ionic/angular";
import { IEmpSelect } from "src/app/share/employees/employees.page";

@Component({
  selector: "app-payroll-setup",
  templateUrl: "./payroll-setup.page.html",
  styleUrls: ["./payroll-setup.page.scss"],
})
export class PayrollSetupPage implements OnInit, OnDestroy {
  employeeId: string = "";
  employee!: IEmpSelect;
  payslipDate: Date = new Date();

  constructor(private platform: Platform, private router: Router) {
    this.backButtonEvent();
  }

  onPayslipDateChange(date: Date) {
  this.payslipDate = date;
}

  ngOnInit() {}
  ngOnDestroy(): void {
    this.reseteEmployee();
  }
  ionViewDidLeave() {
    this.reseteEmployee();
  }

  selectEmploye(event: IEmpSelect) {
    this.employee = event;  
    this.employeeId = event.guid;
  }

  reseteEmployee() {
    this.employee = null as any;
    this.employeeId = "";
  }

  formSubmited(event: "confirm" | "cancel") {
    if (event === "confirm") {
      this.employee = null as any;
      this.employeeId = "";
    }
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }

  goBack() {
    // history.back();
    this.router.navigateByUrl("/tabs/home");
  }

  backButtonEvent() {
    this.platform.backButton.subscribeWithPriority(100, async () => {
      if (this.employee) {
        this.reseteEmployee();
      } else {
        history.back();
      }
    });
  }
}
