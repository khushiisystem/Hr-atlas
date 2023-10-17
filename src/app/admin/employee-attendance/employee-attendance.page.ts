import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DatetimeChangeEventDetail, IonInfiniteScroll } from '@ionic/angular';
import * as moment from 'moment';
import { IHighlightedDate } from 'src/app/employee/attendance/attendance.page';
import { AttendaceStatus } from 'src/app/interfaces/enums/leaveCreditPeriod';
import { IClockInResponce } from 'src/app/interfaces/response/IAttendanceSetup';
import { IEmplpoyeeWorWeek } from 'src/app/interfaces/response/IEmplpoyeeWorWeek';
import { IHollydayResponse, ILeaveLogsResponse } from 'src/app/interfaces/response/ILeave';
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
  attendanceDateList: IClockInResponce[] = [];
  eventsList: IHollydayResponse[] = [];
  highlightedDates: Array<IHighlightedDate> = [];
  expandedCards: number[] = [0];
  updatedAttendance!: IClockInResponce;
  attendanceForm!: FormGroup;
  openUpdatForm: boolean[] = [false];
  dateModal: boolean = false;
  showCalendar: boolean = false;
  attendanceDate: any;
  today: Date = new Date();
  workWeekDetail!: IEmplpoyeeWorWeek;


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
    this.attendanceDate = this.today.toISOString();

    this.manageForm();
    this.getCalendar();
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

  selectEmploye(event: IEmpSelect) {
    this.employee = event;
    this.employeeId = event.guid;
    this.pageIndex = 0;
    this.attendanceDate = this.today.toISOString();
    this.getMonthLyAttendance();
    this.getLogs();
  }

  reseteEmployee(){
    this.employee = null as any;
    this.employeeId = '';
  }

  getWorkWeek(){
    this.shareServ.employeeAssignedWorkWeek(this.employee.guid).subscribe(res => {
      if(res) {
        this.workWeekDetail = res;
      }
    }, (error) => {
    });
  }

  getMonthLyAttendance(){
    this.attendanceLoaded = false;
    this.loader.present('');
    if(this.pageIndex === 0){this.attendanceList = [];}
    this.shareServ.monthlyAttendance(this.employeeId, this.attendanceDate, this.pageIndex * 40, 40).subscribe(res => {
      if(res.length < 1){
        this.moreAttendance = false;
        this.attendanceLoaded = true;
        this.infiniteScroll.complete();
        this.loader.dismiss();
        return;
      } else {
        this.attendanceLoaded = true;
        this.openUpdatForm.length = this.attendanceList.length;
        this.openUpdatForm.fill(false);        
        this.moreAttendance = res.length > 39;
        
        res.forEach((e: IClockInResponce) => {
          this.attendanceList.push(e);
          const index = this.highlightedDates.findIndex((a: IHighlightedDate) => a.date === this.returnCustomDate(e.created_date));
            if(index != -1){
              this.highlightedDates[index] = {
                date: this.returnCustomDate(e.created_date),
                textColor: this.checkStatus(e.status).color,
                backgroundColor: this.checkStatus(e.status).backgroud,
              };
            } else {
              this.highlightedDates.push({
                date: this.returnCustomDate(e.created_date),
                textColor: this.checkStatus(e.status).color,
                backgroundColor: this.checkStatus(e.status).backgroud,
              });
            }
        });
        this.loader.dismiss();
        this.infiniteScroll.complete();
      }
    }, (error) => {
      this.attendanceLoaded = true;
      this.loader.dismiss();
      this.infiniteScroll.complete();
    });
  }

  getEmployeeAttendance(){
    this.attendanceLoaded = false;
    this.loader.present('');
    this.highlightedDates = [];
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
            // console.log(this.highlightedDates)
            const index = this.highlightedDates.findIndex((a: IHighlightedDate) => a.date === this.returnCustomDate(res[i].created_date));
            if(index != -1){
              this.highlightedDates[index] = {
                date: this.returnCustomDate(res[i].created_date),
                textColor: this.checkStatus(res[i].status).color,
                backgroundColor: this.checkStatus(res[i].status).backgroud,
              };
            } else {
              this.highlightedDates.push({
                date: this.returnCustomDate(res[i].created_date),
                textColor: this.checkStatus(res[i].status).color,
                backgroundColor: this.checkStatus(res[i].status).backgroud,
              });
            }
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
    if(this.workWeekDetail){
      const weekOff = this.workWeekDetail.workweekDetails.weekOff;
      return weekOff.includes(moment.weekdays()[new Date(dateTime).getDay()]);      
    } else{
      return  (new Date(dateTime).getDay() === 0);
    }
  }

  checkStatus(status: string) {
    let data = {
      color: '',
      backgroud: ''
    };
    switch (status) {
      case 'Present':
        data.color = '#fff';
        data.backgroud = '#2dd36f';
        break;

      case 'Absent':
        data.color = '#fff';
        data.backgroud = 'red';
        break;
    
      default:
        break;
    }
    return data;
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

      case 'Holiday':
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

  async createDateList(startDate: string | Date, endDate: string | Date) {
    let beginDate = new Date(moment(startDate).format());
    let lastDate = new Date(moment(endDate).format());
    this.attendanceDateList = [];

    while(beginDate <= lastDate) {
      const newDate = new Date();
      newDate.setFullYear(new Date(endDate).getFullYear(), new Date(endDate).getMonth(), lastDate.getDate());
      const data = {
        clockIn: '',
        clockOut: '',
        employeeId: this.employeeId,
        status: AttendaceStatus.ABSENT,
        workDuration: '',
        workingTime: '',
        guid: '',
        created_date: moment.utc(newDate).format(),
        created_user: this.employeeId,
        isDeleted: false,
        inTime: '',
        outTime: '',
        EmployeeDetails: {} as any,
        gracePeriod: 0
      }
      const listIndex = this.attendanceList.findIndex((attendDate: IClockInResponce) => checkDates(new Date(attendDate.created_date), newDate));
      if(listIndex != -1){
        this.attendanceDateList.push(this.attendanceList[listIndex]);
      } else {
        this.attendanceDateList.push(data);
      }
      lastDate.setDate(lastDate.getDate() - 1);
    }


    function checkDates(date1: Date, date2: Date): boolean{
      if(new Date(date1).getFullYear() === new Date(date2).getFullYear()){
        if(new Date(date1).getMonth() === new Date(date2).getMonth()){
          if(new Date(date1).getDate() === new Date(date2).getDate()){
            return true
          } else {false}
        } else {
          return false
        }
      } else {
        return false
      } 
      return false
    }
  }
  getCalendar(){
    this.shareServ.getEventHollyday(moment.utc(this.attendanceDate).format()).subscribe(res => {
      if(res) {
        if(res.length < 1) {
          this.loader.dismiss();
          return;
        } else {
          this.eventsList = res;
          console.log(this.highlightedDates);
          for (let a = 0; a < res.length; a++) {
            this.highlightedDates = [];
            const selectDate : IHighlightedDate = {
              date: this.returnCustomDate(res[a].eventDate),
              backgroundColor: '#f58f0d',
              textColor: '#000',
            }
            const index = this.highlightedDates.findIndex((d: IHighlightedDate) => d.date === this.returnCustomDate(res[a].eventDate))
            if(index != -1){
              this.highlightedDates[index] = selectDate;
            } else {
              this.highlightedDates.push(selectDate);
            }
          }
          console.log(this.highlightedDates);
        }
      }
    }, (error) => {})
  }


  getLogs(){
    const data = {employeeId: this.employee.guid};
    this.shareServ.getLeaveList(data, 0 * 200, 200).subscribe(res => {
      if(res) {
        const leaveLogs: ILeaveLogsResponse[] = res;

        for (let a = 0; a < res.length; a++) {
          console.log(res[a].endDate);
          if(res[a].status !== 'Cancel'){
            const startDate = new Date(res[a].startDate);
            const endDate = new Date(res[a].endDate || new Date);
            while (startDate <= endDate) {
              const selectDate : IHighlightedDate = {
                date: this.returnCustomDate(startDate),
                backgroundColor: res[a].status === 'Pending' ? '#ef7373' : 'red',
                textColor: '#fff',
              }
              const index = this.highlightedDates.findIndex((d: IHighlightedDate) => d.date === this.returnCustomDate(startDate))
              if(index != -1){
                this.highlightedDates[index] = selectDate;
              } else {
                this.highlightedDates.push(selectDate);
              }
              startDate.setDate(startDate.getDate() + 1);
            }
          }          
        }
      }
    });
  }

  returnCustomDate(selectDate: string | Date){
    const old_Date = selectDate;
    const dateObject = new Date(old_Date);
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, '0');
    const day = String(dateObject.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  

  selectDate(event: CustomEvent) {
    if(event.detail.value){
      this.pageIndex = 0;
      this.getMonthLyAttendance();
    }
  }

  getMonthYear() {
    let customDate = '';
    if(this.attendanceDate){
      customDate = `${moment.monthsShort()[new Date(this.attendanceDate).getMonth()]} ${new Date(this.attendanceDate).getFullYear()}`;
    }
    return customDate;
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
        this.getMonthLyAttendance();
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
      this.getMonthLyAttendance();
    }
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }
}
