import {
  AfterContentChecked,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  DatetimeCustomEvent,
  IonContent,
  IonInfiniteScroll,
} from "@ionic/angular";
import * as moment from "moment";
import { Subscription } from "rxjs";
import { AttendaceStatus } from "src/app/interfaces/enums/leaveCreditPeriod";
import { IClockInResponce } from "src/app/interfaces/response/IAttendanceSetup";
import { IEmployeeResponse } from "src/app/interfaces/response/IEmployee";
import { IEmplpoyeeWorWeek } from "src/app/interfaces/response/IEmplpoyeeWorWeek";
import {
  IHollydayResponse,
  ILeaveLogsResponse,
} from "src/app/interfaces/response/ILeave";
import { AdminService } from "src/app/services/admin.service";
import { LoaderService } from "src/app/services/loader.service";
import { RoleStateService } from "src/app/services/roleState.service";
import { ShareService } from "src/app/services/share.service";
import { LeaveAction } from "src/app/share/components/leave-card/leave-card.page";
import { IEmpSelect } from "src/app/share/employees/employees.page";

export enum ERegularization {
  PENDING = "Pending",
  REJECT = "Reject",
  ACCEPT = "Accept",
  REVIEW = "Review",
}

export interface IHighlightedDate {
  date: Date | string;
  textColor?: string;
  backgroundColor?: string;
}

export interface AttListItem {
  employeeId: string;
  status: AttendaceStatus;
  created_date: string | Date;
  created_user: string;
  open_form: boolean;
  attendanceData: Array<any>;
  leaveData: any;
}

export interface IRegularization {
  attandanceDate: string;
  clockIn: string;
  clockOut: string;
  totalTime: string;
  reason: string;
  description: string;
  status: string;
  adminId: string;
  guid: string;
  user: {
    firstName: string;
    lastName: string;
  };
}

@Component({
  selector: "app-attendance",
  templateUrl: "./attendance.page.html",
  styleUrls: ["./attendance.page.scss"],
})
export class AttendancePage implements OnInit, OnDestroy, AfterContentChecked {
  employeeId: string = "";
  employee!: IEmpSelect;
  attendanceLoaded: boolean = false;
  leaveLoaded: boolean = false;
  workWeekLoaded: boolean = false;
  calendarLoaded: boolean = false;
  moreAttendance: boolean = true;
  pageIndex: number = 0;
  attendanceList: IClockInResponce[] = [];
  eventsList: IHollydayResponse[] = [];
  highlightedDates: Array<IHighlightedDate> = [];
  fullLeaves: Array<IHighlightedDate> = [];
  halfLeaves: Array<IHighlightedDate> = [];
  leaveLogs: Array<ILeaveLogsResponse> = [];
  expandedCards: number[] = [0];
  dateModal: boolean = false;
  attendanceDate: any;
  today: Date = new Date();
  workWeekDetail!: IEmplpoyeeWorWeek;
  dateList: AttListItem[] = [];
  presents: number = 0;
  absent: number = 0;
  minDate: Date = new Date();
  dates: (moment.Moment | string | null)[][] = [];
  leavesCount: number = 0;
  activeTab: string = "listView";
  apiSubscription!: Subscription;
  tabsList = [
    { value: "status", label: "Status" },
    { value: "listview", label: "List View" },
    { value: "calendarView", label: "Calendar View" },
    { value: "leaves", label: "Leaves" },
  ];
  employeeDetail!: IEmployeeResponse;
  getReg: IRegularization[] = [];
  regCard: boolean = true;
  pageNumber: number = 0;
  logPageNumber: number = 0;
  requestLoaded: boolean = false;
  moreRequests: boolean = false;
  requestedLeaveList: ILeaveLogsResponse[] = [];
  @ViewChild("requestsInfiniteScroll")
  requestsInfiniteScroll!: IonInfiniteScroll;

  constructor(
    private shareServ: ShareService,
    private loader: LoaderService,
    private adminServ: AdminService,
    private activeRoute: ActivatedRoute,
    private rolseStateServ: RoleStateService,
    private cdr: ChangeDetectorRef
  ) {
    this.minDate.setFullYear(2000, 1, 1);
  }

  ngAfterContentChecked(): void {
    this.cdr.detectChanges();
  }

