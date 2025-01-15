import { formatDate } from "@angular/common";
import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import * as moment from "moment";
import { IHollydayResponse } from "src/app/interfaces/response/ILeave";
import { AdminService } from "src/app/services/admin.service";

@Component({
  selector: "app-custom-callendar",
  templateUrl: "./custom-callendar.page.html",
  styleUrls: ["./custom-callendar.page.scss"],
})
export class CustomCallendarPage implements OnInit {
  currentDate: moment.Moment = moment();
  displayDate: moment.Moment = moment();
  today: Date = new Date();
  focusedDay: Date = new Date();
  weekDates: any[] = [];
  currentWeek: number = 0;
  weekInYear: number = 0;
  weekDays: string[] = [];
  eventsList: IHollydayResponse[] = [];
  @Output() attendDate: EventEmitter<Date> = new EventEmitter<Date>();

  constructor(
    private adminServ: AdminService,
  ) {
    this.currentWeek = moment().week();
    this.weekInYear = moment().weeksInYear();
    this.weekDays = moment.weekdaysMin();
    this.focusedDay = this.today;
  }

  ngOnInit() {
    // this.getDatesInCurrentWeek();
    this.getWeekDates();
  }

  getDatesInCurrentWeek() {
    const initialDay = moment();

    const firstDayOfWeek = initialDay.clone().startOf("week");
    const datesInCurrentWeek = [];

    for (let i = 0; i < 7; i++) {
      const startDate = firstDayOfWeek.clone().add(i, "days");
      const formattedDate = new Date(startDate.format(`YYYY-MM-DD`));
      if (startDate.year() === moment().year() || startDate.month() === initialDay.month()) {
        datesInCurrentWeek.push(formattedDate);
      } else {
        datesInCurrentWeek.push("");
      }
    }

    this.weekDates = datesInCurrentWeek;
    // this.currentDate = new Date(this.weekDates[0]);
  }


  updateWeekDates() {
    const initialDay = moment();
    const week = initialDay.clone().week(this.currentWeek);

    const firstDayOfWeek = week.clone().startOf("week");
    const datesInCurrentWeek = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = firstDayOfWeek.clone().add(i, "days");
      const formattedDate = new Date(currentDate.format(`YYYY-MM-DD`));

      if (currentDate.year() === initialDay.year()) {
        datesInCurrentWeek.push(formattedDate);
      } else {
        datesInCurrentWeek.push("");
      }
    }

    this.weekDates = datesInCurrentWeek;
  }

  isToday(firstDate: string | Date) {
    return (
      moment(firstDate).format("YYYY-MM-DD") === moment().format("YYYY-MM-DD")
    );
  }

  isHoliday(dateStr: string | moment.Moment){
    return this.eventsList.filter((eveDate) => this.isSameDates(dateStr, moment(eveDate.eventDate))).length > 0;
  }

  isSameDates(firstDate: string | moment.Moment, secondDate: string | moment.Moment){
    return (
      moment(firstDate).format("YYYY-MM-DD") === moment(secondDate).format("YYYY-MM-DD")
    );
  }

  isLargest(firstDate: string | Date) {
    const today = moment();
    return today.isBefore(moment(firstDate));
  }

  isFocusedDay(firstDate: string | Date) {
    return (
      moment(firstDate).format("YYYY-MM-DD") ===
      moment(this.focusedDay).format("YYYY-MM-DD")
    );
  }

  getDate(dateItem: string | Date) {
    return dateItem.toString().trim() === ""
      ? { isDate: false, dateE: new Date() }
      : { isDate: true, dateE: new Date(dateItem) };
  }

  selectDate(absd: string | Date) {
    this.focusedDay = new Date(absd);
    this.attendDate.emit(this.focusedDay);
  }
  
  getCalendar(){
    this.eventsList = [];
    this.adminServ.getEventHollyday(moment.utc(this.currentDate).format()).subscribe(res => {
      if(res && res.length < 1) {
        return;
      } else {
        this.eventsList = res;
      }
    }, (error) => { })
  }

  getWeekDates() {
    const today = moment();
    const startOfWeek = today.clone().startOf('week');
    const endOfWeek = today.clone().endOf('week');
  
    this.weekDates = [];
  
    for (let current = startOfWeek.clone(); current.isBefore(endOfWeek); current.add(1, 'day')) {
      this.weekDates.push(current.clone().format());
    }
    this.getCalendar();
    this.getLargestMonth();
  }
  

  incrementWeek() {
    this.weekDates = this.weekDates.map(date => moment(date).add(1, 'week').format());
    this.currentDate.add(1, 'week');
    if(this.eventsList.length < 1 || moment(this.eventsList[0].eventDate).year() != moment(this.weekDates[this.weekDates.length - 1]).year() || moment(this.eventsList[0].eventDate).year() != moment(this.weekDates[0]).year()){
      this.getCalendar();
    }
    this.getLargestMonth();
  }
  
  decrementWeek() {
    this.weekDates = this.weekDates.map(date => moment(date).subtract(1, 'week').format());
    this.currentDate.subtract(1, 'week');
    if(this.eventsList.length < 1 || moment(this.eventsList[0].eventDate).year() != moment(this.weekDates[this.weekDates.length - 1]).year() || moment(this.eventsList[0].eventDate).year() != moment(this.weekDates[0]).year()){
      this.getCalendar();
    }
    this.getLargestMonth();
  }

  getFormatedDate(dateStr: string | moment.Moment){
    return new Date(moment(dateStr).format());
  }

  getLargestMonth(){
    const monthCounts: any = {};
    this.weekDates.forEach((e, i) => {
      const monthKey = moment(e).format('YYYY-MM');
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    });


    let maxMonthKey = Object.keys(monthCounts)[0];
    Object.keys(monthCounts).forEach(monthKey => {
      if (monthCounts[monthKey] > monthCounts[maxMonthKey]) {
        maxMonthKey = monthKey;
      }
    });
    this.displayDate = moment(maxMonthKey + '-01');
  }
  
}
