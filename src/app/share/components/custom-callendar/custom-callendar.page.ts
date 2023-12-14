import { formatDate } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-custom-callendar',
  templateUrl: './custom-callendar.page.html',
  styleUrls: ['./custom-callendar.page.scss'],
})
export class CustomCallendarPage implements OnInit {
  currentDate: Date = new Date();
  today: Date = new Date();
  focusedDay: Date = new Date();
  weekDates: (Date | string)[] = [];
  currentWeek: number = 0;
  weekInYear: number = 0;
  weekDays: string[] = [];
  @Output() attendDate: EventEmitter<Date> = new EventEmitter<Date>();

  constructor() {
    this.currentWeek = moment().week();
    this.weekInYear = moment().weeksInYear();
    this.weekDays = moment.weekdaysMin();
    this.focusedDay = this.today;
    // console.log(this.focusedDay, this.today);
  }

  ngOnInit() {
    // this.getDatesInCurrentWeek();
    this.getWeekDates(this.currentWeek, this.today.getFullYear())
  }

  getDatesInCurrentWeek() {
    const initialDay = moment();

    const firstDayOfWeek = initialDay.clone().startOf('week');
    const datesInCurrentWeek = [];

    for (let i = 0; i < 7; i++) {
      const startDate = firstDayOfWeek.clone().add(i, 'days');
      const formattedDate = new Date(startDate.format(`YYYY-MM-DD`));
      if (startDate.year() === moment().year() || startDate.month() === initialDay.month()) {
        datesInCurrentWeek.push(formattedDate);
      } else {
        datesInCurrentWeek.push('');
      }
    }

    this.weekDates = datesInCurrentWeek;
    this.currentDate = new Date(this.weekDates[0]);
    console.log(this.getWeekDates(this.currentWeek, this.today.getFullYear()));
  }

  incrementWeek() {
    this.currentWeek++;
    // this.updateWeekDates();
    this.getWeekDates(this.currentWeek, this.today.getFullYear());
  }

  decrementWeek() {
    this.currentWeek--;
    // this.updateWeekDates();

    this.getWeekDates(this.currentWeek, this.today.getFullYear());
  }

  updateWeekDates() {
    const initialDay = moment();
    const week = initialDay.clone().week(this.currentWeek);
  
    const firstDayOfWeek = week.clone().startOf('week');
    const datesInCurrentWeek = [];
  
    for (let i = 0; i < 7; i++) {
      const currentDate = firstDayOfWeek.clone().add(i, 'days');
      const formattedDate = new Date(currentDate.format(`YYYY-MM-DD`));
  
      if (currentDate.year() === initialDay.year()) {
        datesInCurrentWeek.push(formattedDate);
      } else {
        datesInCurrentWeek.push('');
      }
    }
  
    this.weekDates = datesInCurrentWeek;
    this.currentDate = new Date(this.weekDates[0]);
  }
  

  isToday(firstDate: string | Date) {
    return moment(firstDate).format('YYYY-MM-DD') === moment().format('YYYY-MM-DD');
  }

  isLargest(firstDate: string | Date){
    if(moment(firstDate).year() > moment().year()){
      return true;
    } else if(moment(firstDate).year() <= moment().year() && moment(firstDate).month() > moment().month()){
      return true;
    } else if(moment(firstDate).year() <= moment().year() && moment(firstDate).month() <= moment().month() && moment(firstDate).date() > moment().date()){
      return true;
    } else {
      return false;
    }
  }

  isFocusedDay(firstDate: string | Date) {
    return moment(firstDate).format('YYYY-MM-DD') === moment(this.focusedDay).format('YYYY-MM-DD');
  }

  getDate(dateItem: string | Date){
    return dateItem.toString().trim() === '' ? {isDate: false, dateE: new Date()} : {isDate: true, dateE: new Date(dateItem)};
  }

  selectDate(absd: string | Date){
    this.focusedDay = new Date(absd);
    this.attendDate.emit(this.focusedDay);
  }


  getWeekDates(weekNumber: number, year: number) {
    var startDate = new Date(year, 0, 1 + (weekNumber - 1) * 7);
    var endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
  
    var dates = [];
  
    for (var currentDate = startDate; currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
      dates.push(new Date(currentDate));
    }

    this.weekDates = dates;
    this.currentDate = new Date(this.weekDates[0]);
  }
  
}