  ngOnInit() {
    // const backTab = history.state?.tab ?? "status";
    const backTab = localStorage.getItem("activeTab") || "status";
    if (this.tabsList.find((item) => item.value === backTab)) {
      this.activeTab = backTab;
    }
    this.employeeId = this.activeRoute.snapshot.params?.["id"];
    this.attendanceDate =
      localStorage.getItem("attendanceDate") || this.today.toISOString();
    if (this.employeeId.trim() !== "") {
      this.getByIdRegularization();
      this.fethcDetail();
      this.createDateList(this.attendanceDate);
      // this.getAttendance();
      this.getWorkWeek();
      this.getMonthLyAttendance();
      this.getLogs();
      this.getCalendar();
    }
  }

  getNewAttendance() {
    // this.dateList.forEach((e) => console.log(e.status, e.created_date));
  }

  getAppliedLeaves() {
    // console.log("leaves logs : ",this.leaveLogs);
    let count = 0;
    this.leaveLogs.forEach((ll) => {
      if (ll.status === "Pending" || ll.status === "Accept") {
        ll.fullDayDates.forEach((fdl) => count++);
        ll.halfDayDates.forEach((hdl) => (count += 0.5));
      }
    });
    // console.log("Appplied leave count : ",count);
    return count;
  }

  getUnplanned() {
    let count = 0;
    this.leaveLogs.forEach((ll) => {
      if (
        ll.isUnplanned &&
        (ll.status === "Pending" || ll.status === "Accept")
      ) {
        ll.fullDayDates.forEach((fdl) => count++);
        ll.halfDayDates.forEach((hdl) => (count += 0.5));
      }
    });
    return count;
  }

  onTabChange() {
    localStorage.setItem("activeTab", this.activeTab);
  }

  onDateChange() {
    this.getWorkWeek();
    localStorage.setItem("attendanceDate", this.attendanceDate);
  }

  ionViewWillEnter() {}

  fethcDetail() {
    this.shareServ.getEmployeeById(this.employeeId).subscribe((res) => {
      if (res) {
        this.employeeDetail = res;
      }
    });
  }

  get getPresent(): number {
    return this.dateList.reduce((pres, item) => {
      return item.status === AttendaceStatus.PRESENT ||
        item.status === AttendaceStatus.WEEK_OFF ||
        item.status === AttendaceStatus.HOLiDAY
        ? pres + 1
        : item.status === AttendaceStatus.HALF_DAY
        ? pres + 0.5
        : pres;
    }, 0);
  }
  get getLeaves(): number {
    return this.dateList.reduce((leave, item) => {
      // console.log(item);
      return item.status === AttendaceStatus.LEAVE ? leave + 1 : leave;
    }, 0);
  }
  get getAbsent(): number {
    return this.dateList.reduce((abs, item) => {
      return item.status === AttendaceStatus.ABSENT
        ? abs + 1
        : item.status === AttendaceStatus.HALF_DAY
        ? abs + 0.5
        : abs;
    }, 0);
  }
  get getLastDate(): number {
    return new Date(
      moment(this.attendanceDate).endOf("month").format()
    ).getDate();
  }

  get userRole() {
    let role = "";
    this.rolseStateServ.getState().subscribe((res) => {
      if (res) {
        role = res.trim();
      }
    });
    return role;
  }

  reseteEmployee() {
    this.employee = null as any;
    this.employeeId = "";
  }

  getWorkWeek() {
    this.workWeekLoaded = false;
    this.apiSubscription = this.shareServ
      .employeeAssignedWorkWeekWithDate(this.employeeId, this.attendanceDate)
      .subscribe(
        (res) => {
          if (res) {
            // console.log("check res : ", res);
            this.employee = { ...res.employeeDetails, guid: res.employeeId };
            this.presents = 0;
            this.absent = 0;
            this.workWeekDetail = res;
            this.addWeekOffDays();
            this.workWeekLoaded = true;
          }
        },
        (error) => {
          this.workWeekLoaded = true;
        }
      );
  }

