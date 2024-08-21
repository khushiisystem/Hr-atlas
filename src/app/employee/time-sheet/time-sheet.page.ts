import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatetimeCustomEvent } from '@ionic/angular';
import * as moment from 'moment';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-time-sheet',
  templateUrl: './time-sheet.page.html',
  styleUrls: ['./time-sheet.page.scss'],
})
export class TimeSheetPage implements OnInit {
  isDataLoaded: boolean = true;
  openCalendar: boolean = false;
  timeSheetForm!: FormGroup;
  today: Date = new Date(new Date().toDateString() + ' ' + '5:00 AM');
  attendanceDate: any;
  dates: (moment.Moment | string | null)[][] = [];
  status = '';
  currentMonth: number = moment().month();
  currentYear: number = moment().year();
  // pageIndex: number = 0;
  // allEmployeeList: IEmployeeResponse[] = [];

  constructor(
    private _fb: FormBuilder,
    private adminSer: AdminService,
  ) { }

  ngOnInit() {
    this.timeSheetForm = this._fb.group({
      projectName: '',
      startDate: '',
      endDate:'',
      description: '',
      hours: '',
    });
    // this.getEmployeeList();
  }

  getHours(){
    const formValue = this.timeSheetForm.controls['hours'].value;
    return formValue ? new Date(moment(formValue).format()) : '';
  }
  setHours(event: DatetimeCustomEvent) {
    this.timeSheetForm.patchValue({
      hours: moment.utc(event.detail.value).format()
    });
  }

  getStartDate(){
    const formValue = this.timeSheetForm.controls['startDate'].value;
    return formValue ? new Date(moment(formValue).format()) : '';
  }

  setStartDate(event: DatetimeCustomEvent){
    this.timeSheetForm.patchValue({
      startDate: moment.utc(event.detail.value).format()
    });
  }

  getEndDate(){
    const formValue = this.timeSheetForm.controls['endDate'].value;
    return formValue ? new Date(moment(formValue).format()) : '';
  }

  setEndDate(event: DatetimeCustomEvent){
    this.timeSheetForm.patchValue({
      endDate: moment.utc(event.detail.value).format()
    });
  }

  highlightedDates = (isoString: string | number | Date) => {
    const date = new Date(isoString);
    const utcDay = date.getUTCDate();

    if (utcDay % 5 === 0) {
      return {
        textColor: '#800080',
        backgroundColor: '#ffc0cb',
      };
    }

    if (utcDay % 3 === 0) {
      return {
        textColor: 'var(--ion-color-secondary-contrast)',
        backgroundColor: 'var(--ion-color-secondary)',
      };
    }
    return undefined;
  };

  // getEmployeeList() {
  //   this.isDataLoaded = false;
  //   if(this.pageIndex < 1) {
  //     this.allEmployeeList = [];
  //   }
  //   this.adminSer.getEmployees('Active', this.pageIndex * 100, 100).subscribe(res => {
  //     if(res) {
  //       console.log(res);
  //       const data: IEmployeeResponse[] = res;
  //       this.allEmployeeList = data;
  //       this.isDataLoaded = true;
  //     }
  //   }, (error) => {
  //     this.isDataLoaded = true;
  //   });
  // }
}
