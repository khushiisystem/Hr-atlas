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
    const userId = this.employee ? this.employee.guid : this.payslipData.employeeId;
    if(userId.trim() != ""){}
  }

  getPayslipDate() {
    const dateStr = this.payslipData.payslipDate;
    return dateStr ? new Date(dateStr) : new Date();
  }
  get getStartDate() {
    return moment(this.payslipData.payslipDate).startOf("date").format();
  }
  get getendDate() {
    return moment(this.payslipData.payslipDate).endOf("date").add(this.payslipData.workingDays - 1, 'days').format();
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
      this.shareServ.downloadPayslip(userId, moment(this.payslipData.payslipDate).utc().format()).subscribe((res: any) => {
        this.shareServ.exportFile(res, fileName);
        this.downloading = false;
      }, (error) => {
        this.downloading = false;
      });
    } else {
      var url = encodeURI(environment.Api + `api/paySlip/generatepdf?employeeId=${userId}&payslipDate=${this.payslipData.payslipDate}`);

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
            // console.log("File is opened");
          })
          .catch((e) => {
            console.log("Error opening file", e);
            this.downloading = true;
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
          this.downloading = true;
        });
    }
  }
}