  getMonthLyAttendance() {
    this.attendanceLoaded = false;
    this.loader.present("");

    if (this.pageIndex === 0) {
      this.attendanceList = [];
      this.highlightedDates = [];
    }

    this.setStartDate(this.attendanceDate);

    this.apiSubscription = this.shareServ
      .monthlyAttendance(
        this.employeeId,
        this.attendanceDate,
        this.pageIndex * 40,
        40
      )
      .subscribe(
        (res) => {
          if (res.length < 1) {
            // No more attendance data
            this.moreAttendance = false;
            this.attendanceLoaded = true;
            this.loader.dismiss();
            return;
          }

          this.moreAttendance = res.length > 39; // If more data is available
          this.pageIndex++;

          // Process attendance data
          const highlightedDatesMap: { [key: string]: IHighlightedDate } = {};
          const updatedDateList = this.dateList.map((item) => {
            if (item.status !== "Week Off") {
              res.forEach((e: IClockInResponce) => {
                if (
                  this.checkDates(
                    new Date(e.clockIn),
                    new Date(item.created_date)
                  )
                ) {
                  item.attendanceData = [...item.attendanceData, e];
                  if (item.status === AttendaceStatus.PRESENT) {
                  } else {
                    // item.status = e.status;
                    // console.log(item.created_date, item.status, e.status);
                    item.status =
                      e.status !== AttendaceStatus.ABSENT
                        ? this.updateStatus(item.attendanceData, e.status)
                        : item.status;
                    //  console.log(item.created_date, item.status, e.status);
                  }
                  item.created_date = new Date(e.clockIn).toISOString();
                }

                // Increment present/absent counters
                if (
                  item.status === AttendaceStatus.LEAVE ||
                  e.status === AttendaceStatus.ABSENT
                ) {
                  this.absent++;
                } else {
                  this.presents++;
                }

                // Highlighted dates data
                const data = {
                  date: this.returnCustomDate(e.clockIn),
                  textColor: this.checkStatus(e.status).color,
                  backgroundColor: this.checkStatus(e.status).backgroud,
                };

                highlightedDatesMap[data.date] = data;
              });
            }
            return item;
          });

          // Update highlighted dates (reduce DOM updates)
          Object.values(highlightedDatesMap).forEach((data) => {
            const index = this.highlightedDates.findIndex(
              (item: IHighlightedDate) => item.date === data.date
            );
            if (index !== -1) {
              this.highlightedDates[index] = data;
            } else {
              this.highlightedDates.push(data);
            }
          });

          this.dateList = updatedDateList; // Update the date list
          this.cdr.detectChanges(); // Trigger change detection only once

          // Load more data if available
          if (this.moreAttendance) {
            this.getMonthLyAttendance();
          }

          this.attendanceLoaded = true;
          this.loader.dismiss();
          this.getNewAttendance();
        },
        (error) => {
          this.attendanceLoaded = true;
          this.moreAttendance = false;
          this.loader.dismiss();
        }
      );
  }

  updateStatus(
    attendanceData: Array<any>,
    currentStatus = AttendaceStatus.ABSENT
  ): AttendaceStatus {
    const firstDataDate = new Date(attendanceData[0].clockIn);
    const updatedDate = new Date(this.today);

    const clockInDate = new Date(attendanceData[0].clockIn);
    const todayDate = new Date(this.today);

    // Strip the time part
    clockInDate.setHours(0, 0, 0, 0);
    todayDate.setHours(0, 0, 0, 0);

    if (clockInDate.getTime() === todayDate.getTime()) {
      return currentStatus;
    }

    updatedDate.setHours(0, 0, 1);
    if (firstDataDate < updatedDate) {
      let totalDurationMs = 0;
      attendanceData.forEach(
        (item: { clockIn: string; clockOut: string | null }) => {
          const durationMs = this.calculateDuration(
            item.clockIn,
            item.clockOut
          );
          totalDurationMs += durationMs;
        }
      );
      const isSaturday = firstDataDate.getDay() === 6;
      if (isSaturday && totalDurationMs >= 18000000) {
        return AttendaceStatus.PRESENT;
      } else if (totalDurationMs >= 28800000) {
        return AttendaceStatus.PRESENT;
      } else {
        return totalDurationMs < 18000000
          ? AttendaceStatus.ABSENT
          : totalDurationMs >= 18000000 && totalDurationMs < 28800000
          ? AttendaceStatus.HALF_DAY
          : currentStatus;
      }
    }

    return currentStatus;
  }
  calculateDuration(clockIn: string, clockOut: string | null) {
    if (!clockOut) return 0;
    const startTime: Date = new Date(clockIn);
    const endTime: Date = new Date(clockOut);
    const durationMs: any = endTime.getTime() - startTime.getTime();
    return durationMs;
  }

