import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import * as moment from "moment";
import { IPayslipResponse } from "src/app/interfaces/response/payslipResponse";
import { AdminService } from "src/app/services/admin.service";
import { LoaderService } from "src/app/services/loader.service";
import { ShareService } from "src/app/services/share.service";

@Component({
  selector: "app-pdf-details",
  templateUrl: "./pdf-details.page.html",
  styleUrls: ["./pdf-details.page.scss"],
})
export class PdfDetailsPage implements OnInit {
  isDataLoaded: boolean = true;
  selectAll: boolean = false;
  payslipData: IPayslipResponse[] = [];
  payslipLoaded = false;
  payslipDate: Date = new Date();
  today: Date = new Date();
  openCalendar: boolean = false;
  emailData: any[] = [];

  constructor(
    private adminServ: AdminService,
    private loader: LoaderService,
    private shareServ: ShareService,
    private route: ActivatedRoute
  ) {
    this.payslipDate = new Date(
      this.route.snapshot.queryParams["date"] ?? new Date()
    );
  }

  ngOnInit() {
    this.getPaySlip();
  }

  selectPayslipDate(event: any) {
    if (event.detail.value) {
      this.payslipDate = new Date(event.detail.value);
      this.getPaySlip();
    }
  }

  getPaySlip() {
    this.loader.present("");
    this.adminServ
      .getPaySlipData(moment.utc(this.payslipDate).format())
      .subscribe(
        (res: any) => {
          if (res && res.length > 0) {
            this.payslipData = res;
            this.emailData = [];
            this.payslipData.forEach((pd) => {
              this.emailData.push({
                employeeId: pd.employeeId,
                payslipDate: pd.payslipDate,
                employeeName: pd.employeeName,
                netPay: pd.netPay,
                checked: false,
              });
            });
          } else {
            this.payslipData = [];
            this.emailData = [];
          }
          this.loader.dismiss();
        },
        (error) => {
          this.payslipData = [];
          this.emailData = [];
          this.shareServ.presentToast(error.error, "top", "danger");
          this.loader.dismiss();
        }
      );
  }

  sendData() {
    if (!this.payslipData || this.payslipData.length === 0) {
      this.shareServ.presentToast("No payslip data found.", "top", "warning");
      return;
    }

    let sendEmailData: any[] = [];
    this.emailData.forEach((pd) => {
      if (pd.checked) {
        sendEmailData.push({
          e_id: pd.employeeId,
          payslipDate: pd.payslipDate,
        });
      }
    });

    this.loader.present("");
    this.adminServ.sendPayrollEmail(sendEmailData).subscribe(
      (res: any) => {
        console.log("send payslip email res :", res);
        this.loader.dismiss();
        this.shareServ.presentToast(res.message, "top", "success");
      },
      (error) => {
        const errorMsg = error?.error || "Failed to send payroll emails";
        this.shareServ.presentToast(errorMsg, "top", "danger");
        this.loader.dismiss();
      }
    );
  }

  selectAllPayslip(event: any) {
    const checked = event.target.checked;
    this.emailData.forEach((pd) => (pd.checked = checked));
  }

  onItemChange(changedPayslip: any, selectAllRef: HTMLInputElement) {
    const allSelected = this.emailData.every((p) => p.checked);
    const anyUnselected = this.emailData.some((p) => !p.checked);

    if (allSelected) {
      selectAllRef.checked = true; // All selected → check "Select All"
    }

    if (anyUnselected) {
      selectAllRef.checked = false; // Any unchecked → uncheck "Select All"
    }
  }
}
