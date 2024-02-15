import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatetimeCustomEvent, IonContent } from '@ionic/angular';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { AttendaceStatus } from 'src/app/interfaces/enums/leaveCreditPeriod';
import { IClockInResponce } from 'src/app/interfaces/response/IAttendanceSetup';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { IEmplpoyeeWorWeek } from 'src/app/interfaces/response/IEmplpoyeeWorWeek';
import { IHollydayResponse, ILeaveLogsResponse } from 'src/app/interfaces/response/ILeave';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { RoleStateService } from 'src/app/services/roleState.service';
import { ShareService } from 'src/app/services/share.service';
import { IEmpSelect } from 'src/app/share/employees/employees.page';

export interface IHighlightedDate {
  date: Date | string,
  textColor?: string,
  backgroundColor?: string,
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
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
})
export class AttendancePage implements OnInit, OnDestroy {
  employeeId: string = '';
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
  tabsList = [{value: "status", label: "Status"}, {value: "listview", label: "List View"},{value: "calendarView", label: "Calendar View"}, {value: "leaves", label: "Leaves"}];
  employeeDetail!: IEmployeeResponse;

  constructor(
    private shareServ: ShareService,
    private loader: LoaderService,
    private adminServ: AdminService,
    private activeRoute: ActivatedRoute,
    private rolseStateServ: RoleStateService,
  ) {
    this.minDate.setFullYear(2000, 1, 1);
  }

  ngOnInit() {
    const backTab = history.state?.tab ?? "listView";
    console.log(backTab);
    
    if(this.tabsList.includes(backTab)){
      this.activeTab = backTab;
    }
    this.employeeId = this.activeRoute.snapshot.params?.["id"];
    this.attendanceDate = this.today.toISOString();
    if(this.employeeId.trim() !== ''){
      this.fethcDetail();
      this.createDateList(this.attendanceDate);
      this.getCalendar();
      this.getMonthLyAttendance();
      this.getLogs();
      this.getWorkWeek();
    }
  }

  ionViewWillEnter(){
  }

  fethcDetail(){
    this.shareServ.getEmployeeById(this.employeeId).subscribe(res => {
      if(res){
        this.employeeDetail = res;
      }
    });
  }

  get getPresent(): number {
    return this.dateList.reduce((pres, item) => {
      return item.status === AttendaceStatus.PRESENT || item.status === AttendaceStatus.WEEK_OFF || item.status === AttendaceStatus.HOLiDAY ? pres + 1 : pres;
    }, 0);
  }
  get getLeaves(): number {
    return this.dateList.reduce((leave, item) => {
      return item.status === AttendaceStatus.LEAVE ? leave + 1 : leave;
    }, 0);
  }
  get getAbsent(): number {
    return this.dateList.reduce((abs, item) => {
      return item.status === AttendaceStatus.ABSENT ? abs + 1 : abs;
    }, 0);
  }
  get getLastDate(): number {
    return new Date(moment(this.attendanceDate).endOf('month').format()).getDate();
  }

  get userRole() {
    let role = ""
    this.rolseStateServ.getState().subscribe(res => {
      if(res){
        role = res.trim();
      }
    });
    return role;
  }

  reseteEmployee(){
    this.employee = null as any;
    this.employeeId = '';
  }

  getWorkWeek(){
    this.workWeekLoaded =false;
    this.apiSubscription = this.shareServ.employeeAssignedWorkWeek(this.employeeId).subscribe(res => {
      if(res) {
        this.employee = {...res.employeeDetails, guid: res.employeeId};
        this.presents = 0;
        this.absent = 0;
        this.workWeekDetail = res;
        this.addWeekOffDays();
        this.workWeekLoaded = true;
      }
    }, (error) => {
      this.workWeekLoaded =true;
    });
  }