  isWeekOff(dateTime: string | Date) {
    if (this.workWeekDetail) {
      const weekOff = this.workWeekDetail.workweekDetails.weekOff;
      return weekOff.includes(moment(dateTime).format("dddd"));
    } else {
      return new Date(dateTime).getDay() === 0;
    }
  }

  addWeekOffDays() {
    // console.log("this.workweeekdetail : ", this.workWeekDetail);
    const weekOfList = this.workWeekDetail.workweekDetails.weekOff;
    this.dateList.forEach((item) => {
      if (
        weekOfList.includes(
          moment.weekdays(new Date(item.created_date).getDay())
        )
      ) {
        item.status = AttendaceStatus.WEEK_OFF;
        const hghIndex = this.highlightedDates.findIndex(
          (e) => e.date === this.returnCustomDate(item.created_date)
        );
        if (hghIndex != -1) {
          this.highlightedDates.forEach((e, index) => {
            if (e.date === this.returnCustomDate(item.created_date)) {
              e.textColor = "#333";
              e.backgroundColor = "var(--ion-color-warning)";
            }
          });
        } else {
          this.highlightedDates.push({
            date: this.returnCustomDate(item.created_date),
            textColor: "#333",
            backgroundColor: "var(--ion-color-warning)",
          });
        }
      }
      item.status === AttendaceStatus.LEAVE ||
      item.status === AttendaceStatus.ABSENT
        ? this.absent++
        : this.presents++;
    });
  }

  checkStatus(status: string) {
    let data = {
      color: "",
      backgroud: "",
    };
    switch (status) {
      case "Present":
        data.color = "#000";
        data.backgroud = "#2dd36f";
        break;

      case "Absent":
        data.color = "#000";
        data.backgroud = "red";
        break;

      case "Week Off":
        data.color = "#000";
        data.backgroud = "#ff9211";
        break;

      default:
        break;
    }
    return data;
  }

  async createDateList(selectedDate: string | Date) {
    let beginDate = new Date(moment(selectedDate).startOf("month").format());
    let lastDate = new Date(selectedDate);

    this.dateList = [];
    for (
      let date = lastDate;
      date >= beginDate;
      date.setDate(date.getDate() - 1)
    ) {
      const data: AttListItem = {
        employeeId: this.employeeId,
        status:
          this.eventsList.findIndex((item) =>
            this.checkDates(new Date(item.eventDate), date)
          ) != -1
            ? AttendaceStatus.HOLiDAY
            : AttendaceStatus.ABSENT,
        created_date: new Date(date),
        created_user: this.employeeId,
        open_form: false,
        attendanceData: [],
        leaveData: null,
      };
      this.dateList.push(data);
    }
    this.toggleCard(this.dateList[0]);
    this.generateDates(selectedDate);
  }

  generateDates(selectedDate: string | Date) {
    const startOfMonth = moment(selectedDate).startOf("month");
    const endOfMonth = moment(selectedDate).endOf("month");
    const currentDate = moment(startOfMonth);

    this.dates = [];

    while (currentDate.isSameOrBefore(endOfMonth)) {
      let weekIndex =
        currentDate.week() -
        startOfMonth.week() +
        (startOfMonth.weekday() === 0 ? 1 : 0);
      let dayIndex = currentDate.weekday();

      if (weekIndex < 0) {
        weekIndex += moment(currentDate).subtract(1, "year").weeksInYear();
      }

      if (!this.dates[weekIndex]) {
        this.dates[weekIndex] = [];
      }

      this.dates[weekIndex][dayIndex] = moment(currentDate);
      currentDate.add(1, "day");
    }

    this.dates = this.dates.map((week) => week.map((day) => (day ? day : "")));
  }

  checkDates(date1: Date, date2: Date): boolean {
    return (
      moment(date1).isSame(date2, "year") &&
      moment(date1).isSame(date2, "month") &&
      moment(date1).isSame(date2, "date")
    );
  }

