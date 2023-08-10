import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DatetimeChangeEventDetail, ModalController } from "@ionic/angular";
import { AdminService } from "src/app/services/admin.service";
import { ShareService } from "src/app/services/share.service";
import * as moment from "moment";

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
  workDuration!: string;
  setupId: string = "";
  currentControl: string = "";

  constructor(
    private modalCtrl: ModalController,
    private shareServ: ShareService,
    private adminServ: AdminService,
    private fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.attendanceForm = this.fb.group({
      inTime: ['', Validators.required],
      outTime: ['', Validators.required],
      gracePeriod: ['', Validators.required],
      workDuration: ['', Validators.required],
    });

    // this.getSetups();
    this.defualtSetups();
    this.currentControl = 'inTime';
    
    // this.currentDate = `${this.padNumber(now.getDate())}/${this.padNumber(now.getMonth() + 1)}/${now.getFullYear().toString().substr(-2)}`;
    console.log(this.attendanceForm.value, "form");
  }
  
  defualtSetups(){
    const now = new Date();
    let startTime = now;
    startTime.setHours(10, 0, 0, 0);
    let outTime = new Date();
    outTime.setHours(19, 0, 0, 0);

    this.attendanceForm.patchValue({
      inTime: moment.utc(startTime).format(),
      outTime: moment.utc(outTime).format(),
      gracePeriod: 60
    });
    
    this.calculateWorkDuration();
  }

  getSetups(){
    this.adminServ.getAttendanceSetup().subscribe(async res => {
      console.log(res, "res");
      if(res) {
        this.setupId = res.uuid;
        await this.attendanceForm.patchValue(res);
        this.calculateWorkDuration();
      }
    }, (error) => {
      console.error(error.error, "get error");
    });
  }

  openTimeModal(frmCtrl: string) {
    this.currentControl = frmCtrl;
    this.isOpenTimeModal = true;
  }


  selectTime(event: DatetimeCustomEvent){
    const formDate = event.detail.value as string;
    this.attendanceForm.controls[this.currentControl].setValue(moment.utc(formDate).format());
    console.log(this.attendanceForm.value, "form");
    this.calculateWorkDuration();
  }

  getDate(frmCtrl: string){
    console.log(frmCtrl, "frmCtrl");
    console.log(this.attendanceForm.value, "form");
    let formDate: string = '';
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
      this.adminServ.saveAttendanceSetup(this.attendanceForm.value).subscribe(res => {
        if(res){
          this.shareServ.presentToast("Attendance setup successfully.", 'top', 'success');
          this.modalCtrl.dismiss('done', 'confirm');
        }
      }, (error) => {
        this.shareServ.presentToast("Something is wrong.", 'top', 'danger');
      });
    }
  }

  close(){this.modalCtrl.dismiss();}


  calculateWorkDuration() {
    const clockInTime = this.attendanceForm.controls['inTime'].value;
    const clockOutTime = this.attendanceForm.controls['outTime'].value;
    if (clockInTime && clockOutTime) {
      const startTime = new Date(clockInTime);
      const endTime = new Date(clockOutTime);
      const duration = endTime.getTime() - startTime.getTime();
      const hours = Math.floor(duration / 3600000);
      const minutes = Math.floor((duration % 3600000) / 60000);
      // const seconds = Math.floor((duration % 60000) / 1000);

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

}
