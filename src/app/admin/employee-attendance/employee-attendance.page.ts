import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatetimeChangeEventDetail, IonInfiniteScroll } from '@ionic/angular';
import * as moment from 'moment';
import { IClockInResponce } from 'src/app/interfaces/response/IAttendanceSetup';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';
import { IEmpSelect } from 'src/app/share/employees/employees.page';

interface DatetimeCustomEvent extends CustomEvent {
  detail: DatetimeChangeEventDetail;
  target: HTMLIonDatetimeElement;
}

@Component({
  selector: 'app-employee-attendance',
  templateUrl: './employee-attendance.page.html',
  styleUrls: ['./employee-attendance.page.scss'],
})
export class EmployeeAttendancePage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  employeeId: string = '';
  employee!: IEmpSelect;
  attendanceLoaded: boolean = false;
  moreAttendance: boolean = true;
  pageIndex: number = 0;
  attendanceList: IClockInResponce[] = [];
  expandedCards: number[] = [0];
  updatedAttendance!: IClockInResponce;
  attendanceForm!: FormGroup;
  openUpdatForm: boolean[] = [false];


  constructor(
    private shareServ: ShareService,
    private loader: LoaderService,
    private adminServ: AdminService,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.attendanceForm = this.fb.group({
      status: ['Present', Validators.required],
      clockIn: ['', Validators.required],
      clockOut: ['', Validators.required],
      employeeId: ['', Validators.required],
      guid: ['', Validators.required]
    });

    this.manageForm();
  }

  selectEmploye(event: IEmpSelect) {
    this.employee = event;
    this.employeeId = event.guid;
    this.pageIndex = 0;
    this.getEmployeeAttendance();
  }

  manageForm(){
    const status = this.attendanceForm.controls['status'].value;
    if(status && status === 'Present') {
      this.attendanceForm.addControl('clockIn', new FormControl( '', Validators.required));
      this.attendanceForm.addControl('clockOut', new FormControl( '', Validators.required));
    } else {
      this.attendanceForm.removeControl('clockIn');
      this.attendanceForm.removeControl('clockOut');
    }
  }

  getFormDate(ctrlName: string) {
    const value = this.attendanceForm.controls[ctrlName].value;
    return value ? new Date(moment(value).format()) : '';
  }

  reseteEmployee(){this.employee = null as any; this.employeeId = '';}

  getEmployeeAttendance(){
    this.attendanceLoaded = false;
    this.loader.present('');
    if(this.pageIndex === 0){this.attendanceList = [];}
    this.shareServ.employeeAttendance(this.employeeId, this.pageIndex * 20, 20).subscribe(res => {
      if(res) {
        if(res.length < 1){
          this.attendanceLoaded = true;
          this.moreAttendance = false;
          this.infiniteScroll.complete();
          this.loader.dismiss();
          return;
        } else {
          for(let i=0; i<res.length; i++){
            this.attendanceList.push(res[i]);
          }
          this.openUpdatForm.length = this.attendanceList.length;
          this.openUpdatForm.fill(false);
          
          this.moreAttendance = res.length > 19;
          this.attendanceLoaded = true;
          this.infiniteScroll.complete();
          this.loader.dismiss();
        }
      }
    }, (error) => {
      console.log(error, "error");
      this.infiniteScroll.complete();
      this.moreAttendance = false;
      this.attendanceLoaded = true;
      this.loader.dismiss();
    });
  }


  getWeek(dateString: string | Date){
    const weekName = moment.weekdays().filter((e:string, index) => index === new Date(dateString).getDay());
    return `${new Date(dateString).getDate()} ${weekName}`;
  }

  isWeekOff(dateTime: string | Date){
    return new Date(moment(dateTime).format()).getDay() === 0;
  }
  getStatus(status: string){
    let color = '';
    switch (status) {
      case 'Present':
        color = 'success'
        break;

      case 'Leave':
        color = 'warning'
        break;

      case 'Hollyday':
        color = 'warning'
        break;

      case 'Absent':
        color = 'danger'
        break;
    
      default:
        color = 'danger'
        break;
    }
    return color;
  }

  selectStatus(event: any){
    if(event.detail.value){
      this.manageForm();
    }
  }

  openForm(item: IClockInResponce, index: number){
    this.openUpdatForm.fill(false);
    this.attendanceForm.patchValue(item);
    this.updatedAttendance = item;
    this.openUpdatForm[index] = true;
  }
  closeForm(){
    this.openUpdatForm.fill(false);
    this.updatedAttendance = {} as any;
    this.attendanceForm.reset();
  }

  submitForm(){
    console.log(this.attendanceForm.value, "form");
    this.loader.present('');
    const uuid = this.attendanceForm.controls['guid'].value;
    this.adminServ.updateEmployeeAttendance(uuid, this.attendanceForm.value).subscribe(res => {
      if(res) {
        console.log(res);
        this.shareServ.presentToast('Attendance updated successfully', 'top', 'success');
        this.loader.dismiss();
        this.pageIndex = 0;
        this.getEmployeeAttendance();
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

  collapseCard(index: number) {
    const cardIndex = this.expandedCards.findIndex((e: number) => e === index);
    if(cardIndex != -1){
      this.expandedCards.splice(cardIndex, 1);
    } else {
      this.expandedCards.push(index);
    }
  }

  compareStatus(s1: string, s2: string){
    return s1 && s2 ? s1 === s2 : s1 == s2;
  }

  goBack() {history.back();}

  loadData(event: any){
    if(this.moreAttendance){
      this.pageIndex++;
      this.getEmployeeAttendance();
    }
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }
}