  getCalendar() {
    this.calendarLoaded = false;
    this.apiSubscription = this.shareServ
      .getEventHollyday(moment.utc(this.attendanceDate).format())
      .subscribe(
        (res) => {
          if (res) {
            if (res.length < 1) {
              this.calendarLoaded = true;
              this.loader.dismiss();
              return;
            } else {
              this.absent = 0;
              this.presents = 0;
              this.eventsList = res;
              for (let a = 0; a < res.length; a++) {
                const selectDate: IHighlightedDate = {
                  date: this.returnCustomDate(res[a].eventDate),
                  backgroundColor: "#f58f0d",
                  textColor: "#000",
                };
                this.dateList.forEach((e) => {
                  if (
                    this.checkDates(
                      new Date(res[a].eventDate),
                      new Date(e.created_date)
                    ) &&
                    e.status != AttendaceStatus.PRESENT
                  ) {
                    // e.leaveData = res[a];
                    e.created_date = new Date(res[a].eventDate).toISOString();
                    e.status = AttendaceStatus.HOLiDAY;
                  }
                  e.status === AttendaceStatus.HOLiDAY
                    ? this.presents++
                    : this.absent++;
                });
                const index = this.highlightedDates.findIndex(
                  (d: IHighlightedDate) =>
                    d.date === this.returnCustomDate(res[a].eventDate)
                );
                if (index != -1) {
                  this.highlightedDates[index] = selectDate;
                } else {
                  this.highlightedDates.push(selectDate);
                }
              }
              this.calendarLoaded = true;
            }
          }
        },
        (error) => {
          this.calendarLoaded = true;
        }
      );
  }

  getLogs() {
    this.leaveLoaded = false;
    this.fullLeaves = [];
    this.halfLeaves = [];
    this.apiSubscription = this.shareServ
      .getMonthLeaves(
        this.employeeId,
        moment(this.attendanceDate).utc().format()
      )
      .subscribe(
        (res) => {
          // console.log("res : ",res);
          this.leaveLogs = res.sort((a, b) => {
            return (
              new Date(b.from.date).getTime() - new Date(a.from.date).getTime()
            );
          });

          for (let a = 0; a < res.length; a++) {
            const fullDayLeaves = res[a].fullDayDates || [];
            const halfDayLeaves = res[a].halfDayDates || [];
            if (res[a].status !== "Cancel") {
              fullDayLeaves.forEach((dates) => {
                if (
                  moment(this.attendanceDate).isSame(dates, "year") &&
                  moment(this.attendanceDate).isSame(dates, "month")
                ) {
                  this.updateHighlights(dates, res[a].status, true);
                }
              });
              halfDayLeaves.forEach((dates) => {
                if (
                  moment(this.attendanceDate).isSame(dates, "year") &&
                  moment(this.attendanceDate).isSame(dates, "month")
                ) {
                  this.updateHighlights(dates, res[a].status, false);
                }
              });
              [...fullDayLeaves, ...halfDayLeaves].forEach((item) => {
                this.presents = 0;
                this.absent = 0;
                this.dateList.forEach((e) => {
                  // if (item.status !== "Week Off") {
                  if (
                    this.checkDates(new Date(item), new Date(e.created_date)) &&
                    e.status === AttendaceStatus.ABSENT
                  ) {
                    e.leaveData = res[a];
                    e.created_date = new Date(item).toISOString();
                    e.status = AttendaceStatus.LEAVE;
                  }
                  e.status === AttendaceStatus.LEAVE ||
                  e.status === AttendaceStatus.ABSENT
                    ? this.absent++
                    : this.presents++;
                });
              });
            }
          }
          this.leaveLoaded = true;
        },
        (error) => {
          this.leaveLoaded = true;
        }
      );
  }

  updateHighlights(
    inputDate: string | Date,
    status: "Pending" | "Reject" | "Accept" | "Cancel",
    isFullDay: boolean
  ) {
    const selectDate: IHighlightedDate = {
      date: this.returnCustomDate(inputDate),
      backgroundColor:
        status === "Pending" ? "#ef7373" : isFullDay ? "red" : "pink",
      textColor: "#333",
    };
    const leavesArray = isFullDay ? this.fullLeaves : this.halfLeaves;
    const index = leavesArray.findIndex(
      (d: IHighlightedDate) => d.date === this.returnCustomDate(inputDate)
    );
    if (index != -1) {
      leavesArray[index] = selectDate;
    } else {
      leavesArray.push(selectDate);
    }
    this.highlightedDates = [
      ...this.highlightedDates,
      ...this.fullLeaves,
      ...this.halfLeaves,
    ];
  }