  getMonthLyAttendance(){
    this.attendanceLoaded = false;
    this.loader.present('');
    if(this.pageIndex === 0){this.attendanceList = [];}
    this.apiSubscription = this.shareServ.monthlyAttendance(this.employeeId, this.attendanceDate, this.pageIndex * 40, 40).subscribe(res => {
      if(res.length < 1){
        this.moreAttendance = false;
        this.attendanceLoaded = true;
        this.loader.dismiss();
        return;
      } else {
        this.moreAttendance = res.length > 39;
        if(this.moreAttendance){
          this.pageIndex++;
          this.getMonthLyAttendance();
        }
        
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
            item.status === AttendaceStatus.LEAVE || e.status === AttendaceStatus.ABSENT ? this.absent++ : this.presents++;
          });
        });
        this.loader.dismiss();
        this.attendanceLoaded = true;
      }
    }, (error) => {
      this.attendanceLoaded = true;
      this.moreAttendance = false;
      this.loader.dismiss();
    });
  }

  isWeekOff(dateTime: string | Date){
    if(this.workWeekDetail){
      const weekOff = this.workWeekDetail.workweekDetails.weekOff;
      return weekOff.includes(moment(dateTime).format("dddd"));
    } else{
      return  (new Date(dateTime).getDay() === 0);
    }
  }

  addWeekOffDays(){
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
            }
          });
        } else {
          this.highlightedDates.push({
            date: this.returnCustomDate(item.created_date),
            textColor: '#333',
            backgroundColor: 'var(--ion-color-warning)',
          });
        }
      }
      item.status === AttendaceStatus.LEAVE || item.status === AttendaceStatus.ABSENT ? this.absent++ : this.presents++;
    });
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

  async createDateList(selectedDate: string | Date) {
    let beginDate = new Date(moment(selectedDate).startOf('month').format());
    let lastDate = new Date(selectedDate);

    this.dateList = [];
    for(let date = lastDate; date >= beginDate; date.setDate(date.getDate()-1)){
      const data: AttListItem = {
        employeeId: this.employeeId,
        status: this.eventsList.findIndex((item) => this.checkDates(new Date(item.eventDate), date)) != -1 ? AttendaceStatus.HOLiDAY : AttendaceStatus.ABSENT,
        created_date: new Date(date),
        created_user: this.employeeId,
        open_form: false,
        attendanceData: null,
        leaveData: null,
      }
      this.dateList.push(data);
    }
    this.toggleCard(this.dateList[0]);
    this.generateDates(selectedDate);
  }

  generateDates(selectedDate: string | Date) {
    const startOfMonth = moment(selectedDate).startOf('month');
    const endOfMonth = moment(selectedDate).endOf('month');
    const currentDate = moment(startOfMonth);

    this.dates = [];

    while (currentDate.isSameOrBefore(endOfMonth)) {
      let weekIndex = currentDate.week() - startOfMonth.week() + (startOfMonth.weekday() === 0 ? 1 : 0);
      let dayIndex = currentDate.weekday();
  
      if (weekIndex < 0) {
        weekIndex += moment(currentDate).subtract(1, 'year').weeksInYear();
      }

      if (!this.dates[weekIndex]) {
        this.dates[weekIndex] = [];
      }

      this.dates[weekIndex][dayIndex] = moment(currentDate);
      currentDate.add(1, 'day');
    }

    this.dates = this.dates.map((week) => week.map((day) => (day ? day : '')));
  }
  
  checkDates(date1: Date, date2: Date): boolean{
    return moment(date1).isSame(date2, 'year') && moment(date1).isSame(date2, 'month') && moment(date1).isSame(date2, 'date');
  }

  getCalendar(){
    this. calendarLoaded= false;
    this.apiSubscription = this.shareServ.getEventHollyday(moment.utc(this.attendanceDate).format()).subscribe(res => {
      if(res) {
        if(res.length < 1) {
          this. calendarLoaded= true;
          this.loader.dismiss();
          return;
        } else {
          this.absent = 0;
          this.presents = 0;
          this.eventsList = res;
          for (let a = 0; a < res.length; a++) {
            const selectDate : IHighlightedDate = {
              date: this.returnCustomDate(res[a].eventDate),
              backgroundColor: '#f58f0d',
              textColor: '#000',
            }
            this.dateList.forEach((e) => {
              if(this.checkDates(new Date(res[a].eventDate), new Date(e.created_date)) && e.status != AttendaceStatus.PRESENT){
                // e.leaveData = res[a];
                e.created_date = new Date(res[a].eventDate).toISOString();
                e.status = AttendaceStatus.HOLiDAY;
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
        }
      }
    }, (error) => {
      this. calendarLoaded= true;
    })
  }


  getLogs(){
    this.leaveLoaded = false;
    this.fullLeaves = [];
    this.halfLeaves = [];
    this.apiSubscription = this.shareServ.getMonthLeaves(this.employeeId, moment(this.attendanceDate).utc().format()).subscribe(res => {
      this.leaveLogs = res;
      for (let a = 0; a < res.length; a++) {
        console.log(this.highlightedDates);
        const fullDayLeaves = res[a].fullDayDates || [];
        const halfDayLeaves = res[a].halfDayDates || [];
        if(res[a].status !== 'Cancel'){
          fullDayLeaves.forEach((dates) => {
            if (moment(this.attendanceDate).isSame(dates, 'year') && moment(this.attendanceDate).isSame(dates, 'month')) {
              this.updateHilghtes(dates, res[a].status, true);
            }
          });
          halfDayLeaves.forEach((dates) => {
            if (moment(this.attendanceDate).isSame(dates, 'year') && moment(this.attendanceDate).isSame(dates, 'month')) {
              this.updateHilghtes(dates, res[a].status, false);
            }
          });
          [...fullDayLeaves, ...halfDayLeaves].forEach((item) => {
            this.presents = 0;
            this.absent = 0;
            this.dateList.forEach((e) => {
              if(this.checkDates(new Date(item), new Date(e.created_date)) && e.status != AttendaceStatus.PRESENT){
                e.leaveData = res[a];
                e.created_date = new Date(item).toISOString();
                e.status = AttendaceStatus.LEAVE;
              }
              e.status === AttendaceStatus.LEAVE || e.status === AttendaceStatus.ABSENT ? this.absent++ : this.presents++;
            });
          });
        }
      }
      this.leaveLoaded = true;
    }, (error) => {
      this.leaveLoaded = true;
    });
  }

  updateHilghtes(inputDate: string | Date, status: 'Pending' | 'Reject' | 'Accept' | 'Cancel', isFullDay: boolean){
    const selectDate : IHighlightedDate = {
      date: this.returnCustomDate(inputDate),
      backgroundColor: status === 'Pending' ? '#ef7373' : isFullDay ? 'red' : 'pink',
      textColor: '#333',
    }
    const leavesArray = isFullDay ? this.fullLeaves : this.halfLeaves;
    const index = leavesArray.findIndex((d: IHighlightedDate) => d.date === this.returnCustomDate(inputDate));
    if(index != -1){
      leavesArray[index] = selectDate;
    } else {
      leavesArray.push(selectDate);
    }
    console.log(this.fullLeaves, this.halfLeaves);    
    this.highlightedDates = [...this.highlightedDates, ...this.fullLeaves, ...this.halfLeaves];
    
  }

  getDayType(inputDate?: string | Date, leaveId?: string) {
    if (inputDate && this.fullLeaves.some((item) => this.checkDates(new Date(item.date), new Date(inputDate)))) {
      return "Full Day";
    } else if (inputDate && this.halfLeaves.some((item) => this.checkDates(new Date(item.date), new Date(inputDate)))) {
      return "Half Day";
    } else if(leaveId) {
      return this.leaveLogs[this.leaveLogs.findIndex((item) => item.guid === leaveId)].dayType;
    } else {
      return "";
    }
  }

  filterLogs(leaveType: string) {
    let fullDays: any[] = [];
    let halfDays: any[] = [];
    this.leaveLogs.forEach((item) => {
      if(item.leaveType === leaveType){
        item.fullDayDates.forEach((item) => {
          if(moment(item).isSame(this.attendanceDate, 'year') && moment(item).isSame(this.attendanceDate, 'month') && !fullDays.includes(moment(item).format('DD-MM-YYYY'))){
            fullDays.push(moment(item).format('DD-MM-YYYY'));
          }
        });
        item.halfDayDates.forEach((item) => {
          if(moment(item).isSame(this.attendanceDate, 'year') && moment(item).isSame(this.attendanceDate, 'month') && !halfDays.includes(moment(item).format('DD-MM-YYYY'))){
            halfDays.push(moment(item).format('DD-MM-YYYY'));
          }
        });
      }
    });    
    return (fullDays.length + (halfDays.length * 0.5));
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
  
  selectDate(event: DatetimeCustomEvent){
    if(event.detail.value){
      this.fetchAll(event.detail.value as string);
    }
  }
  
  fetchAll(dateStr: string){
    this.pageIndex = 0;
    let monthDate = new Date(dateStr);
    this.attendanceDate = monthDate.toISOString();
    if(monthDate.getFullYear() < this.today.getFullYear() || monthDate.getMonth() < this.today.getMonth()){
      monthDate.setFullYear(monthDate.getFullYear(), monthDate.getMonth()+1, 0);
    }
    this.highlightedDates = [];
    this.eventsList.forEach((event) =>{
      const selectDate : IHighlightedDate = {
        date: this.returnCustomDate(event.eventDate),
        backgroundColor: '#f58f0d',
        textColor: '#000',
      }
      const index = this.highlightedDates.findIndex((d: IHighlightedDate) => d.date === this.returnCustomDate(event.eventDate))
      if(index != -1){
        this.highlightedDates[index] = selectDate;
      } else {
        this.highlightedDates.push(selectDate);
      }
    });

    this.createDateList(monthDate);
    this.getMonthLyAttendance();
    this.getLogs();
    if(this.workWeekDetail){
      this.addWeekOffDays();
    }
  }

  getMonthYear() {
    let customDate = '';
    if(this.attendanceDate){
      customDate = `${moment.monthsShort()[new Date(this.attendanceDate).getMonth()]} ${new Date(this.attendanceDate).getFullYear()}`;
    }
    return customDate;
  }

  collapseCard(index: number) {
    const cardIndex = this.expandedCards.findIndex((e: number) => e === index);
    if(cardIndex != -1){
      this.expandedCards.splice(cardIndex, 1);
    } else {
      this.expandedCards.push(index);
    }
  }

  goBack() {history.back();}


  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }

  toggleCard(item: AttListItem){
    if(item.attendanceData != null || item.leaveData != null){
      item.open_form = !item.open_form
    }
  }

  isAllLoaded(): boolean{
    return this.leaveLoaded && this.workWeekLoaded && this.calendarLoaded && this.attendanceLoaded;
  }

  incrementMonth() {
    const previousMonth = new Date(this.attendanceDate);
    const currentMonth = moment(previousMonth).add(1, "month");
    if(moment(currentMonth).isSameOrAfter(this.today, "year") && moment(currentMonth).isSame(this.today, "month")){
      this.attendanceDate = new Date(this.today).toISOString();
    } else {
      this.attendanceDate = new Date(moment(currentMonth).endOf("month").format()).toISOString();
    }
    this.fetchAll(this.attendanceDate);
    if(!moment(previousMonth).isSame(this.attendanceDate, "year")){
      this.getCalendar();
    }
  }

  decrementMonth() {
    const previousMonth = new Date(this.attendanceDate);
    const currentMonth = moment(previousMonth).subtract(1, "month");
    this.attendanceDate = new Date(moment(currentMonth).endOf("month").format()).toISOString();
    this.fetchAll(this.attendanceDate);
    if(!moment(previousMonth).isSame(this.attendanceDate, "year")){
      this.getCalendar();
    }
  }

  incrementYear() {
    const updateYear = moment(this.attendanceDate).add(1, 'year');
    if(moment(updateYear).isAfter(this.today, "month")){
      this.attendanceDate = new Date(this.today).toISOString();
    } else{
      const atDate = moment(updateYear).endOf("month").format();
      this.attendanceDate = new Date(atDate).toISOString();
    }
    this.getCalendar();
    this.fetchAll(this.attendanceDate);
  }

  decrementYear() {
    const currentMonth = moment(this.attendanceDate).subtract(1, 'year');
    const atDate = moment(currentMonth).endOf("month").format();
    this.attendanceDate = new Date(atDate).toISOString();
    this.getCalendar();
    this.fetchAll(this.attendanceDate);
  }

  getMomentDate(inputDate: string | moment.Moment){
    if(inputDate instanceof moment){
      return inputDate.format('D');
    } else {
      return '';
    }
  }

  getStatusByDate(date1: string | moment.Moment){
    if(date1 == ''){return null;}
    const index = this.dateList.findIndex((event: AttListItem) => moment(date1).format('yyyy/MM/DD') === moment(event.created_date).format('yyyy/MM/DD'));
    const fullLeaveIndex = this.fullLeaves.findIndex((item) => moment(item.date).isSame(date1));
    const halfLeaveIndex = this.halfLeaves.findIndex((item) => moment(item.date).isSame(date1));
    if(index != -1){
      return this.dateList[index];
    } else {
      if(halfLeaveIndex != -1 || fullLeaveIndex != -1){
        return {status: fullLeaveIndex != -1 ? AttendaceStatus.LEAVE : AttendaceStatus.HALF_DAY}
      } else {
        return {status: ""}
      }
    }
  }

  isNextMonth(){
    return (moment(this.today).year() <= moment(this.attendanceDate).year()) && (moment(this.attendanceDate).isAfter(this.today, 'month') || moment(this.attendanceDate).isSame(this.today, 'month'));
  }
  isNextYear(){
    return moment(this.today).year() - moment(this.attendanceDate).year() >= 1;
  }
  ngOnDestroy(): void {
    this.apiSubscription.unsubscribe();
  }

  get isJoinedDate(): boolean {
    return this.employeeDetail && moment(this.attendanceDate).subtract(1, "month").isBefore(this.employeeDetail.created_date);
  }

}
