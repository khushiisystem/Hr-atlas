import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { DatetimeChangeEventDetail, ModalController } from "@ionic/angular";
import { AdminService } from "src/app/services/admin.service";
import { ShareService } from "src/app/services/share.service";
import * as moment from "moment";
import { LoaderService } from "src/app/services/loader.service";

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
  dataLoaded: boolean = false;
  workDuration!: string;
  setupId: string = "";
  currentControl: string = "";

  constructor(
    private modalCtrl: ModalController,
    private shareServ: ShareService,
    private adminServ: AdminService,
    private fb: FormBuilder,
    private loader: LoaderService,
  ) {}

  ngOnInit() {
    this.attendanceForm = this.fb.group({
      inTime: ['', Validators.required],
      outTime: ['', Validators.required],
      gracePeriod: ['', Validators.required],
      workDuration: ['', Validators.required],
      guid: [''],
    });

    this.getSetups();
    // this.defualtSetups();
    this.currentControl = 'inTime';
    
    // this.currentDate = `${this.padNumber(now.getDate())}/${this.padNumber(now.getMonth() + 1)}/${now.getFullYear().toString().substr(-2)}`;
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
      if(res) {
        this.setupId = res.guid;
        await this.attendanceForm.patchValue(res);
        this.calculateWorkDuration();
        this.dataLoaded = true;
      } else {
        this.dataLoaded = true;
      }
    }, (error) => {
      console.error(error.error, "get error");
      this.defualtSetups();
      this.dataLoaded = true;
    });
  }

  openTimeModal(frmCtrl: string) {
    this.currentControl = frmCtrl;
    this.isOpenTimeModal = true;
  }


  selectTime(event: DatetimeCustomEvent){
    const formDate = new Date(event.detail.value as string);
    this.attendanceForm.controls[this.currentControl].setValue(moment.utc(formDate).format());
    this.calculateWorkDuration();
  }

  getDate(frmCtrl: string){
    let formDate: string = '';
    if(frmCtrl.trim() !== ''){
      formDate = this.attendanceForm.controls[frmCtrl].value;
    }
    return formDate != '' ? moment(formDate).format() : "";
  }

  saveSetup(){
    if(this.attendanceForm.invalid){
      this.shareServ.presentToast("Please complete the from.", 'top', 'danger');
      return;
    } else {
      this.loader.present('');
      this.adminServ.saveAttendanceSetup(this.attendanceForm.value).subscribe(res => {
        if(res){
          this.shareServ.presentToast("Attendance setup successfully.", 'top', 'success');
          this.modalCtrl.dismiss('done', 'confirm');
          this.loader.dismiss();
        }
      }, (error) => {
        this.shareServ.presentToast("Something is wrong.", 'top', 'danger');
        this.loader.dismiss();
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
