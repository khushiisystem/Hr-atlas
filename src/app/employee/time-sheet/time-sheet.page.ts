import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {
  DatetimeCustomEvent,
  IonContent,
  ModalController,
} from "@ionic/angular";
import * as moment from "moment";
import { IAssignPro } from "src/app/admin/projects/assign-project/assign-project.page";
import { IProject } from "src/app/admin/projects/projects.page";
import { ICategory } from "src/app/admin/timesheet-category/timesheet-category.page";
import { ISubCategory } from "src/app/admin/timesheet-sub-category/timesheet-sub-category.page";
import { ApproveTimesheetReq } from "src/app/interfaces/request/ITimesheet";
import { IEmployeeResponse } from "src/app/interfaces/response/IEmployee";
import { AdminService } from "src/app/services/admin.service";
import { RoleStateService } from "src/app/services/roleState.service";
import { ShareService } from "src/app/services/share.service";
import { TimeSheetService } from "src/app/services/time-sheet.service";

import { Platform } from '@ionic/angular';
import { Filesystem, Directory } from "@capacitor/filesystem";
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { environment } from "src/environments/environment";
import * as mime from 'mime';

export enum ETimesheet {
  PENDING = "Pending",
  REJECT = "Reject",
  ACCEPT = "Accept",
}