  getDayType(inputDate?: string | Date, leaveId?: string) {
    if (
      inputDate &&
      this.fullLeaves.some((item) =>
        this.checkDates(new Date(item.date), new Date(inputDate))
      )
    ) {
      return "Full Day";
    } else if (
      inputDate &&
      this.halfLeaves.some((item) =>
        this.checkDates(new Date(item.date), new Date(inputDate))
      )
    ) {
      return "Half Day";
    } else if (leaveId) {
      return this.leaveLogs[
        this.leaveLogs.findIndex((item) => item.guid === leaveId)
      ].dayType;
    } else {
      return "";
    }
  }

  filterLogs(leaveType: string) {
    let fullDays: any[] = [];
    let halfDays: any[] = [];
    this.leaveLogs.forEach((item) => {
      if (item.leaveType === leaveType) {
        item.fullDayDates.forEach((item) => {
          if (
            moment(item).isSame(this.attendanceDate, "year") &&
            moment(item).isSame(this.attendanceDate, "month") &&
            !fullDays.includes(moment(item).format("DD-MM-YYYY"))
          ) {
            fullDays.push(moment(item).format("DD-MM-YYYY"));
          }
        });
        item.halfDayDates.forEach((item) => {
          if (
            moment(item).isSame(this.attendanceDate, "year") &&
            moment(item).isSame(this.attendanceDate, "month") &&
            !halfDays.includes(moment(item).format("DD-MM-YYYY"))
          ) {
            halfDays.push(moment(item).format("DD-MM-YYYY"));
          }
        });
      }
    });
    return fullDays.length + halfDays.length * 0.5;
  }

