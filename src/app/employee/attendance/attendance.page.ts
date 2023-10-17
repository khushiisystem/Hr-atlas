import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonInfiniteScroll } from '@ionic/angular';
import * as moment from 'moment';
import { AttendaceStatus } from 'src/app/interfaces/enums/leaveCreditPeriod';
import { IClockInResponce } from 'src/app/interfaces/response/IAttendanceSetup';
import { IEmplpoyeeWorWeek } from 'src/app/interfaces/response/IEmplpoyeeWorWeek';
import { IHollydayResponse, ILeaveLogsResponse } from 'src/app/interfaces/response/ILeave';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

export interface IHighlightedDate {
  date: Date | string,
  textColor?: string,
  backgroundColor?: string,
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
})
export class AttendancePage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  attendanceDateList: IClockInResponce[] = [];
  attendanceList: IClockInResponce[] = [];
  dataLoaded: boolean = false;
  dateModal: boolean = false;
  moreData: boolean = false;
  today: Date = new Date();
  attendanceDate: any;
  attendanceStatus: string[] = ['Present', 'Absent'];
  expandedCards: number[] = [0];
  userId: string = "";
  pageIndex: number = 0;
  workWeekDetail!: IEmplpoyeeWorWeek;
  highlightedDates: Array<IHighlightedDate> = [];
  leaveLogs: ILeaveLogsResponse[] = [];
  showCalendar: boolean = false;
  eventsList: IHollydayResponse[] = [];

  constructor(
    public router: Router,
    private shareServ: ShareService,
    private loader: LoaderService
  ) {}

  ngOnInit() {
    this.userId = localStorage.getItem('userId') || "";
  }

  ionViewWillEnter(){
    this.attendanceDate = this.today.toISOString();
    if(this.userId.trim() !== ''){
      this.getMonthLyAttendance();
      this.getCalendar();
      this.getWorkWeek();
      this.getLogs();
    }
  }

  getMonthLyAttendance(){
    this.dataLoaded = false;
    this.moreData = true;
    this.loader.present('');
    this.shareServ.monthlyAttendance(this.userId, this.attendanceDate, this.pageIndex * 0, 40).subscribe(res => {
      if(res.length < 1){
        this.moreData = false;
        this.dataLoaded = true;
        this.loader.dismiss();
        return;
      } else {
        this.attendanceList = res;
        this.dataLoaded = true;
        this.moreData = res.length > 39;

        this.attendanceList.forEach((e: IClockInResponce) => {
          const data = {
            date: this.returnCustomDate(e.created_date),
            textColor: this.checkStatus(e.status).color,
            backgroundColor: this.checkStatus(e.status).backgroud,
          };
          const index = this.highlightedDates.findIndex((a: IHighlightedDate) => a.date === this.returnCustomDate(e.created_date));
          if(index != -1){
            this.highlightedDates[index] = data;
          } else {
            this.highlightedDates.push(data);
          }
        })
        this.loader.dismiss();
        if(this.infiniteScroll){
          this.infiniteScroll.complete();
        }
      }
    }, (error) => {
      this.dataLoaded = true;
      this.loader.dismiss();
      this.infiniteScroll.complete();
    });
  }

  getEmployeeAttendance() {
    this.dataLoaded = false;
    if(this.pageIndex == 0){this.attendanceList = [];}

    this.shareServ.employeeAttendance(this.userId, this.pageIndex * 40, 40).subscribe(res => {
      if(res) {
        if(res.length < 1){
          this.moreData = false;
          this.infiniteScroll.complete();
          this.loader.dismiss();
          return;
        }
        for(let i=0; i<res.length; i++){
          this.attendanceList.push(res[i]);
          const data = {
            date: this.returnCustomDate(res[i].created_date),
            textColor: this.checkStatus(res[i].status).color,
            backgroundColor: this.checkStatus(res[i].status).backgroud
          };
          const index = this.highlightedDates.findIndex((e: IHighlightedDate) => e.date === this.returnCustomDate(res[i].created_date));
          if(index != -1){
            this.highlightedDates[index] = data;
          } else {
            this.highlightedDates.push(data);
          }
        }
        
        
        if(res.length > 39) {
          this.moreData = true;
        } else {this.moreData = false;}

        if(this.infiniteScroll){
          this.infiniteScroll.complete();
        }

      }
      this.dataLoaded = true;
      this.loader.dismiss();
    }, (error) => {
      this.infiniteScroll.complete();
      this.dataLoaded = true;
      this.moreData = false;
      this.loader.dismiss();
    });
  }

  getLogs(){
    const data = {
      employeeId: this.userId
    };
    this.shareServ.getLeaveList(data, 0 * 200, 200).subscribe(res => {
      if(res) {
        this.leaveLogs = res;

        this.leaveLogs.map((leave: ILeaveLogsResponse) => {
          if(leave.endDate && leave.status !== 'Cancel'){
            const startDate = new Date(leave.startDate);
            const endDate = new Date(leave.endDate);
            while (startDate <= endDate) {
              const selectDate : IHighlightedDate = {
                date: this.returnCustomDate(startDate),
                backgroundColor: leave.status === 'Pending' ? '#ef7373' : 'red',
                textColor: '#fff',
              }
              const index = this.highlightedDates.findIndex((d: IHighlightedDate) => d.date === this.returnCustomDate(startDate))
              if(index != -1){
                this.highlightedDates.splice(index, 1);
              }
              this.highlightedDates.push(selectDate);
              startDate.setDate(startDate.getDate() + 1);
            }
          }
        });
      }
    });
  }

  getCalendar(){
    this.shareServ.getEventHollyday(moment.utc(this.attendanceDate).format()).subscribe(res => {
      if(res) {
        if(res.length < 1) {
          this.loader.dismiss();
          return;
        } else {
          this.eventsList = res;
          this.eventsList.map((holiday: IHollydayResponse) => {
            const selectDate : IHighlightedDate = {
              date: this.returnCustomDate(holiday.eventDate),
              backgroundColor: '#f58f0d',
              textColor: '#000',
            }
            const index = this.highlightedDates.findIndex((d: IHighlightedDate) => d.date === this.returnCustomDate(holiday.eventDate))
            if(index != -1){
              this.highlightedDates.splice(index, 1);
            }
            this.highlightedDates.push(selectDate);
          });
        }
      }
    }, (error) => {})
  }

  getWorkWeek(){
    this.shareServ.employeeAssignedWorkWeek(this.userId).subscribe(res => {
      if(res) {
        this.workWeekDetail = res;
        const weekOff = this.workWeekDetail.workweekDetails.weekOff;
        this.highlightedDates.forEach((abc: IHighlightedDate) => {
          const abcDate = new Date(abc.date).getDay();
          if(weekOff.includes(moment.weekdays()[abcDate])){
            abc = {
              date: this.returnCustomDate(abc.date),
              backgroundColor: 'var(--ion-color-secondary-tint)',
              textColor: 'var(--ion-color-secondary-contrast)',
            };
          }
        })
      }
    }, (error) => {
    });
  }

  async getWeekendDates(year: number, month: number) {
    const dates: IClockInResponce[] = [];
  
    // Create a new Date object for the first day of the month
    const currentDate = new Date(year, month-1, 1);
  
    // Iterate through the days of the month
    while (currentDate.getMonth() === month-1) {
      const dayOfWeek = currentDate.getDay(); // 0 for Sunday, 6 for Saturday
  
      if( currentDate <= this.today && !this.highlightedDates.includes({date: this.returnCustomDate(currentDate)})){
        this.highlightedDates.push({
          date: this.returnCustomDate(currentDate),
          textColor: '#fff',
          backgroundColor: 'red'
        });

        if(this.workWeekDetail && this.isWeekOff(currentDate)){
          const customData : IHighlightedDate = {
            date: this.returnCustomDate(currentDate),
            backgroundColor: 'var(--ion-color-secondary-tint)',
            textColor: 'var(--ion-color-secondary-contrast)',
          };
          const index = this.highlightedDates.findIndex((e: IHighlightedDate) => e.date === this.returnCustomDate(currentDate));
          if(index != -1){
            this.highlightedDates[index] = customData;
          } else {
            this.highlightedDates.push(customData);
          }
        }
        this.attendanceList.forEach((attend: IClockInResponce) => {
          const selectDate : IHighlightedDate = {
            date: this.returnCustomDate(attend.clockIn),
            backgroundColor: this.checkStatus(attend.status).backgroud,
            textColor: this.checkStatus(attend.status).color,
          }
          const index = this.highlightedDates.findIndex((d: IHighlightedDate) => d.date === this.returnCustomDate(attend.clockIn))
          if(index != -1){
            this.highlightedDates.splice(index, 1);
          }
          this.highlightedDates.push(selectDate);
          const listIndex = this.attendanceDateList.findIndex((attendDate: IClockInResponce) => checkDates(new Date(attendDate.created_date), new Date(attend.created_date)));
          if(listIndex != -1){
            this.attendanceDateList[listIndex] = attend;
          }
        });
      }
      currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
    }
  
    // return dates;

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

  returnCustomDate(selectDate: string | Date){
    const old_Date = selectDate;
    const dateObject = new Date(old_Date);
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, '0');
    const day = String(dateObject.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
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

  setStartEndDate(dateString: Date){
    const startDate = new Date(dateString);
    startDate.setDate(1);
    let endDate = new Date(dateString);
    if(new Date().getFullYear() === new Date(dateString).getFullYear()){
      if(new Date().getMonth() === new Date(dateString).getMonth()){
        endDate.setDate(new Date(dateString).getDate());
      } else {
        if(new Date().getMonth() > new Date(dateString).getMonth()){
          endDate.setMonth(endDate.getMonth()+1, 0);
        } else {return;}
      }
    } else {
      if(new Date().getFullYear() > new Date(dateString).getFullYear()) {
        endDate.setMonth(endDate.getMonth()+1, 0);
      } else {return;}
    }
    this.createDateList(startDate, endDate);
  }

  createDateList(startDate: string | Date, endDate: string | Date) {
    let beginDate = new Date(moment(startDate).format()).getDate();
    let lastDate = new Date(moment(endDate).format()).getDate();
    this.attendanceDateList = [];

    while(beginDate <= lastDate) {
      const newDate = new Date();
      newDate.setFullYear(new Date(endDate).getFullYear(), new Date(endDate).getMonth(), lastDate);
      const data = {
        clockIn: '',
        clockOut: '',
        employeeId: this.userId,
        status: AttendaceStatus.ABSENT,
        workDuration: '',
        workingTime: '',
        guid: '',
        created_date: moment.utc(newDate).format(),
        created_user: this.userId,
        isDeleted: false,
        inTime: '',
        outTime: '',
        EmployeeDetails: {} as any,
        gracePeriod: 0
      }
      this.attendanceDateList.push(data);
      lastDate--;
    }

    this.getWeekendDates(new Date(this.attendanceDate).getFullYear(), new Date(this.attendanceDate).getMonth()+1);
  }

  dateChange(event: CustomEvent) {
    if(event.detail.value){
      this.getMonthLyAttendance();
      this.showCalendar = true;
    }
  }

  selectDate(event: CustomEvent) {
    if(event.detail.value){
      this.getMonthLyAttendance();
    }
  }
  
  getMonthYear(){
    let customDate = '';
    if(this.attendanceDate){
      customDate = `${moment.monthsShort()[new Date(this.attendanceDate).getMonth()]} ${new Date(this.attendanceDate).getFullYear()}`;
    }
    return customDate;
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
  getStatus(status: string){
    let color = '';
    switch (status) {
      case 'Present':
        color = 'success'
        break;

      case 'Leave':
        color = 'warning'
        break;
    
      default:
        color = 'danger'
        break;
    }
    return color;
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

  loadData(event: any){
    if(this.moreData){
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
