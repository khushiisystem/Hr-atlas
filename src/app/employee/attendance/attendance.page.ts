import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonInfiniteScroll } from '@ionic/angular';
import * as moment from 'moment';
import { IClockInResponce } from 'src/app/interfaces/response/IAttendanceSetup';
import { IEmplpoyeeWorWeek } from 'src/app/interfaces/response/IEmplpoyeeWorWeek';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

export interface IHighlightedDate {
  date: Date | string,
  textColor: string,
  backgroundColor: string,
}

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
})
export class AttendancePage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  attendanceDateList: Date[] = [];
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

  constructor(
    public router: Router,
    private shareServ: ShareService,
    private loader: LoaderService
  ) {}

  ngOnInit() {
    this.userId = localStorage.getItem('userId') || "";
    if(this.userId.trim() !== ''){
      this.getUserDetail();
    }
  }

  ionViewWillEnter(){
    this.attendanceDate = this.today.toISOString();
   if(this.userId.trim() !== ''){
      this.getEmployeeAttendance();
      this.getWorkWeek();
    }
  }
  

  getUserDetail(){
    this.loader.present('');
    this.shareServ.getEmployeeById(this.userId).subscribe(res => {
      if(res){
        // this.setStartEndDate(this.attendanceDate);
        this.dataLoaded = true;
      }
    }, (error) => {
      this.dataLoaded = false;
    })
  }

  getWorkWeek(){
    this.shareServ.employeeAssignedWorkWeek(this.userId).subscribe(res => {
      if(res) {
        this.workWeekDetail = res;
      }
    }, (error) => {});
  }

  getEmployeeAttendance() {
    if(this.pageIndex == 0){this.attendanceList = [];}

    this.shareServ.employeeAttendance(this.userId, this.pageIndex * 10, 10).subscribe(res => {
      if(res) {
        if(res.length < 1){
          this.moreData = false;
          this.infiniteScroll.complete();
          this.loader.dismiss();
          return;
        }
        for(let i=0; i<res.length; i++){
          this.attendanceList.push(res[i]);
          const selectDate : IHighlightedDate = {
            date: (new Date(res[i].clockIn).toISOString()).slice(0, 10),
            backgroundColor: this.checkStatus(res[i].status).backgroud,
            textColor: this.checkStatus(res[i].status).color,
          }
          this.highlightedDates.push(selectDate);
        }
        console.log(this.highlightedDates);
        
        if(res.length > 9) {
          this.moreData = true;
        } else {this.moreData = false;}

        if(this.infiniteScroll){
          this.infiniteScroll.complete();
        }
      }
      this.loader.dismiss();
    }, (error) => {
      this.infiniteScroll.complete();
      this.moreData = false;
      this.loader.dismiss();
    });
  }

  dateChange(event: any){
    console.log(event);
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
        data.color = 'red';
        data.backgroud = '#fff';
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
    if(new Date().getFullYear() === dateString.getFullYear()){
      if(new Date().getMonth() === dateString.getMonth()){
        endDate.setDate(dateString.getDate());
      } else {
        if(new Date().getMonth() > dateString.getMonth()){
          endDate.setMonth(endDate.getMonth()+1, 0);
        } else {return;}
      }
    } else {
      if(new Date().getFullYear() > dateString.getFullYear()) {
        endDate.setMonth(endDate.getMonth()+1, 0);
      } else {return;}
    }
    this.createDateList(startDate, endDate);
  }

  selectAttendanceDate(event: CustomEvent) {
    if(event.detail.value){
      this.attendanceDate = new Date(moment(event.detail.value).format());
      this.attendanceList = [];
      this.getEmployeeAttendance();
      // this.setStartEndDate(this.attendanceDate);
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

  createDateList(startDate: string | Date, endDate: string | Date) {
    let beginDate = new Date(moment(startDate).format()).getDate();
    let lastDate = new Date(moment(endDate).format()).getDate();

    this.attendanceDateList = [];
    while(beginDate <= lastDate) {
      const newDate = new Date();
      newDate.setFullYear(new Date(endDate).getFullYear(), new Date(endDate).getMonth(), lastDate)
      this.attendanceDateList.push(newDate);
      lastDate--;
    }
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
      this.getEmployeeAttendance();
    }
  }

}