  returnCustomDate(selectDate: string | Date) {
    const old_Date = selectDate;
    const dateObject = new Date(old_Date);
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, "0");
    const day = String(dateObject.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  attAcrdAction(
    event: { role: "attendance" | "leave"; approve: boolean },
    itemData: AttListItem
  ) {
    if (event.role == "attendance" && event.approve == true) {
      this.loader.present("");
      this.adminServ
        .markAttendEmp(
          this.employeeId,
          { id: "" },
          new Date(itemData.created_date)
        )
        .subscribe(
          (res) => {
            if (res && res.status === "Present") {
              (itemData.attendanceData = [...itemData.attendanceData, res]),
                (itemData.status = res.status);
              itemData.created_date = new Date(res.clockIn).toISOString();
              itemData.created_user = res.created_user;
              const calindex = this.highlightedDates.findIndex((item) =>
                this.checkDates(
                  new Date(item.date),
                  new Date(itemData.created_date)
                )
              );
              if (calindex != -1) {
                this.highlightedDates[calindex].backgroundColor = "#2dd36f";
                this.highlightedDates[calindex].textColor = "#000";
              } else {
                this.highlightedDates.push({
                  date: this.returnCustomDate(res.clockIn),
                  backgroundColor: "#2dd36f",
                  textColor: "#000",
                });
              }
              this.shareServ.presentToast("Marked present", "top", "success");
              this.loader.dismiss();
            } else {
              this.loader.dismiss();
            }
          },
          (error) => {
            this.shareServ.presentToast(error.errorMessage, "top", "danger");
            this.loader.dismiss();
          }
        );
    }
  }

  selectDate(event: DatetimeCustomEvent) {
    if (event.detail.value) {
      if (!moment(this.attendanceDate).isSame(event.detail.value, "year")) {
        this.attendanceDate = event.detail.value;
        // this.getCalendar();
        this.onDateChange();
      }
      this.fetchAll(event.detail.value as string);
    }
  }

  fetchAll(dateStr: string) {
    this.pageIndex = 0;
    let monthDate = new Date(dateStr);
    if (
      monthDate.getFullYear() < this.today.getFullYear() ||
      monthDate.getMonth() < this.today.getMonth()
    ) {
      monthDate.setFullYear(
        monthDate.getFullYear(),
        monthDate.getMonth() + 1,
        0
      );
    }
    if (
      monthDate.getFullYear() >= this.today.getFullYear() &&
      monthDate.getMonth() >= this.today.getMonth() &&
      monthDate.getDate() >= this.today.getDate()
    ) {
      monthDate.setFullYear(
        this.today.getFullYear(),
        this.today.getMonth(),
        this.today.getDate()
      );
    }
    this.attendanceDate = monthDate.toISOString();
    this.highlightedDates = [];
    this.eventsList.forEach((event) => {
      const selectDate: IHighlightedDate = {
        date: this.returnCustomDate(event.eventDate),
        backgroundColor: "#f58f0d",
        textColor: "#000",
      };
      const index = this.highlightedDates.findIndex(
        (d: IHighlightedDate) =>
          d.date === this.returnCustomDate(event.eventDate)
      );
      if (index != -1) {
        this.highlightedDates[index] = selectDate;
      } else {
        this.highlightedDates.push(selectDate);
      }
    });

    this.createDateList(monthDate);
    this.getMonthLyAttendance();
    this.getLogs();
    this.getCalendar();
    // if (this.workWeekDetail) {
    //   this.addWeekOffDays();
    // }
  }

  getMonthYear() {
    let customDate = "";
    if (this.attendanceDate) {
      customDate = `${
        moment.monthsShort()[new Date(this.attendanceDate).getMonth()]
      } ${new Date(this.attendanceDate).getFullYear()}`;
      // this.getCalendar();
    }
    return customDate;
  }

  collapseCard(index: number) {
    const cardIndex = this.expandedCards.findIndex((e: number) => e === index);
    if (cardIndex != -1) {
      this.expandedCards.splice(cardIndex, 1);
    } else {
      this.expandedCards.push(index);
    }
  }

  goBack() {
    history.back();
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }

  toggleCard(item: AttListItem) {
    if (item.attendanceData != null || item.leaveData != null) {
      item.open_form = !item.open_form;
    }
  }

  isAllLoaded(): boolean {
    return (
      this.leaveLoaded &&
      this.workWeekLoaded &&
      this.calendarLoaded &&
      this.attendanceLoaded
    );
  }

  incrementMonth() {
    const previousMonth = new Date(this.attendanceDate);
    const currentMonth = moment(previousMonth).add(1, "month");
    if (
      moment(currentMonth).isSameOrAfter(this.today, "year") &&
      moment(currentMonth).isSame(this.today, "month")
    ) {
      this.attendanceDate = new Date(this.today).toISOString();
    } else {
      this.attendanceDate = new Date(
        moment(currentMonth).endOf("month").format()
      ).toISOString();
    }
    this.onDateChange();
    this.fetchAll(this.attendanceDate);
    // if (!moment(previousMonth).isSame(this.attendanceDate, "year")) {
    //   this.getCalendar();
    // }
  }

  decrementMonth() {
    const previousMonth = new Date(this.attendanceDate);
    const currentMonth = moment(previousMonth).subtract(1, "month");
    this.attendanceDate = new Date(
      moment(currentMonth).endOf("month").format()
    ).toISOString();
    this.onDateChange();
    this.fetchAll(this.attendanceDate);
    // if (!moment(previousMonth).isSame(this.attendanceDate, "year")) {
    //   this.getCalendar();
    // }
  }

  incrementYear() {
    const updateYear = moment(this.attendanceDate).add(1, "year");
    if (moment(updateYear).isAfter(this.today, "month")) {
      this.attendanceDate = new Date(this.today).toISOString();
    } else {
      const atDate = moment(updateYear).endOf("month").format();
      this.attendanceDate = new Date(atDate).toISOString();
    }
    // this.getCalendar();
    this.onDateChange();
    this.fetchAll(this.attendanceDate);
  }

  decrementYear() {
    const currentMonth = moment(this.attendanceDate).subtract(1, "year");
    const atDate = moment(currentMonth).endOf("month").format();
    this.attendanceDate = new Date(atDate).toISOString();
    // this.getCalendar();
    this.onDateChange();
    this.fetchAll(this.attendanceDate);
  }

  getMomentDate(inputDate: string | moment.Moment) {
    if (inputDate instanceof moment) {
      return inputDate.format("D");
    } else {
      return "";
    }
  }

  getStatusByDate(date1: string | moment.Moment) {
    // console.log("get status by date : "+date1);
    if (date1 == "") {
      return null;
    }
    const index = this.dateList.findIndex(
      (event: AttListItem) =>
        moment(date1).format("yyyy/MM/DD") ===
        moment(event.created_date).format("yyyy/MM/DD")
    );
    const fullLeaveIndex = this.fullLeaves.findIndex((item) =>
      moment(item.date).isSame(date1)
    );
    const halfLeaveIndex = this.halfLeaves.findIndex((item) =>
      moment(item.date).isSame(date1)
    );
    if (index != -1) {
      return this.dateList[index];
    } else {
      if (halfLeaveIndex != -1 || fullLeaveIndex != -1) {
        return {
          status:
            fullLeaveIndex != -1
              ? AttendaceStatus.LEAVE
              : AttendaceStatus.HALF_DAY,
        };
      } else {
        return { status: "" };
      }
    }
  }

  isNextMonth() {
    return (
      moment(this.today).year() <= moment(this.attendanceDate).year() &&
      (moment(this.attendanceDate).isAfter(this.today, "month") ||
        moment(this.attendanceDate).isSame(this.today, "month"))
    );
  }
  isNextYear() {
    return moment(this.today).year() - moment(this.attendanceDate).year() >= 1;
  }
  ngOnDestroy(): void {
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
    }
    localStorage.removeItem("activeTab");
    localStorage.removeItem("attendanceDate");
  }

