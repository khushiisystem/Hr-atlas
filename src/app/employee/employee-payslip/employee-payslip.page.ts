import { Component, Input, OnInit } from "@angular/core";
import { Platform } from "@ionic/angular";
import * as moment from "moment";
import { IPayslipResponse } from "src/app/interfaces/response/payslipResponse";
import { ShareService } from "src/app/services/share.service";
import { IEmpSelect } from "src/app/share/employees/employees.page";
import { environment } from "src/environments/environment";
import { Filesystem, Directory } from "@capacitor/filesystem";
import { FileOpener } from "@ionic-native/file-opener/ngx";
declare var require: any;

@Component({
  selector: "app-employee-payslip",
  templateUrl: "./employee-payslip.page.html",
  styleUrls: ["./employee-payslip.page.scss"],
})
export class EmployeePayslipPage implements OnInit {
  @Input() employee!: IEmpSelect;
  @Input() payslipData!: IPayslipResponse;
  employeeId: string = "";
  isCordova: boolean = true;
  downloading!: boolean;

  constructor(
    private shareServ: ShareService,
    private platform: Platform,
    private fileOpener: FileOpener,
  ) {
    this.isCordova = this.platform.is("mobileweb");
  }

  ngOnInit() {
    console.log(this.payslipData, "payslip");
  }

  getPayslipDate() {
    const dateStr = this.payslipData.payslipDate;
    return dateStr ? new Date(dateStr) : new Date();
  }
  getMonth() {
    const monthArry = moment.months();
    return monthArry[this.getPayslipDate().getMonth()];
  }

  downloadReceipt(): void {
    this.downloading = true;
    const mime = require('mime');
    const userId = this.employee ? this.employee.guid : this.payslipData.employeeId;
    const fileName = `PaySlip_` + moment.months()[new Date(this.payslipData.payslipDate).getMonth()] + `_` + new Date(this.payslipData.payslipDate).getFullYear();
    if (this.isCordova) {
      this.shareServ.downloadPayslip(userId, this.payslipData.payslipDate).subscribe((res: any) => {
        this.shareServ.exportFile(res, fileName);
      });
    } else {
      var url = encodeURI(environment.Api + `api/paySlip/generatepdf?employeeId=${userId}&date=${this.payslipData.payslipDate}`);

      const downloadoption = {
        path: `HrAtlas/${fileName}.pdf`,
        directory: Directory.Documents,
        url: url,
        recursive: true
      };

      Filesystem.downloadFile(downloadoption).then((result: any) => {
        this.shareServ.presentToast("PaySlip Download in to Document Folder", "top", "success");
        this.fileOpener
        .showOpenWithDialog(
          result.path,
          mime.getType(`${fileName}.pdf`)
          )
          .then(() => {
            this.downloading = false;
            console.log("File is opened");
          })
          .catch((e) => {
            console.log("Error opening file", e);
          });
      })
        .catch((error) => {
          const MkdirOptions = {
            path: `HrAtlas`,
            directory: Directory.Documents,
            recursive: true
          };

          Filesystem.mkdir(MkdirOptions).then(async (result: any) => {
            this.downloadReceipt();
          })
          console.log(error, "Error");
        });
    }
  }
}
