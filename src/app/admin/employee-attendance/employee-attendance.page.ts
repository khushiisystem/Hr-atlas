import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DatetimeChangeEventDetail, IonInfiniteScroll, ModalController } from '@ionic/angular';
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
import { AttendaceUpdatePage } from './attendace-update/attendace-update.page';

interface DatetimeCustomEvent extends CustomEvent {
  detail: DatetimeChangeEventDetail;
  target: HTMLIonDatetimeElement;
}

export interface AttListItem {
  employeeId: string,
  status: AttendaceStatus,
  created_date: string | Date,
  created_user: string,
  open_form: boolean,
  attendanceData: any,
  leaveData: any,
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
  leaveLoaded: boolean = false;
  workWeekLoaded: boolean = false;
  calendarLoaded: boolean = false;
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
  dateList: AttListItem[] = [];
  presents: number = 0;
  absent: number = 0;
  isFirst: boolean = false;

  constructor(
    private shareServ: ShareService,
    private loader: LoaderService,
    private adminServ: AdminService,
    private fb: FormBuilder,
    private activeRoute: ActivatedRoute,
    private modalCtrl: ModalController,
  ) { 
    const abc = localStorage.getItem('isFirst') || false;
    this.isFirst = abc === 'true' ? true : false;
  }

  ngOnInit() {
    this.activeRoute.queryParams.subscribe(param => {
      if(param){
        this.employee = param as IEmpSelect;
        this.employeeId = this.employee.guid;
        this.attendanceDate = this.today.toISOString();
        this.getCalendar();
        this.selectEmploye(this.employee);
        this.createDateList(this.attendanceDate);
      }
    });
    this.attendanceForm = this.fb.group({
      status: ['Present', Validators.required],
      clockIn: ['', Validators.required],
      clockOut: ['', Validators.required],
      employeeId: ['', Validators.required],
      guid: ['', Validators.required]
    });

    this.manageForm();
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
    this.getWorkWeek();
  }

  reseteEmployee(){
    this.employee = null as any;
    this.employeeId = '';
  }