  get isJoinedDate(): boolean {
    return (
      this.employeeDetail &&
      moment(this.attendanceDate)
        .subtract(1, "month")
        .isBefore(this.employeeDetail.created_date)
    );
  }
  setStartDate(dateStr: string | Date) {
    let customDate = new Date(dateStr);
    customDate.setFullYear(
      customDate.getFullYear(),
      customDate.getMonth() + 1,
      -1
    );
    customDate.setDate(1);
    customDate.setHours(0, 0, 0);
    return customDate.toISOString();
  }

  getByIdRegularization() {
    this.shareServ.getByIdRegularization(this.employeeId).subscribe((res) => {
      // console.log(res);
      if (res) {
        if (res instanceof Array) {
          this.getReg = res;
        }
      }
    });
  }

  refreshRegularizationData() {
    this.getByIdRegularization();
  }

  getRegularization(date: string | Date): IRegularization | null {
    // console.log("get regularization : "+date);
    return (
      this.getReg.find(
        (item: IRegularization) =>
          moment(date).isSame(item.attandanceDate, "year") &&
          moment(date).isSame(item.attandanceDate, "month") &&
          moment(date).isSame(item.attandanceDate, "day")
      ) || null
    );
  }

  leaveApprovel(event: LeaveAction) {
    const approvel: boolean = event.action === "Accept";

    this.loader.present("");
    const leaveData = {
      leaveGuid: event.leaveId,
      approveLeave: approvel,
    };
    this.adminServ.leaveApprove(leaveData).subscribe(
      (res) => {
        if (res) {
          if (res.Message) {
            this.shareServ.presentToast(res.Message, "top", "success");
          } else {
            this.shareServ.presentToast("Responded", "top", "success");
          }
          this.logPageNumber = 0;
          this.pageNumber = 0;
          this.loader.dismiss();
          this.requestedLeaves();
          this.getLogs();
        }
      },
      (error) => {
        this.shareServ.presentToast(error.error.message, "top", "danger");
        this.loader.dismiss();
      }
    );
  }

  requestedLeaves() {
    this.requestLoaded = false;
    const data = {
      status: "Pending",
    };
    this.shareServ.getLeaveList(data, this.pageNumber * 20, 20).subscribe(
      (res) => {
        if (res) {
          if (res.length < 1) {
            this.moreRequests = false;
            this.requestLoaded = true;
          }

          if (this.pageNumber < 1) {
            this.requestedLeaveList = [];
          }
          for (let i = 0; i < res.length; i++) {
            if (
              !this.requestedLeaveList.some(
                (item: ILeaveLogsResponse) => item.guid === res[i].guid
              )
            ) {
              this.requestedLeaveList.push(res[i]);
            }
          }
          this.moreRequests = res.length > 19;
          if (this.requestsInfiniteScroll) {
            if (!this.moreRequests) {
              this.requestsInfiniteScroll.complete();
            }
          }
          this.requestLoaded = true;
        }
      },
      (error) => {
        console.log(error.error);
        this.requestLoaded = true;
      }
    );
  }
}
