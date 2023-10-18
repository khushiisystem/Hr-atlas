import { Component, Input, OnInit } from "@angular/core";
import { Platform } from "@ionic/angular";
import * as moment from "moment";
import { FileSaverService } from "ngx-filesaver";
import { IPayslipResponse } from "src/app/interfaces/response/payslipResponse";
import { LoaderService } from "src/app/services/loader.service";
import { ShareService } from "src/app/services/share.service";
import { IEmpSelect } from "src/app/share/employees/employees.page";
import { environment } from "src/environments/environment";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
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

  constructor(
    private fileSaverService: FileSaverService,
    private shareServ: ShareService,
    private loader: LoaderService,
    private platform: Platform,
    private fileOpener: FileOpener
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

  // downloadReceipt() {
  //   const userId = this.employee ? this.employee.guid : this.payslipData.employeeId;
  //   if (userId) {
  //     this.loader.present("");
  //     this.shareServ.downloadPayslip(userId, this.payslipData.payslipDate).subscribe((res) => {
  //           console.log(res, "res");
  //           this.loader.dismiss();
  //         },
  //         (error) => {
  //           this.shareServ.presentToast(
  //             error.error || "Something is wrong.",
  //             "top",
  //             "danger"
  //           );
  //           console.log(error, "error");
  //           this.loader.dismiss();
  //         }
  //       );
  //   }
  // Generate the receipt content
  // const receiptContent = `Spundan Consultancy & IT Solutions Pvt Ltd\n3rd Floor, 315.Sai, Ram Plaza, 63 Mangal Nagar Road, Vishru Pari Colony Indor, Madhya Pradesh-152001\nMonth: ${ this.getMonth() } ${ this.getPayslipDate().getFullYear() }\nWorking Days: ${this.payslipData.workingDays}\nLOP: ${this.payslipData.lop || 0}\nLeaves Credited: ${this.payslipData.leavesCarryForward || 0}\nSalary: ${this.payslipData.netPay}`;

  // const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });

  // Save the Blob as a file using FileSaver.js
  // this.fileSaverService.save(blob, 'salary_receipt.txt');
  // }

  downloadReceipt(): void {
    const mime = require("mime");
    const userId = this.employee ? this.employee.guid : this.payslipData.employeeId;
    const fileName = Math.random().toString().substring(2);
    if (this.isCordova) {
      this.shareServ.downloadPayslip(userId, this.payslipData.payslipDate).subscribe((res: any) => {
        this.shareServ.exportFile(res, this.payslipData.guid.substr(10));
      });
    } else {
      var url = encodeURI( environment.Api + `api/paySlip/generatepdf?employeeId=${userId}&date=${this.payslipData.payslipDate}`);

      const downloadoption = {
        path: `Download/HrAtlas/payslip_${fileName}.pdf`,
        directory: Directory.ExternalStorage,
        url: url,
      };

      Filesystem.downloadFile(downloadoption).then((result) => {
          console.log(result, "result");
          this.shareServ.presentToast("PaySlip Download in to Download Folder", "top", "success");
          this.fileOpener
            .showOpenWithDialog(
              Directory.ExternalStorage + `Download/HrAtlas/payslip_${fileName}.pdf`,
              mime.getType(this.payslipData.guid + ".pdf")
            )
            .then(() => {
              console.log("File is opened");
            })
            .catch((e) => {
              console.log("Error opening file", e);
            });
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }
}
