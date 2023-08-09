import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { DatetimeChangeEventDetail, ModalController } from "@ionic/angular";
import { AdminService } from "src/app/services/admin.service";
import { ShareService } from "src/app/services/share.service";

export interface ITriggerModal {
  control: string,
  value: any;
}

interface DatetimeCustomEvent extends CustomEvent {
  detail: DatetimeChangeEventDetail;
  target: HTMLIonDatetimeElement;
}

@Component({
  selector: "app-attendance-setup",
  templateUrl: "./attendance-setup.page.html",
  styleUrls: ["./attendance-setup.page.scss"],
})
export class AttendanceSetupPage implements OnInit {
  attendanceForm!: FormGroup;
  isOpenTimeModal: boolean = false;
  activeTrigger!: ITriggerModal;
  currentTime: any;
  currentDate!: string;
  clockInTime!: string;
  clockOutTime!: string;
  workDuration!: string;
  toggleChecked: boolean = true;
  att: "absent" | "present" = "absent";
  gracePeriod!: string;

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private shareServ: ShareService,
    private adminServ: AdminService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.attendanceForm = this.fb.group({
      inTime: ['', Validators.required],
      outTime: ['', Validators.required],
      gracePeriod: [1, Validators.required],
      workDuration: ['', Validators.required],
    });
    
    const now = new Date();
    let startTime = now;
    startTime.setHours(10, 0, 0, 0);
    let outTime = new Date();
    outTime.setHours(19, 0, 0, 0);

    // this.currentDate = `${this.padNumber(now.getDate())}/${this.padNumber(now.getMonth() + 1)}/${now.getFullYear().toString().substr(-2)}`;
    
    this.attendanceForm.patchValue({
      inTime: startTime,
      outTime: outTime
    });
    
    this.activeTrigger = {
      control: 'inTime',
      value: this.attendanceForm.controls['inTime'].value
    };
    this.calculateWorkDuration();
    console.log(this.attendanceForm.value, "form");
  }

  openTimeModal(frmCtrl: string) {
    this.activeTrigger = {
      control: frmCtrl,
      value: this.attendanceForm.controls[frmCtrl].value
    }
    console.log(this.activeTrigger, "activeTrigger");
    this.currentTime = 
    this.isOpenTimeModal = true;
  }


  selectTime(event: DatetimeCustomEvent){
    this.activeTrigger.value = event.detail.value;
    console.log(this.activeTrigger, "activeTrigger");
    this.attendanceForm.controls[this.activeTrigger.control].setValue(event.detail.value);
    console.log(this.attendanceForm.value, "form");
    console.log(this.activeTrigger, "activeTrigger");
    this.calculateWorkDuration();
  }

  getDate(frmCtrl: string){
    let formDate: any;
    if(frmCtrl.trim() !== ''){
      formDate = this.attendanceForm.controls[frmCtrl].value;
    }
    return formDate != '' ? new Date(formDate) : new Date();
  }

  saveSetup(){
    console.log(this.attendanceForm.value);
    if(this.attendanceForm.invalid){
      this.shareServ.presentToast("Please complete the from.", 'top', 'danger');
      return;
    } else {
      this.shareServ.presentToast("Attendance setup successfully.", 'top', 'success');
      this.modalCtrl.dismiss('done', 'confirm');
    }
  }

  close(){this.modalCtrl.dismiss();}


  calculategrace() {
    const startTime = new Date(this.clockInTime);
    const endTime = new Date(this.clockOutTime);
    const duration = startTime.getTime() - endTime.getTime();
  }

  calculateWorkDuration() {
    const clockInTime = this.attendanceForm.controls['inTime'].value;
    const clockOutTime = this.attendanceForm.controls['outTime'].value;
    console.log(clockInTime, "clockInTime", clockOutTime, "clockOutTime");
    if (clockInTime && clockOutTime) {
      const startTime = new Date(clockInTime);
      const endTime = new Date(clockOutTime);
      const duration = endTime.getTime() - startTime.getTime();
      const hours = Math.floor(duration / 3600000);
      const minutes = Math.floor((duration % 3600000) / 60000);
      const seconds = Math.floor((duration % 60000) / 1000);

      this.workDuration = `${this.padNumber(hours)}:${this.padNumber(minutes)}`;
    } else {
      this.workDuration = "00:00";
    }

    this.attendanceForm.patchValue({
      workDuration: this.workDuration
    });
  }

  padNumber(num: number): string {
    return num.toString().padStart(2, "0");
  }

  goBack() {
    this.router.navigate(["./home"]);
  }

  toggleChanged() {
    if (this.toggleChecked) {
      this.router.navigate(["./user"]);
    } else {
      this.router.navigate(["./attendance"]);
    }
  }

  clockIn() {
    const now = new Date();
    this.clockInTime = now.toISOString();
    localStorage.setItem("clockInTime", this.clockInTime);
  }

  clockOut() {
    const now = new Date();
    this.clockOutTime = now.toISOString();
    localStorage.setItem("clockOutTime", this.clockOutTime);
    this.calculateWorkDuration();
  }
}
