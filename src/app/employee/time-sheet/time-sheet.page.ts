import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatetimeCustomEvent, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { IProject } from 'src/app/admin/projects/projects.page';
import { ICategory } from 'src/app/admin/timesheet-category/timesheet-category.page';
import { ISubCategory } from 'src/app/admin/timesheet-sub-category/timesheet-sub-category.page';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { AdminService } from 'src/app/services/admin.service';
import { TimeSheetService } from 'src/app/services/time-sheet.service';

export interface ITimesheet {
  date?: string;
  startTime?: string;
  endTime?: string;
  tag?: string;
  description?: string;
  guid: string;
  project: {
    title: string;
  };
  timesheetCategory: {
    category: string;
  };
  timesheetSubCategory: {
    subCategory: string;
  }
}
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
  projects: IProject[] = [];
  categories: ICategory[] = [];
  subCategories: ISubCategory[] = [];;
  pageIndex: number = 0;
  minDate: Date = new Date();
  maxDate: Date = new Date();
  minEndDate: any;
  startDate!: string;
  timesheetList: ITimesheet[] = [];
  timeSheet!: ITimesheet | any;
  subCategoryId: string = '';
  
  constructor(
    private _fb: FormBuilder,
    private adminSer: AdminService,
    private timesheetSer: TimeSheetService,
    private modelCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.minDate.setDate(this.minDate.getDate() + 2);
    this.maxDate = this.minDate;
    const currentTime = moment().format();
    
    this.timeSheetForm = this._fb.group({
      projectId: '',
      categoryId: '',
      subCategoryId: '',
      description: '',
      startTime: [currentTime, Validators.required],
      endTime: [currentTime, Validators.required],
      tag: '',
      date: ['', Validators.required],
    });
    this.getTimesheetList();
    this.getProjects();
    this.getCategories();
    this.getSubCategories();
    // this.updateTimesheet();  
  }

  getFormGroup(ctrlName: string): FormGroup{
    return (this.timeSheetForm.controls[ctrlName] as FormGroup);
  }

  getDate(ctrlName: string){
      const formDate = this.timeSheetForm.controls[ctrlName].value;
      return formDate != '' ? new Date(formDate) : "";
  }

  selectDate(event: DatetimeCustomEvent){
    this.timeSheetForm.controls['date'].patchValue(moment(event.detail.value).utc().format());
  }

  getStartTime(){
    const formValue = this.timeSheetForm.controls['startTime'].value;
    return formValue ? new Date(moment(formValue).format()) : '';
  }
  setStartTime(event: DatetimeCustomEvent) {
    console.log("value1:", moment(event.detail.value).utc().format());
    this.timeSheetForm.patchValue({
      startTime: moment(event.detail.value).utc().format()
    });
  }

  getEndTime(){
    const formValue = this.timeSheetForm.controls['endTime'].value;
    return formValue ? new Date(moment(formValue).format()) : '';
  }
  setEndTime(event: DatetimeCustomEvent) {
    console.log("value1:", moment(event.detail.value).utc().format());
    this.timeSheetForm.patchValue({
      endTime: moment(event.detail.value).utc().format()
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

  getProjects() {
    this.timesheetSer.getAllProjects(this.pageIndex * 100, 100).subscribe(res => {
      if(res) {
        const data : IProject[] = res;
        this.projects = data;
        this.isDataLoaded = true;
        console.log("projects: ", this.projects)
      }
    }, (error) => {
      this.isDataLoaded = true;
    });
  }

  getCategories() {
    this.timesheetSer.getAllCategories(this.pageIndex * 100, 100).subscribe(res => {
      if(res) {
        const data: ICategory[] = res;
        this.categories = data;
        this.isDataLoaded = true;
        // console.log("categories: ", this.categories);
      }
    })
  }

  getSubCategories() {
    this.isDataLoaded = false;
    if(this.pageIndex < 1) {
      this.subCategories = [];
    }
    this.timesheetSer.getAllSubCategories(this.pageIndex * 100, 100).subscribe(res => {
      if(res) {
        const data: ISubCategory[] = res;
        this.subCategories = data;
        this.isDataLoaded = true;
        // console.log("subCategories: ", this.subCategories);
      }
    })
  }
  
  submit() {
    console.log("form value : ", this.timeSheetForm.value);
    this.timesheetSer.addTimesheet(this.timeSheetForm.value).subscribe(res => {
      if(res) {
        console.log("res: ", res);
      }
    });    
  }

  getTimesheetList() {
    this.timesheetSer.getTimesheetList(this.pageIndex * 100, 100).subscribe(res => {
      if(res) {
        this.timesheetList = res;
        console.log("timesheet: ", this.timesheetList);
      }
    });
  }

  updateTimesheet(id: string) {    
    console.log("update: ", id)
    console.log(this.timeSheetForm.value)
    this.timesheetSer.updateTimesheet(id, this.timeSheetForm.value).subscribe(res => {
      if(res) {
        console.log("updated timesheet: ", res);
      }
    });
  }

  deleteTimesheet(id: string) {
    this.timesheetSer.deleteTimesheet(id).subscribe(res => {
      if(res) {
        console.log("deleted successfully");
      }
    });
  }


  // async timesheetModel(event: ICategory | null, action: "add" | "update"){
  //   const timesheetModel = this.modelCtrl.create({
  //     component: CategoryFormPage,
  //     componentProps: {
  //       action: action,
  //       category: event,
  //     },
  //     mode: 'md',
  //     initialBreakpoint: 0.9
  //   });
  //   (await timesheetModel).present();
  //   (await timesheetModel).onDidDismiss().then(result => {
  //     console.log("result: ",result)
  //     if(result.data) {
  //       // this.AllCategory.push(result.data);  
  //       this.pageIndex = 0;
  //       this.AllCategory = [];
  //       this.getAllCategories();
  //     }
  //   });
  // }
}
