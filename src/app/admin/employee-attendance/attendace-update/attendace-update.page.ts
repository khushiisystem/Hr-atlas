import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatetimeChangeEventDetail, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

interface DatetimeCustomEvent extends CustomEvent {
  detail: DatetimeChangeEventDetail;
  target: HTMLIonDatetimeElement;
}

@Component({
  selector: 'app-attendace-update',
  templateUrl: './attendace-update.page.html',
  styleUrls: ['./attendace-update.page.scss'],
})
export class AttendaceUpdatePage implements OnInit {
  employeeId: string = '';
  attendanceForm!: FormGroup;
  attendanceDetail: any;
  userId: string = '';

  constructor(
    private modalCtrl: ModalController,
    private loader: LoaderService,
    private adminServ: AdminService,
    private shareServ: ShareService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    console.log(this.attendanceDetail);
    this.attendanceForm = this.fb.group({
      status: ['Present', Validators.required],
      clockIn: ['', Validators.required],
      clockOut: ['', Validators.required],
      employeeId: [this.userId, Validators.required],
      guid: ['', Validators.required]
    });

    if(this.attendanceDetail != null) {
      this.attendanceForm.patchValue(this.attendanceDetail);
    }
  }

  manageForm(){
    const status = this.attendanceForm.controls['status'].value;
    if(status && status === 'Present') {
      this.attendanceForm.addControl('clockIn', new FormControl( '', Validators.required));
      this.attendanceForm.addControl('clockOut', new FormControl( '', Validators.required));
      this.attendanceForm.addControl('guid', new FormControl('', Validators.required));
    } else {
      this.attendanceForm.removeControl('clockIn');
      this.attendanceForm.removeControl('clockOut');
      this.attendanceForm.removeControl('guid');
    }
  }

  getFormDate(ctrlName: string) {
    const value = this.attendanceForm.controls[ctrlName].value;
    return value ? new Date(moment(value).format()) : '';
  }

  selectStatus(event: any){
    if(event.detail.value){
      this.manageForm();
    }
  }

  compareStatus(s1: string, s2: string){
    return s1 && s2 ? s1 === s2 : s1 == s2;
  }
  closeForm(){
    this.attendanceForm.reset();
    this.modalCtrl.dismiss(null, 'cancel');
  }

  submitForm(){
    console.log(this.attendanceForm.value, "form");
    this.loader.present('');
    const uuid = this.attendanceForm.controls['guid'].value;
    this.adminServ.updateEmployeeAttendance(uuid, this.attendanceForm.value).subscribe(res => {
      if(res) {
        this.shareServ.presentToast('Attendance updated successfully', 'top', 'success');
        this.loader.dismiss();
        this.modalCtrl.dismiss(res, this.attendanceForm.controls['status'].value);
      }
    }, (error) => {
      this.loader.dismiss();
      this.shareServ.presentToast(error.error.message, 'top', 'danger');
    });
  }

  setClockOutTime(event: DatetimeCustomEvent){
    if(event.detail.value){
      this.attendanceForm.patchValue({
        clockOut: moment.utc(new Date(event.detail.value as string)).format()
      });
    }
  }

  setClockInTime(event: DatetimeCustomEvent){
    if(event.detail.value){
      this.attendanceForm.patchValue({
        clockIn: moment.utc(new Date(event.detail.value as string)).format()
      });
    }
  }

}
