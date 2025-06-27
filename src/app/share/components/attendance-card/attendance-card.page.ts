import { CommonModule } from "@angular/common";
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import {
  AlertController,
  DatetimeCustomEvent,
  IonContent,
  IonicModule,
  ModalController,
} from "@ionic/angular";
import {
  AttListItem,
  ERegularization,
  IRegularization,
} from "src/app/employee/attendance/attendance.page";
import { ReadMorePageModule } from "../read-more/read-more.module";
import { RoleStateService } from "src/app/services/roleState.service";
import { AttendaceStatus } from "src/app/interfaces/enums/leaveCreditPeriod";
import { IonModal } from "@ionic/angular/common";
import * as moment from "moment";
import { ShareService } from "src/app/services/share.service";
import { LoaderService } from "src/app/services/loader.service";
import { IApproveRegularizationReq } from "src/app/interfaces/request/IApproveRegularization";
import { RegularizationPage } from "../regularization/regularization.page";
import { LeaveAction } from "../leave-card/leave-card.page";

@Component({
  selector: "attendance-card",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReadMorePageModule,
    ReactiveFormsModule,
  ],
  templateUrl: "./attendance-card.page.html",
  styleUrls: ["./attendance-card.page.scss"],
})
export class AttendanceCardPage implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(IonContent) content!: IonContent;
  @Input({ required: true }) attendanceData!: AttListItem;
  @Input({ required: true }) cardClass: string = "";
  @Input() leaveStartDay: string = "";
  @Input() leaveEndDay: string = "";
  @Input({ required: true }) isWeekOff: boolean = false;
  @Input({ required: true }) isAllGood: boolean = false;
  @Input() regularization: IRegularization | null = null;
  leaveDay: boolean = false;
  openCard: boolean = true;
  regCard: boolean = true;
  @Output() attendanceCardAction: EventEmitter<{
    approve: boolean;
    role: "attendance" | "leave";
  }> = new EventEmitter();
  workDurationString: string = "";
  totalDurationMs: number = 0;
  @ViewChild("modal", { static: true }) modal!: IonModal;
  @ViewChild("modal", { static: true }) modal2!: ElementRef;
  isModalOpen = false;
  regularizationForm!: FormGroup;
  openCalendar: boolean = false;
  today: Date = new Date(new Date().toDateString() + " " + "5:00 AM");
  totalTimeString: string = "";
  regularizationId: string = "";
  update: boolean = false;
  @Output() regularizationUpdated: EventEmitter<void> =
    new EventEmitter<void>();
  isDisable: boolean = false;
  clockInStatus: { status: string; str: string } = { status: "", str: "" };
  clockOutStatus: { status: string | boolean; str: string } = {
    status: false,
    str: "",
  };
  selectedDay?: string | null = null;
  isAttMarking: boolean = false;
  AttendaceStatus = AttendaceStatus;
   @Output() actionReturn: EventEmitter<LeaveAction> = new EventEmitter<LeaveAction>();

  constructor(
    private rolseStateServ: RoleStateService,
    private cdr: ChangeDetectorRef,
    private _fb: FormBuilder,
    private _shareServ: ShareService,
    private _loader: LoaderService,
    private modelCtrl: ModalController
  ) {}

  ngOnInit() {
    this.regularizationForm = this._fb.group({
      attandanceDate: [this.attendanceData.created_date, Validators.required],
      clockIn: ["", Validators.required],
      clockOut: ["", Validators.required],
      totalTime: null,
      reason: [""],
      description: ["", Validators.required],
    });

    this.regularizationForm
      .get("clockIn")
      ?.valueChanges.subscribe(() => this.calculateTotalTime());
    this.regularizationForm
      .get("clockOut")
      ?.valueChanges.subscribe(() => this.calculateTotalTime());

    if (
      this.attendanceData.status === "Leave" &&
      this.attendanceData.leaveData
    ) {
      const createdDate = new Date(this.attendanceData.created_date)
        .toISOString()
        .split("T")[0];
      const leaveFromDate = new Date(this.attendanceData.leaveData.from.date)
        .toISOString()
        .split("T")[0];
      const leaveToDate = new Date(this.attendanceData.leaveData.to?.date)
        .toISOString()
        .split("T")[0];

      const leaveFromDaytype =
        this.attendanceData.leaveData.from.dayType === "Half Day"
          ? true
          : false;
      const leaveToDaytype =
        this.attendanceData.leaveData.to?.dayType === "Half Day" ? true : false;

      if (
        (createdDate === leaveFromDate && leaveFromDaytype) ||
        (createdDate === leaveToDate && leaveToDaytype)
      ) {
        this.leaveDay = true;
      }
    }
  }

  isStatusNot(status: AttendaceStatus, value: AttendaceStatus): boolean {
    const checkDate = new Date(this.attendanceData.created_date);
    const isSaturday = checkDate.getDay() === 6; // 6 = Saturday

    if (isSaturday && value === AttendaceStatus.HALF_DAY) {
      return false;
    }

    return status !== value;
  }

  selectDay(event: any, attendanceData: AttListItem) {
    if (this.isAttMarking) return;
    this.isAttMarking = true;

    console.log("attendace data : ", this.attendanceData);
    console.log("Selected day:", event.detail.value);
    console.log("date :", attendanceData.created_date);
    console.log("e id:", attendanceData.employeeId);

    this.selectedDay = event?.details?.value;
    let data = {
      Day: event?.detail?.value,
      Date: attendanceData.created_date,
      EmployeeId: attendanceData.employeeId,
      Guids: this.attendanceData.attendanceData.map((e) => e.guid),
    };

    this._shareServ.markAttendance(data).subscribe({
      next: (res) => {
        console.log("Attendance marked:", res);
        this.isAttMarking = false;
      },
      error: (err) => {
        console.error("Attendance marking failed:", err);
        this.isAttMarking = false;
      },
    });
  }

  getClockInStatus() {
    if (!this.attendanceData.attendanceData) return;
    this.clockInStatus = this.calculateClockInStatus();
  }

  calculateClockInStatus(): { status: string; str: string } {
    // Find the earliest clock-in time
    if (
      this.attendanceData.status !== "Present" ||
      !this.attendanceData.attendanceData
    ) {
      return { status: "", str: "" };
    }

    const earliestClockIn = this.attendanceData.attendanceData.reduce(
      (earliest, current) => {
        if (!current.clockIn) return earliest;

        const currentClockIn = new Date(current.clockIn);
        const earliestClockIn = new Date(earliest.clockIn);
        if (!earliest) return currentClockIn;

        return currentClockIn < earliestClockIn ? current : earliest;
      }
    );

    const clockInDate = new Date(earliestClockIn.clockIn);
    // Create reference times for the same date
    const tenAM = new Date(
      clockInDate.getFullYear(),
      clockInDate.getMonth(),
      clockInDate.getDate(),
      10,
      0,
      0
    );
    const tenFifteenAM = new Date(
      clockInDate.getFullYear(),
      clockInDate.getMonth(),
      clockInDate.getDate(),
      10,
      15,
      0
    );

    const timeString = clockInDate.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // Determine status
    if (clockInDate <= tenFifteenAM) {
      return {
        status: "success",
        str: `On Time : ${timeString}`,
      };
    } else {
      const diffMs = clockInDate.getTime() - tenFifteenAM.getTime();
      const diffMin = Math.ceil(diffMs / 60000); // Use ceil for more accurate "late by" calculation
      return {
        status: "danger",
        str: `Late : ${timeString}`,
      };
    }
  }

  calculateClockOutStatus(): { status: boolean | string; str: string } {
    // Early return if no attendance data
    if (!this.attendanceData?.attendanceData?.length) {
      return { status: false, str: "" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time for accurate date comparison

    // Find the latest clock out time (fixed from "earliest")
    const latestClockOut = this.attendanceData.attendanceData.reduce(
      (latest, current) => {
        // Skip records without clock out time
        if (!current.clockOut) return latest;

        // Initialize with first valid clock out
        if (!latest) return current.clockOut;

        // Return the later time
        return new Date(current.clockOut) > new Date(latest)
          ? current.clockOut
          : latest;
      },
      null
    );

    // Return early if no valid clock out found
    if (!latestClockOut) {
      return { status: false, str: "" };
    }

    const clockOutDate = new Date(latestClockOut);

    // Check if clock out is today - don't show early status for same day
    const clockOutDay = new Date(clockOutDate);
    clockOutDay.setHours(0, 0, 0, 0);

    if (clockOutDay.getTime() === today.getTime()) {
      // console.log("check late by");
      return { status: false, str: "" };
    }

    // Determine required hours based on day of week
    const dayOfWeek = clockOutDate.getDay();
    const requiredHours = dayOfWeek === 6 ? 5 : 9; // Saturday: 5hrs, Others: 9hrs

    const durationStr = this.workDurationString || "";

    // Match hours, minutes, and seconds from the string
    const hoursMatch = durationStr.match(/(\d+(?:\.\d+)?)h/);
    const minutesMatch = durationStr.match(/(\d+(?:\.\d+)?)m/);
    const secondsMatch = durationStr.match(/(\d+(?:\.\d+)?)s/);

    // Convert all to minutes
    const hours = hoursMatch ? parseFloat(hoursMatch[1]) * 60 : 0;
    const minutes = minutesMatch ? parseFloat(minutesMatch[1]) : 0;
    const seconds = secondsMatch ? parseFloat(secondsMatch[1]) / 60 : 0;

    // Total worked time in minutes
    const workedMinutes = hours + minutes + seconds;

    // Compare with required time (assume requiredMinutes is in minutes)
    if (workedMinutes < requiredHours * 60) {
      const remainingMinutes = requiredHours * 60 - workedMinutes;
      const remHours = Math.floor(remainingMinutes / 60);
      const remMins = Math.round(remainingMinutes % 60);

      const timeString = [
        remHours > 0 ? `${remHours}h` : "",
        remMins > 0 ? `${remMins}m` : "",
      ]
        .filter(Boolean)
        .join(" ");

      return {
        status: "danger",
        str: `Early: ${timeString}`,
      };
    }

    // Default return - requirements met
    return { status: false, str: "" };
  }

  calculateTotalTime() {
    const clockIn = this.regularizationForm.controls["clockIn"].value;
    const clockOut = this.regularizationForm.controls["clockOut"].value;

    if (clockIn && clockOut) {
      const durationMs = this.calculateDuration(clockIn, clockOut);
      this.totalTimeString = this.formatDurationReg(durationMs);
      this.regularizationForm.patchValue({ totalTime: this.totalTimeString });
    } else {
      this.totalTimeString = ""; // Clear if either clockIn or clockOut is missing
      this.regularizationForm.patchValue({ totalTime: "" });
    }
  }

  // Add this getter to your component
  getClockOutStatus() {
    this.clockOutStatus = this.calculateClockOutStatus();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes["attendanceData"] ||
      changes["cardClass"] ||
      changes["isAllGood"]
    ) {
      this.workDurationString = this.calculateTotalWork();
      this.updateStatus();
    }
  }

  ngAfterViewInit(): void {
    this.updateStatus();
    this.getClockInStatus();
    this.getClockOutStatus();
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

  updateStatus() {
    const today = new Date();
    today.setHours(0, 0, 1);
    if (
      this.regularization?.status === "Accept" &&
      this.attendanceData.status !== AttendaceStatus.PRESENT
    ) {
      let regDate = new Date(this.regularization.attandanceDate);
      let totalTime: number = +this.regularization.totalTime.split("h")[0];
      if (totalTime < 5) {
        this.attendanceData.status = AttendaceStatus.ABSENT;
      } else if (totalTime >= 5 && regDate.getDay() === 6) {
        this.attendanceData.status = AttendaceStatus.PRESENT;
      } else if (totalTime < 8) {
        this.attendanceData.status = AttendaceStatus.HALF_DAY;
      } else {
        this.attendanceData.status = AttendaceStatus.PRESENT;
      }
    }
    this.cdr.detectChanges();
  }

  calculateTotalWork(): string {
    this.totalDurationMs = 0;
    if (this.regularization && this.regularization.status === "Accept") {
      return this.regularization.totalTime;
    } else {
      this.attendanceData.attendanceData.forEach(
        (item: { clockIn: string; clockOut: string | null }) => {
          const durationMs = this.calculateDuration(
            item.clockIn,
            item.clockOut
          );
          this.totalDurationMs += durationMs;
        }
      );
      return this.formatDuration(this.totalDurationMs);
    }
  }
  calculateDuration(clockIn: string, clockOut: string | null) {
    if (!clockOut) return 0;
    const startTime: Date = new Date(clockIn);
    const endTime: Date = new Date(clockOut);
    const durationMs: any = endTime.getTime() - startTime.getTime();
    return durationMs;
  }
  formatDuration(ms: number): string {
    return `${Math.floor((ms / (1000 * 60 * 60)) % 24)}h ${Math.floor(
      (ms / (1000 * 60)) % 60
    )}m ${Math.floor((ms / 1000) % 60)}s`;
  }

  formatDurationReg(ms: number): string {
    return `${Math.floor((ms / (1000 * 60 * 60)) % 24)}h ${Math.floor(
      (ms / (1000 * 60)) % 60
    )}m`;
  }

  localDate(dateStr: string | Date): Date {
    return new Date(moment(dateStr).local().format());
  }

  markPresent(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.attendanceCardAction.emit({ role: "attendance", approve: true });
  }

  openModal() {
    if (!this.isModalOpen) {
      this.modal.present();
      this.isModalOpen = true;
    }
  }

  closeModal() {
    this.modal.dismiss();
    this.isModalOpen = false;
  }

  markTouched(ctrlName: string) {
    this.regularizationForm.controls[ctrlName].markAsTouched();
  }

  getStartTime() {
    const formValue = this.regularizationForm.controls["clockIn"].value;
    return formValue ? new Date(moment(formValue).format()) : "";
  }
  setStartTime(event: DatetimeCustomEvent) {
    this.regularizationForm.patchValue({
      clockIn: moment(event.detail.value).utc().format(),
    });
  }

  getEndTime() {
    const formValue = this.regularizationForm.controls["clockOut"].value;
    return formValue ? new Date(moment(formValue).format()) : "";
  }
  setEndTime(event: DatetimeCustomEvent) {
    this.regularizationForm.patchValue({
      clockOut: moment(event.detail.value).utc().format(),
    });
  }

  getDate(ctrlName: string) {
    const formDate = this.regularizationForm.controls[ctrlName].value;
    return formDate != ""
      ? new Date(formDate)
      : this.attendanceData.created_date;
  }
  selectDate(event: DatetimeCustomEvent) {
    this.regularizationForm.controls["attandanceDate"].patchValue(
      moment(event.detail.value).utc().format()
    );
  }

  approveReject(status: string, guid: string) {
    if (this.isDisable) return;
    console.log("is disable : ", this.isDisable);

    this.isDisable = true;
    const data: IApproveRegularizationReq = {
      status:
        status === "accept"
          ? ERegularization.ACCEPT
          : status === "review"
          ? ERegularization.REVIEW
          : ERegularization.REJECT,
      regulariztinGuid: guid,
    };
    this._shareServ.approveRegularization(data).subscribe((res) => {
      if (res) {
        this.regularization;
        this.regularizationUpdated.emit();
      }
      this.isDisable = false;
    });
  }

  submit() {
    if (this.update) {
      if (this.regularizationId.trim() == "") {
        return;
      }
      this._shareServ
        .updateRegularization(
          this.regularizationId,
          this.regularizationForm.value
        )
        .subscribe((res) => {
          if (res) {
            this.regularizationForm.reset();
            this.update = false;
            this.closeModal();
            this.regularization;
            this.regularizationUpdated.emit();
            this.modal.dismiss(res);
            this.regularizationForm.patchValue({
              attendanceData: this.attendanceData.created_date,
            });
          }
        });
    } else {
      this._loader.present("");
      this._shareServ
        .addRegularization(this.regularizationForm.value)
        .subscribe(
          async (res) => {
            if (res) {
              this._shareServ.presentToast(res.message, "top", "success");
              this._loader.dismiss();
              this.regularizationForm.reset();
              this.closeModal();
              this.regularizationUpdated.emit();
              await this.modal.dismiss(res);
              // await this.modal.onDidDismiss().then(value => {
              // });
              this.regularizationForm.patchValue({
                attendanceData: this.attendanceData.created_date,
              });
            } else {
              this._loader.dismiss();
            }
          },
          (error) => {
            this._shareServ.presentToast(error.error.message, "top", "danger");
            this._loader.dismiss();
          }
        );
    }
  }

  updateRegularization(regul: IRegularization) {
    this.regularizationForm.patchValue(regul);
    this.regularizationId = this.regularization!.guid;

    this.update = true;
    if (this.content) {
      this.content.scrollToTop(100);
    }
  }

  handleModalAction(regul: IRegularization) {
    this.openModal();

    if (regul) {
      this.updateRegularization(regul);
    }
  }

  getStatusClass(status: string): string {
    return status === "Pending"
      ? "status-pending"
      : status === "Accept"
      ? "status-accept"
      : status === "Reject"
      ? "status-reject"
      : status === "Review"
      ? "status-review"
      : "";
  }

  leaveAction(action: 'Reject' | 'Accept' | 'Cancel') {
    // if (action === "Cancel" && this.attendanceData.leaveData.guid) {
    //   this.cancelLeave(this.attendanceData.leaveData.guid);
    // }
    this.actionReturn.emit({ action: action, leaveId: this.attendanceData.leaveData.guid });
  }

}