export interface ITimesheet {
  date: string;
  startTime: string;
  endTime: string;
  tag?: string;
  description: string;
  guid: string;
  status: ETimesheet;
  totalTime: number;
  adminId: string;
  subCategoryId: string;
  project: {
    title: string;
  };
  timesheetCategory: {
    category: string;
  };
  user: {
    firstName: string;
    lastName: string;
  };
}
@Component({
  selector: "app-time-sheet",
  templateUrl: "./time-sheet.page.html",
  styleUrls: ["./time-sheet.page.scss"],
})
export class TimeSheetPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;
  isDataLoaded: boolean = true;
  openCalendar: boolean = false;
  timeSheetForm!: FormGroup;
  today: Date = new Date(new Date().toDateString() + " " + "5:00 AM");
  attendanceDate: any;
  dates: (moment.Moment | string | null)[][] = [];
  currentMonth: number = moment().month();
  currentYear: number = moment().year();
  projects: IProject[] = [];
  defaultProject: IProject[] = [];
  categories: ICategory[] = [];
  // subCategories: ISubCategory[] = [];
  subCategories: string[] = [];
  pageIndex: number = 0;
  minDate: Date = new Date();
  maxDate: Date = new Date();
  minEndDate: any;
  startDate!: string;
  timesheetList: ITimesheet[] = [];
  userTimesheet: ITimesheet[] = [];
  timesheetOfTheDay: ITimesheet[] = [];
  timesheetOfTheMonth: ITimesheet[] = [];
  allTimeSheetOfMonth: ITimesheet[] = [];
  filteredAllTimeSheetOfMonth: ITimesheet[] = [];
  projectList: string[] = ["All"];
  selectedProject: string = "All";
  timeSheet!: ITimesheet | any;
  timesheetId: string = "";
  update: boolean = false;
  hours: number = 0;
  minutes: number = 0;
  dayHours: number = 0;
  dayMinutes: number = 0;
  getTime: number = 0;
  getMonth: number = 0;
  timesheetDate: string = new Date().toISOString();
  todayTimesheetDuration: number = 0;
  totalMontTime: number = 0;
  totalDayTime: number = 0;
  // isAdmin: boolean = false;
  userRole: string = "";
  isLoggedIn: boolean = false;
  allEmployeeList: IEmployeeResponse[] = [];
  assProjects: IAssignPro[] = [];
  highlightedDates: Array<{
    date: string;
    textColor: string;
    backgroundColor: string;
  }> = [];
  date = new Date();
  formattedDate = this.date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  userId: string = "";
  formDate: string = "";
  timesheetTimeError: string = "";
  page: number = 1;
  pageSize: number = 10;
  selectedEntry: any = null;
  expandedRowIndex: number | null = null;
  dateModal: boolean = false;

   downloading!: boolean;
   isCordova: boolean = true;

  constructor(
    private _fb: FormBuilder,
    private adminSer: AdminService,
    private timesheetSer: TimeSheetService,
    private modelCtrl: ModalController,
    private roleStateServ: RoleStateService,
    private cdr: ChangeDetectorRef,
    private shareServ: ShareService,
     private platform: Platform,
        private fileOpener: FileOpener,
  ) {
     this.isCordova = this.platform.is("mobileweb");
    this.userId = localStorage.getItem("userId") || "";
    this.roleStateServ.getState().subscribe((res) => {
      if (res) {
        this.userRole = res;
      } else {
        this.userRole = localStorage.getItem("userRole") || "";
      }
    });
    // this.isLoggedIn = localStorage.getItem('token') != null && localStorage.getItem('token')?.toString().trim() != "";
    // this.activeTab = this.leaveType ? this.leaveType : 'requests'
  }

  ngOnInit() {
    this.minDate.setDate(this.minDate.getDate() + 2);
    this.maxDate = this.minDate;
    const currentTime = moment().format();

    this.timeSheetForm = this._fb.group({
      projectId: ["", Validators.required],
      categoryId: ["", Validators.required],
      subCategoryId: [""],
      // userId: '',
      description: ["", [Validators.required, Validators.minLength(5)]],
      startTime: ["", Validators.required],
      endTime: ["", [Validators.required]],
      tag: ["", [Validators.required, Validators.minLength(2)]],
      date: [new Date(), Validators.required],
    });
    this.getTimesheetList();
    this.getProjects();
    this.getCategories();
    this.getTimesheetDay();
    this.getTimesheetMonth();
    this.getAssignProjectById();
    this.getUserTimesheet();
    // this.getSubCategories();
    this.getAllTimeSheetOfTheMonth();
  }

  toggleDetailRow(index: number) {
    // If clicking on the same row, close it; otherwise, open the new row
    this.expandedRowIndex = this.expandedRowIndex === index ? null : index;
  }

  selectEntry(entry: any): void {
    this.selectedEntry = entry;
  }

  getFormGroup(ctrlName: string): FormGroup {
    return this.timeSheetForm.controls[ctrlName] as FormGroup;
  }

  getDate(ctrlName: string) {
    this.formDate = this.timeSheetForm.controls[ctrlName].value;
    return this.formDate != "" ? new Date(this.formDate).toDateString() : "";
  }

  selectDate(event: DatetimeCustomEvent) {
    this.timeSheetForm.controls["date"].patchValue(
      moment(event.detail.value).utc().format()
    );
  }

  checkTimesheetTime() {
    this.timesheetTimeError = "";

    let startTime = this.getStartTime();
    let endTime = this.getEndTime();

    if (startTime >= endTime && endTime) {
      this.timesheetTimeError = "End time must be greater than start time";
      return;
    }

    let totalTimeDuration = this.calculateDuration(
      startTime.toString(),
      endTime.toString()
    );
    // if (totalTimeDuration / 3600000 > 9) {
    //   this.timesheetTimeError = "Total time must be less than 9 hours";
    //   return;
    // }

    let totaltimeofalltimesheet = +this.calculateTotalWork().split("h")[0];
    if (totalTimeDuration / 3600000 + totaltimeofalltimesheet > 24) {
      this.timesheetTimeError =
        "Total time of all timesheet must be less than 9 hours";
      return;
    }
  }

  getStartTime() {
    const formValue = this.timeSheetForm.controls["startTime"].value;
    return formValue ? new Date(moment(formValue).format()) : "";
  }

  setStartTime(event: DatetimeCustomEvent) {
    this.timeSheetForm.patchValue({
      startTime: moment(event.detail.value).utc().format(),
    });
    this.checkTimesheetTime();
  }

  markTouched(ctrlName: string) {
    this.timeSheetForm.controls[ctrlName].markAsTouched();
  }

  getEndTime() {
    const formValue = this.timeSheetForm.controls["endTime"].value;
    return formValue ? new Date(moment(formValue).format()) : "";
  }
  setEndTime(event: DatetimeCustomEvent) {
    this.timeSheetForm.patchValue({
      endTime: moment(event.detail.value).utc().format(),
    });
    this.checkTimesheetTime();
  }

  getProjects() {
    this.timesheetSer.getAllProjects(this.pageIndex * 100, 100).subscribe(
      (res) => {
        if (res) {
          const data: IProject[] = res;
          this.projects = data;
          this.isDataLoaded = true;
          for (let pro of this.projects) {
            if (pro.isDefault) {
              this.defaultProject.push(pro);
            }
          }
        }
      },
      (error) => {
        this.isDataLoaded = true;
      }
    );
  }

  // get assign project
  // getAssignProjects() {
  //   this.timesheetSer.getAllAssignProjects(this.pageIndex * 100, 100).subscribe(res => {
  //     if(res) {
  //       const data: IAssignPro[] = res;
  //       this.assProjects = data;
  //     }
  //   })
  // }

  getAssignProjectById() {
    this.assProjects = [];
    this.timesheetSer
      .getAssignProjectById(this.userId, this.timesheetDate)
      .subscribe((res) => {
        if (res) {
          const data: IAssignPro[] = res;
          data.forEach((project) => {
            if (project.project) {
              this.assProjects.push(project);
            }
          });
        }
      });
  }

  getCategories() {
    this.timesheetSer
      .getAllCategories(this.pageIndex * 100, 100)
      .subscribe((res) => {
        if (res) {
          this.categories = res;
          this.isDataLoaded = true;
        }
      });
  }

  selectCat(event: any) {
    this.subCategories =
      this.categories.find((val) => val.guid === event.detail.value)
        ?.subCategory || [];
  }

  getSubCategories() {
    this.isDataLoaded = false;
    if (this.pageIndex < 1) {
      this.subCategories = [];
    }
    this.timesheetSer
      .getAllSubCategories(this.pageIndex * 100, 100)
      .subscribe((res) => {
        if (res) {
          this.subCategories = res;
          this.isDataLoaded = true;
        }
      });
  }

  clear() {
    this.timeSheetForm.reset();
    this.timeSheetForm.patchValue({
      date: new Date().toISOString(),
    });
    this.update = false;
  }

  submit() {
    // console.log("time sheet form : ",this.timeSheetForm.value);

    if (this.timesheetTimeError) {
      return;
    }

    if (this.update) {
      if (this.timesheetId.trim() == "") {
        return;
      }
      this.timesheetSer
        .updateTimesheet(this.timesheetId, this.timeSheetForm.value)
        .subscribe((res) => {
          if (res) {
            this.update = false;
            this.getTimesheetList();
            this.getUserTimesheet();
            this.getTimesheetDay();
            this.getTimesheetMonth();
            this.shareServ.presentToast(
              "Timesheet updated successfully",
              "top",
              "success"
            );
            this.timeSheetForm.reset();
            this.timeSheetForm.patchValue({
              date: new Date().toISOString(),
            });
          }
        });
    } else {
      this.timesheetSer.addTimesheet(this.timeSheetForm.value).subscribe(
        (res) => {
          if (res) {
            // this.isAdmin = false;
            this.getTimesheetList();
            this.getUserTimesheet();
            this.getTimesheetDay();
            this.getTimesheetMonth();
            this.shareServ.presentToast(
              "Timesheet added successfully",
              "top",
              "success"
            );
            this.timeSheetForm.reset();
            this.timeSheetForm.patchValue({
              date: new Date().toISOString(),
            });
          }
        },
        (error) => {
          this.shareServ.presentToast(error.error, "top", "danger");
        }
      );
    }
  }

  getTimesheetList() {
    this.timesheetSer
      .getTimesheetList(this.pageIndex * 100, 10, this.timesheetDate)
      .subscribe((res) => {
        if (res) {
          this.timesheetList = res;
          // this.isAdmin = true;
        }
      });
  }

  // timesheet day start
  getTimesheetDay() {
    this.timesheetSer.getTimesheetDay(this.timesheetDate).subscribe((res) => {
      if (res && res instanceof Array) {
        this.timesheetOfTheDay = res;

        // this.totalDayTime = 0;
        // for(let day of this.timesheetOfTheDay) {
        //   this.totalDayTime += day.totalTime;
        // }
        // this.dayHours = Math.floor(this.totalDayTime / 60);
        // this.dayMinutes = this.totalDayTime % 60;
      }
    });
  }

  calculateTotalWork(): string {
    this.todayTimesheetDuration = 0;
    this.timesheetOfTheDay.forEach(
      (item: { startTime: string; endTime: string }) => {
        const durationMs = this.calculateDuration(item.startTime, item.endTime);
        this.todayTimesheetDuration += durationMs;
      }
    );
    return this.formatDuration(this.todayTimesheetDuration);
  }
  calculateDuration(startTime: string, endTime: string) {
    if (!endTime) return 0;
    const startTim: Date = new Date(startTime);
    const endTim: Date = new Date(endTime);
    const durationMs: any = endTim.getTime() - startTim.getTime();
    return durationMs;
  }
  formatDuration(ms: number): string {
    return `${Math.floor((ms / (1000 * 60 * 60)) % 24)}h ${Math.floor(
      (ms / (1000 * 60)) % 60
    )}m ${Math.floor((ms / 1000) % 60)}s`;
  }

  // timesheet day end

  getTimesheetMonth() {
    this.timesheetSer.getTimesheetMonth(this.timesheetDate).subscribe((res) => {
      if (res) {
        this.timesheetOfTheMonth = res;
        this.totalMontTime = 0;
        for (let month of this.timesheetOfTheMonth) {
          this.totalMontTime += month.totalTime;
        }
        this.hours = Math.floor(this.totalMontTime / 60);
        this.minutes = this.totalMontTime % 60;
      }
    });
  }

  getAllTimeSheetOfTheMonth() {
    this.timesheetSer
      .getAllTimesheetOfMonth(this.timesheetDate)
      .subscribe((res) => {
        if (res) {
          this.allTimeSheetOfMonth = res
            .map((timesheet: ITimesheet) => {
              // Convert startTime & endTime to IST and format to HH:mm AM/PM
              const start = new Date(timesheet.startTime);
              const end = new Date(timesheet.endTime);
              // const date = new Date(timesheet.date).toDateString();
              const date = moment(timesheet.date).format("YYYY-MM-DD");

              const options: Intl.DateTimeFormatOptions = {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
                timeZone: "Asia/Kolkata",
              };

              // Convert totalTime (in minutes) to "Xh Ym"
              const totalMinutes = Number(timesheet.totalTime);
              const hours = Math.floor(totalMinutes / 60);
              const minutes = totalMinutes % 60;
              const formattedTotalTime = `${hours}h ${minutes}m`;

              return {
                ...timesheet,
                startTime: start.toLocaleTimeString("en-IN", options),
                endTime: end.toLocaleTimeString("en-IN", options),
                totalTime: formattedTotalTime,
                date,
              };
            })
            .sort(
              (a: ITimesheet, b: ITimesheet) =>
                new Date(a.date).getTime() - new Date(b.date).getTime()
            );

          this.allTimeSheetOfMonth.forEach((timesheet) => {
            if (!this.projectList.includes(timesheet.project.title)) {
              this.projectList.push(timesheet.project.title);
            }
          });

          this.allTimeSheetOfMonth.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return dateB - dateA; // descending
          });

          this.filterTimesheetsByProject();
        }
      });
  }

  filterTimesheetsByProject() {
    if (this.selectedProject === "All") {
      this.filteredAllTimeSheetOfMonth = this.allTimeSheetOfMonth;
    } else {
      this.filteredAllTimeSheetOfMonth = this.allTimeSheetOfMonth.filter(
        (ts) => ts.project?.title === this.selectedProject
      );
    }
  }

  downloadReceipt(): void {
      this.downloading = true;
      // const mime = require('mime');
       const date = new Date();
      const fileName = `timesheet-${date.getDate()}-${
        date.getMonth() + 1
      }-${date.getFullYear()}.xlsx`;
      if (this.isCordova) {
        this.timesheetSer
        .getDownload(this.timesheetDate).subscribe((res: any)=> {
          const blob = new Blob([res], { type: 'application/pdf' });
          this.shareServ.exportFile(blob, fileName);
          this.downloading = false;
        }, (error) => {
          this.downloading = false;
        });
      } else {
        var url = encodeURI( environment.Api + `api/timesheet/download?date=${this.timesheetDate}`);
  
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
            mime.lookup(`${fileName}.pdf`)
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

  // async download() {
  //   try {
  //     const response = await this.timesheetSer
  //       .getDownload(this.timesheetDate)
  //       .toPromise();
  //     if (!response?.body) throw new Error("No file data");

  //     const date = new Date();
  //     const filename = `timesheet-${date.getDate()}-${
  //       date.getMonth() + 1
  //     }-${date.getFullYear()}.xlsx`;

  //     // Check if running in mobile app (cordova/capacitor)
  //     const isMobile = !!(window as any).cordova || !!(window as any).Capacitor;

  //     if (isMobile) {
  //       // Mobile: Save to device using File API
  //       await this.saveToDevice(response.body, filename);
  //     } else {
  //       // Web: Standard download
  //       const url = URL.createObjectURL(response.body);
  //       const link = Object.assign(document.createElement("a"), {
  //         href: url,
  //         download: filename,
  //         style: { display: "none" },
  //       });
  //       document.body.appendChild(link);
  //       link.click();
  //       document.body.removeChild(link);
  //       URL.revokeObjectURL(url);
  //     }
  //   } catch (error) {
  //     console.error("Download failed:", error);
  //     alert("Download failed");
  //   }
  // }

  // private async saveToDevice(blob: Blob, filename: string) {
  //   return new Promise((resolve, reject) => {
  //     // Use cordova file plugin if available
  //     if ((window as any).resolveLocalFileSystemURL) {
  //       const cordova = (window as any).cordova;
  //       const directory =
  //         cordova.file.externalDataDirectory || cordova.file.dataDirectory;

  //       (window as any).resolveLocalFileSystemURL(
  //         directory,
  //         (dir: any) => {
  //           dir.getFile(
  //             filename,
  //             { create: true },
  //             (file: any) => {
  //               file.createWriter((writer: any) => {
  //                 writer.onwriteend = () => {
      //               alert(`File saved: ${filename}`);
      //               resolve(true);
      //             };
      //             writer.onerror = reject;
      //             writer.write(blob);
      //           });
      //         },
      //         reject
      //       );
      //     },
      //     reject
      //   );
      // } else {
      //   // Fallback: try to trigger download anyway
      //   const url = URL.createObjectURL(blob);
      //   const link = Object.assign(document.createElement("a"), {
      //     href: url,
      //     download: filename,
      //   });
  //       link.click();
  //       URL.revokeObjectURL(url);
  //       resolve(true);
  //     }
  //   });
  // }

  calculateTimeDifference(startTime: string, endTime: string): string {
    const start = moment(startTime);
    const end = moment(endTime);
    const duration = moment.duration(end.diff(start));

    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();

    return `${hours}h ${minutes}m`;
  }

  onStatusChange(event: any, entry: any) {
    const selectedStatus = event.target.value;

    if (selectedStatus === "Approved") {
      this.approveReject("accept", entry.guid);
    } else if (selectedStatus === "Rejected") {
      this.approveReject("reject", entry.guid);
    }
    // Add more conditions for other statuses if needed
  }

  approveReject(status: string, guid: string) {
    const data: ApproveTimesheetReq = {
      status: status === "accept" ? ETimesheet.ACCEPT : ETimesheet.REJECT,
      timesheetGuid: guid,
    };
    this.timesheetSer.approveReject(data).subscribe((res) => {
      if (res) {
        this.getUserTimesheet();
        this.getTimesheetList();
      }
    });
  }

  updateTimesheet(timesheet: ITimesheet) {
    this.timeSheetForm.patchValue(timesheet);
    this.timesheetId = timesheet.guid;
    this.update = true;
    if (this.content) {
      this.content.scrollToTop(100);
    }
  }

  deleteTimesheet(id: string) {
    this.timesheetSer.deleteTimesheet(id).subscribe((res) => {
      if (res) {
        this.shareServ.presentToast(
          "Timesheet deleted successfully",
          "top",
          "success"
        );
      }
    });
  }

  getUserTimesheet() {
    const userId = localStorage.getItem("userId") || "";
    this.timesheetSer
      .getUserTimesheet(this.pageIndex * 100, 100, userId, this.timesheetDate)
      .subscribe((res) => {
        if (res) {
          this.userTimesheet = res;
          if (this.userRole === "Employee") {
            this.highlightedDates = this.getHighlightedDatesFunction();
          }
        }
      });
  }

  getStatusClass(status: string): string {
    return status?.toLowerCase() === "pending"
      ? "status-pending"
      : status?.toLowerCase() === "reject"
      ? "status-reject"
      : status?.toLowerCase() === "accept"
      ? "status-accept"
      : "";
  }

  getHighlightedDatesFunction(): Array<{
    date: string;
    textColor: string;
    backgroundColor: string;
  }> {
    let dataArray: Array<{
      date: string;
      textColor: string;
      backgroundColor: string;
    }> = [];

    this.userTimesheet.forEach((element) => {
      let bgColor: string =
        element.status === ETimesheet.PENDING
          ? "orange"
          : element.status === ETimesheet.REJECT
          ? "red"
          : element.status === ETimesheet.ACCEPT
          ? "green"
          : "initial";

      const eleDate = new Date(element.date);

      // Format the date as YYYY-MM-DD (pad month and day with leading zeros)
      const formattedDate = `${eleDate.getFullYear()}-${(eleDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${eleDate.getDate().toString().padStart(2, "0")}`;

      const data: { date: string; textColor: string; backgroundColor: string } =
        {
          date: formattedDate,
          textColor: "white",
          backgroundColor: bgColor,
        };

      // Check if the date already exists in the array by comparing 'date'
      if (!dataArray.some((d) => d.date === data.date)) {
        dataArray.push(data);
      }
    });

    return dataArray;
  }

  onDateChange(event: any) {
    const newDate = new Date(event.detail.value);
    const prevDate = new Date(this.timesheetDate);

    this.timesheetDate = event.detail.value; // Update the selected date
    if (
      newDate.getMonth() !== prevDate.getMonth() ||
      newDate.getFullYear() !== prevDate.getFullYear()
    ) {
      this.getAllTimeSheetOfTheMonth();
    }

    this.getAssignProjectById();
    this.getTimesheetDay(); // Refresh data for the new selected date
    this.getTimesheetList();
    this.getUserTimesheet();

    this.timeSheetForm.controls["date"].patchValue(
      moment(event.detail.value).utc().format()
    );
    // console.log("time sheet date : ",this.timeSheetForm.value);
  }

  onMonthChange(event: any) {
    this.timesheetDate = event.detail.value; // Update the selected date
    this.getAllTimeSheetOfTheMonth();
    this.getAssignProjectById();
    this.getTimesheetDay(); // Refresh data for the new selected date
    this.getTimesheetList();
    this.getUserTimesheet();

    this.timeSheetForm.controls["date"].patchValue(
      moment(event.detail.value).utc().format()
    );
  }

  get paginatedEntries() {
    const startIndex = (this.page - 1) * this.pageSize;
    return this.filteredAllTimeSheetOfMonth.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  get totalPages() {
    return Math.ceil(this.filteredAllTimeSheetOfMonth.length / this.pageSize);
  }
}