  getWorkWeek(){
    this.workWeekLoaded =false;
    this.shareServ.employeeAssignedWorkWeek(this.employee.guid).subscribe(res => {
      if(res) {
        this.presents = 0;
        this.absent = 0;
        this.workWeekDetail = res;
        const weekOfList = this.workWeekDetail.workweekDetails.weekOff;
        this.dateList.forEach((item) => {
          if(weekOfList.includes(moment.weekdays(new Date(item.created_date).getDay()))){
            item.status = AttendaceStatus.WEEK_OFF;
            const hghIndex = this.highlightedDates.findIndex((e) => e.date === this.returnCustomDate(item.created_date));
            if(hghIndex != -1){
              this.highlightedDates.forEach((e, index) => {
                if(e.date === this.returnCustomDate(item.created_date)){
                  e.textColor = '#333';
                  e.backgroundColor = 'var(--ion-color-warning)';
                } else {
  
                }
              });
            } else {
              this.highlightedDates.push({
                date: this.returnCustomDate(item.created_date),
                textColor: '#333',
                backgroundColor: 'var(--ion-color-warning)',
              })
            }
          }
          item.status === AttendaceStatus.LEAVE || item.status === AttendaceStatus.ABSENT ? this.absent++ : this.presents++;
          this.workWeekLoaded = true;
          this.isAllLoaded();
        });
      }
    }, (error) => {
      this.workWeekLoaded =true;
      this.isAllLoaded();
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
        this.moreAttendance = res.length > 39;
        
        res.forEach((e: IClockInResponce) => {
          this.attendanceList.push(e);
          const data = {
            date: this.returnCustomDate(e.clockIn),
            textColor: this.checkStatus(e.status).color,
            backgroundColor: this.checkStatus(e.status).backgroud,
          };
          const index = this.highlightedDates.findIndex((item: IHighlightedDate) => item.date === this.returnCustomDate(e.created_date));
          if(index != -1){
            this.highlightedDates[index] = data;
          } else {
            this.highlightedDates.push(data);
          }

          this.presents = 0;
          this.absent = 0;
          this.dateList.forEach((item) => {
            if(this.checkDates(new Date(e.clockIn), new Date(item.created_date))){
              item.attendanceData = e;
              item.status = e.status;
              item.created_date = new Date(e.clockIn).toISOString();
            }
            e.status === AttendaceStatus.LEAVE || e.status === AttendaceStatus.ABSENT ? this.absent++ : this.presents++;
          });
        });
        this.openUpdatForm.length = this.attendanceList.length;
        this.openUpdatForm.fill(false);
        this.loader.dismiss();
        this.infiniteScroll.complete();
        this.attendanceLoaded = true;
        this.isAllLoaded();
      }
    }, (error) => {
      this.attendanceLoaded = true;
      this.isAllLoaded();
      this.loader.dismiss();
      this.infiniteScroll.complete();
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
        data.color = '#000';
        data.backgroud = '#2dd36f';
        break;

      case 'Absent':
        data.color = '#000';
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

  async createDateList(selectedDate: string | Date) {
    let lastDate = new Date(selectedDate);
    let beginDate = new Date(selectedDate);
    beginDate.setDate(1);
    beginDate.setHours(0,0,0);
    lastDate.setHours(23,59,59);
    this.dateList = [];
    for(let date = lastDate; date >= beginDate; date.setDate(date.getDate()-1)){
      const data: AttListItem = {
        employeeId: this.employeeId,
        status: AttendaceStatus.ABSENT,
        created_date: new Date(date),
        created_user: this.employeeId,
        open_form: false,
        attendanceData: null,
        leaveData: null,
      }
      this.dateList.push(data);
    }
    this.toggleCard(this.dateList[0]);
  }
  
  checkDates(date1: Date, date2: Date): boolean{
    if(date1.getFullYear() === date2.getFullYear()){
      if(date1.getMonth() === date2.getMonth()){
        if(date1.getDate() === date2.getDate()){
          return true
        } else {false}
      } else {
        return false
      }
    } else {
      return false
    }
    return false;
  }

  getCalendar(){
    this. calendarLoaded= false;
    this.shareServ.getEventHollyday(moment.utc(this.attendanceDate).format()).subscribe(res => {
      if(res) {
        if(res.length < 1) {
          this. calendarLoaded= true;
          this.isAllLoaded();
          this.loader.dismiss();
          return;
        } else {
          this.absent = 0;
          this.presents = 0;
          this.eventsList = res;
          for (let a = 0; a < res.length; a++) {
            this.highlightedDates = [];
            const selectDate : IHighlightedDate = {
              date: this.returnCustomDate(res[a].eventDate),
              backgroundColor: '#f58f0d',
              textColor: '#000',
            }
            this.dateList.forEach((e) => {
              if(this.checkDates(new Date(res[a].eventDate), new Date(e.created_date)) && e.status != AttendaceStatus.PRESENT){
                e.leaveData = res[a];
                e.created_date = new Date(res[a].eventDate).toISOString();
              }
              e.status === AttendaceStatus.HOLiDAY ? this.presents++ : this.absent++;
            });
            const index = this.highlightedDates.findIndex((d: IHighlightedDate) => d.date === this.returnCustomDate(res[a].eventDate))
            if(index != -1){
              this.highlightedDates[index] = selectDate;
            } else {
              this.highlightedDates.push(selectDate);
            }
          }
          this. calendarLoaded= true;
          this.isAllLoaded();
        }
      }
    }, (error) => {
      this. calendarLoaded= true;
      this.isAllLoaded();
    })
  }


  getLogs(){
    this.leaveLoaded = false;
    this.isAllLoaded();
    const data = {employeeId: this.employee.guid};
    this.shareServ.getLeaveList(data, 0 * 200, 200).subscribe(res => {
      if(res) {
        for (let a = 0; a < res.length; a++) {
          if(res[a].status !== 'Cancel'){
            let startDate = new Date(res[a].startDate);
            const endDate = new Date(res[a].endDate || new Date);
            while (startDate <= endDate) {
              const selectDate : IHighlightedDate = {
                date: this.returnCustomDate(startDate),
                backgroundColor: res[a].status === 'Pending' ? '#ef7373' : 'red',
                textColor: '#333',
              }
              const index = this.highlightedDates.findIndex((d: IHighlightedDate) => d.date === this.returnCustomDate(startDate))
              if(index != -1){
                this.highlightedDates[index] = selectDate;
              } else {
                this.highlightedDates.push(selectDate);
              }
              this.presents = 0;
              this.absent = 0;
              this.dateList.forEach((e) => {
                if(this.checkDates(startDate, new Date(e.created_date)) && e.status != AttendaceStatus.PRESENT){
                  e.leaveData = res[a];
                  e.created_date = new Date(startDate).toISOString();
                  e.status = AttendaceStatus.LEAVE;
                }
                e.status === AttendaceStatus.LEAVE || e.status === AttendaceStatus.ABSENT ? this.absent++ : this.presents++;
              });
              startDate.setDate(startDate.getDate() + 1);
            }
          }          
        }
        this.leaveLoaded = true;
        this.isAllLoaded()
      }
    }, (error) => {
      this.leaveLoaded = true;
      this.isAllLoaded();
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

  markPresent(event: Event, itemData: AttListItem) {
    event.preventDefault();
    event.stopPropagation();
    this.loader.present('');
    this.adminServ.markAttendEmp(this.employeeId, {id: ''}, new Date(itemData.created_date)).subscribe(res => {
      if(res && res.status === 'Present'){
        itemData.attendanceData = res,
        itemData.status = res.status;
        itemData.created_date = new Date(res.clockIn).toISOString();
        itemData.created_user = res.created_user;
        this.absent--;
        this.presents++;
        // const listIndex = this.dateList.findIndex(e => moment(e.created_date).date() === moment(markDate).date());
        // this.dateList[listIndex] = data;
        const calindex = this.highlightedDates.findIndex((item) => this.checkDates(new Date(item.date), new Date(itemData.created_date)));
        if(calindex != -1){
          this.highlightedDates[calindex].backgroundColor = '#2dd36f';
          this.highlightedDates[calindex].textColor = '#000';
        } else {
          this.highlightedDates.push({
            date: this.returnCustomDate(res.clockIn),
            backgroundColor: '#2dd36f',
            textColor: '#000',
          });
        }
        this.shareServ.presentToast('Marked present', 'top', 'success');
        this.loader.dismiss();
      } else {
        this.loader.dismiss();
      }
    }, (error) => {
      this.shareServ.presentToast(error.errorMessage, 'top', 'danger');
      this.loader.dismiss();
    });
  }
  

  selectDate(event: CustomEvent){
    if(event.detail.value){
      this.pageIndex = 0;
      const xyz = new Date();
      let monthDate = new Date(this.attendanceDate);
      if(monthDate.getFullYear() <= xyz.getFullYear() && monthDate.getMonth() < xyz.getMonth()){
        monthDate.setFullYear(monthDate.getFullYear(), monthDate.getMonth()+1, 0);
      }
      if(monthDate.getFullYear() != xyz.getFullYear()){this.getCalendar();}
      this.createDateList(monthDate);
      this.getMonthLyAttendance();
      this.getLogs();
      this.getWorkWeek();
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

  onMouseMove(event: MouseEvent) {
    this.skipTips();
  }

  toggleCard(item: AttListItem){
    if(item.attendanceData != null || item.leaveData != null){
      item.open_form = !item.open_form
    }
  }

  async updateAttendance(event: Event, attendanceData: any){
    event.stopPropagation();
    event.preventDefault();
    const updateForm = await this.modalCtrl.create({
      component: AttendaceUpdatePage,
      backdropDismiss: false,
      cssClass: 'updateFormAtt',
      handleBehavior: 'cycle',
      mode: 'md',
      componentProps: {attendanceDetail: attendanceData, userId: this.employeeId},
    });

    (await updateForm).present();

    (await updateForm).onDidDismiss().then(result => {
      console.log(result, 'result');
    })
  }

  skipTips(){
    localStorage.setItem('isFirst' , String(false));
    this.isFirst = false;
  }

  checkLeaveType(leaveITem: ILeaveLogsResponse){
    return leaveITem.status;
  }

  isAllLoaded(): boolean{
    return this.leaveLoaded && this.workWeekLoaded && this.calendarLoaded && this.attendanceLoaded;
  }
}
