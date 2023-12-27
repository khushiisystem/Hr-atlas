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
export class AttendancePage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  attendanceList: IClockInResponce[] = [];
  dateList: AttListItem[] = [];
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
  presents: number = 0;
  absent: number = 0;
  isFirst: boolean = false;

  constructor(
    public router: Router,
    private shareServ: ShareService,
    private loader: LoaderService
  ) {
    const abc = localStorage.getItem('isFirst') || false;
    this.isFirst = abc === 'true' ? true : false;
  }

  ngOnInit() {
    this.userId = localStorage.getItem('userId') || "";
  }

  ionViewWillEnter(){
    this.attendanceDate = this.today.toISOString();
    if(this.userId.trim() !== ''){
      this.createDateList(this.attendanceDate);
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
          this.presents = 0;
          this.absent = 0;
          this.dateList.forEach((item) => {
            if(this.checkDates(new Date(e.created_date), new Date(item.created_date))){
              item.attendanceData = e;
              item.status = e.status;
              item.created_date = new Date(e.created_date).toISOString();
            }
            e.status === AttendaceStatus.LEAVE || e.status === AttendaceStatus.ABSENT ? this.absent++ : this.presents++;
          });
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
          this.presents = 0;
          this.absent = 0;
          this.dateList.forEach((item) => {
            if(this.checkDates(new Date(res[i].created_date), new Date(item.created_date))){
              item.attendanceData = res[i];
              item.status = res[i].status;
              item.created_date = new Date(res[i].created_date).toISOString();
            }
            item.status === AttendaceStatus.LEAVE || item.status === AttendaceStatus.ABSENT ? this.absent++ : this.presents++;
          });
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
            this.presents = 0;
            this.absent = 0;
            this.dateList.forEach((e) => {
              if(this.checkDates(startDate, new Date(e.created_date)) && e.status != AttendaceStatus.PRESENT){
                e.leaveData = leave;
                e.created_date = new Date(startDate).toISOString();
                e.status = AttendaceStatus.LEAVE;
              }
              e.status === AttendaceStatus.LEAVE || e.status === AttendaceStatus.ABSENT ? this.absent++ : this.presents++;

            });
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
            this.presents = 0;
            this.absent = 0;
            this.highlightedDates.push(selectDate);
            this.dateList.forEach((e) => {
              if(this.checkDates(new Date(holiday.eventDate), new Date(e.created_date)) && e.status != AttendaceStatus.PRESENT){
                e.leaveData = null;
                e.created_date = new Date(holiday.eventDate).toISOString();
                e.status = AttendaceStatus.HOLiDAY;
              }
              e.status === AttendaceStatus.HOLiDAY ? this.presents++ : this.absent++;
            });
          });
        }
      }
    }, (error) => {})
  }

  getWorkWeek(){
    this.shareServ.employeeAssignedWorkWeek(this.userId).subscribe(res => {
      if(res) {
        this.presents = 0;
        this.absent = 0;
        this.workWeekDetail = res;
        const weekOff = this.workWeekDetail.workweekDetails.weekOff;
        this.dateList.forEach((item) => {
          if(weekOff.includes(moment.weekdays(new Date(item.created_date).getDay()))){
            item.status = AttendaceStatus.WEEK_OFF;
            const hghIndex = this.highlightedDates.findIndex((e) => e.date === this.returnCustomDate(item.created_date));
            if(hghIndex != -1){
              this.highlightedDates.forEach((e, index) => {
                if(e.date === this.returnCustomDate(item.created_date)){
                  e.textColor = '#fff';
                  e.backgroundColor = 'var(--ion-color-warning)';
                } else {
  
                }
              });
            } else {
              this.highlightedDates.push({
                date: this.returnCustomDate(item.created_date),
                textColor: '#fff',
                backgroundColor: 'var(--ion-color-warning)',
              })
            }
          }
          item.status === AttendaceStatus.LEAVE || item.status === AttendaceStatus.ABSENT ? this.absent++ : this.presents++;
        });
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
    this.createDateList(startDate);
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
        employeeId: this.userId,
        status: AttendaceStatus.ABSENT,
        created_date: new Date(date),
        created_user: this.userId,
        open_form: false,
        attendanceData: null,
        leaveData: null,
      }
      this.dateList.push(data);
    }
    this.toggleCard(this.dateList[0]);

    this.getMonthLyAttendance();
    this.getCalendar();
    this.getWorkWeek();
    this.getLogs();
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

  selectDate(event: CustomEvent) {
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

  skipTips(){
    localStorage.setItem('isFirst' , String(false));
    this.isFirst = false;
  }

  toggleCard(item: AttListItem){
    if(item.attendanceData != null || item.leaveData != null){
      item.open_form = !item.open_form
    }
  }

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
