import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatetimeCustomEvent, IonContent, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { IAssignPro } from 'src/app/admin/projects/assign-project/assign-project.page';
import { IProject } from 'src/app/admin/projects/projects.page';
import { ICategory } from 'src/app/admin/timesheet-category/timesheet-category.page';
import { ISubCategory } from 'src/app/admin/timesheet-sub-category/timesheet-sub-category.page';
import { ApproveTimesheetReq } from 'src/app/interfaces/request/ITimesheet';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { AdminService } from 'src/app/services/admin.service';
import { RoleStateService } from 'src/app/services/roleState.service';
import { TimeSheetService } from 'src/app/services/time-sheet.service';

export enum ETimesheet {
  PENDING = "Pending",
  REJECT = "Reject",
  ACCEPT = "Accept"
}

export interface ITimesheet {
  date: string;
  startTime: string;
  endTime: string;
  tag?: string;
  description: string;
  guid: string;
  status: ETimesheet;
  totalTime: number;
  adminId: string;
  project: {
    title: string;
  };
  timesheetCategory: {
    category: string;
  };
  timesheetSubCategory: {
    subCategory: string;
  };
  user: {
    firstName: string;
    lastName: string;
  }
}
@Component({
  selector: 'app-time-sheet',
  templateUrl: './time-sheet.page.html',
  styleUrls: ['./time-sheet.page.scss'],
})
export class TimeSheetPage implements OnInit {
  @ViewChild(IonContent) content!: IonContent;
  isDataLoaded: boolean = true;
  openCalendar: boolean = false;
  timeSheetForm!: FormGroup;
  today: Date = new Date(new Date().toDateString() + ' ' + '5:00 AM');
  attendanceDate: any;
  dates: (moment.Moment | string | null)[][] = [];
  currentMonth: number = moment().month();
  currentYear: number = moment().year();
  projects: IProject[] = [];
  categories: ICategory[] = [];
  subCategories: ISubCategory[] = []; 
  pageIndex: number = 0;
  minDate: Date = new Date();
  maxDate: Date = new Date();
  minEndDate: any;
  startDate!: string;
  timesheetList: ITimesheet[] = [];
  userTimesheet: ITimesheet[] = [];
  timesheetOfTheDay: ITimesheet[] = [];
  timesheetOfTheMonth: ITimesheet[] = [];
  timeSheet!: ITimesheet | any;
  timesheetId: string = '';
  update: boolean = false;
  hours: number = 0;
  minutes: number = 0;
  getTime: number = 0;
  getMonth: number= 0;
  timesheetDate: string = new Date().toISOString();
  todayTimesheetDuration: number = 0;
  totalMontTime: number = 0;
  // isAdmin: boolean = false;
  userRole: string = '';
  isLoggedIn: boolean = false;
  allEmployeeList: IEmployeeResponse[] = [];
  assProjects: IAssignPro[] = [];
  highlightedDates: Array<{
    date: string,
    textColor: string,
    backgroundColor: string,
  }> = [];
  
  constructor(
    private _fb: FormBuilder,
    private adminSer: AdminService,
    private timesheetSer: TimeSheetService,
    private modelCtrl: ModalController,
    private roleStateServ: RoleStateService,
    private cdr: ChangeDetectorRef
  ) {
    this.roleStateServ.getState().subscribe(res => {
      if(res){
        this.userRole = res;
      } else {
        this.userRole = localStorage.getItem('userRole') || "";
      }
    });
    // this.isLoggedIn = localStorage.getItem('token') != null && localStorage.getItem('token')?.toString().trim() != "";
    // this.activeTab = this.leaveType ? this.leaveType : 'requests'
   }

  ngOnInit() {
    this.minDate.setDate(this.minDate.getDate() + 2);
    this.maxDate = this.minDate;
    const currentTime = moment().format();
    
    this.timeSheetForm = this._fb.group({
      projectId: ['', Validators.required],
      categoryId: ['', Validators.required],
      subCategoryId: ['', Validators.required],
      // userId: '',
      description: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      tag: ['', Validators.required],
      date: ['', Validators.required],
    });
    this.getTimesheetList();
    this.getProjects();
    this.getCategories();
    this.getSubCategories();
    this.getTimesheetDay();
    this.getTimesheetMonth();
    this.getUserTimesheet();
    this.getAssignProjects();
  }

  getFormGroup(ctrlName: string): FormGroup{
    return (this.timeSheetForm.controls[ctrlName] as FormGroup);
  }

  getDate(ctrlName: string){
      const formDate = this.timeSheetForm.controls[ctrlName].value;
      return formDate != '' ? new Date(formDate) : new Date();
  }

  selectDate(event: DatetimeCustomEvent){
    this.timeSheetForm.controls['date'].patchValue(moment(event.detail.value).utc().format());
  }

  getStartTime(){
    const formValue = this.timeSheetForm.controls['startTime'].value;
    return formValue ? new Date(moment(formValue).format()) : '';
  }
  setStartTime(event: DatetimeCustomEvent) {
    this.timeSheetForm.patchValue({
      startTime: moment(event.detail.value).utc().format()
    });
  }
  markTouched(ctrlName: string) {
    this.timeSheetForm.controls[ctrlName].markAsTouched();
  }

  getEndTime(){
    const formValue = this.timeSheetForm.controls['endTime'].value;
    return formValue ? new Date(moment(formValue).format()) : '';
  }
  setEndTime(event: DatetimeCustomEvent) {
    this.timeSheetForm.patchValue({
      endTime: moment(event.detail.value).utc().format()
    });
  }

  

  getProjects() {
    this.timesheetSer.getAllProjects(this.pageIndex * 100, 100).subscribe(res => {
      if(res) {
        const data : IProject[] = res;
        this.projects = data;
        this.isDataLoaded = true;
        // console.log("projects: ", this.projects)
      }
    }, (error) => {
      this.isDataLoaded = true;
    });
  }

    // get assign project 
  getAssignProjects() {
    this.timesheetSer.getAllAssignProjects(this.pageIndex * 100, 100).subscribe(res => {
      if(res) {
        const data: IAssignPro[] = res;
        this.assProjects = data;
        console.log("get assProj res: ", this.assProjects);
      }
    })
  }

  getCategories() {
    this.timesheetSer.getAllCategories(this.pageIndex * 100, 100).subscribe(res => {
      if(res) {
        const data: ICategory[] = res;
        this.categories = data;
        // console.log("categories: ", this.categories);
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
        // console.log("subCategory: ", this.subCategories)
        this.isDataLoaded = true;
        // console.log("subCategories: ", this.subCategories);
      }
    })
  }

  clear() {
    this.timeSheetForm.reset();
  }
  
  submit() {
    // console.log("form value : ", this.timeSheetForm.value);
    if(this.update) {
      if(this.timesheetId.trim() == '') { return }
      this.timesheetSer.updateTimesheet(this.timesheetId, this.timeSheetForm.value).subscribe(res => {
        if(res) {
          // console.log("updated timesheet: ", res);
          this.timeSheetForm.reset();          
          this.update = false;
          this.getUserTimesheet();
        }
      });
    }
    else {
      this.timesheetSer.addTimesheet(this.timeSheetForm.value).subscribe(res => {
        if(res) {
          // this.isAdmin = false;
          // console.log("res: ", res);
          this.getTimesheetList();
          this.getUserTimesheet();
          this.timeSheetForm.reset();
        }
      }); 
    }       
  }

  getTimesheetList() {
    this.timesheetSer.getTimesheetList(this.pageIndex * 100, 100).subscribe(res => {
      if(res) {
        this.timesheetList = res;
        // console.log("admin Timesheet: ", this.timesheetList);
        // this.isAdmin = true;
      }
    });
  }

  // timesheet day start 
  getTimesheetDay() {
    this.timesheetSer.getTimesheetDay(this.timesheetDate).subscribe(res => {
      if(res && res instanceof Array) {
        this.timesheetOfTheDay = res;
        // console.log("getTimsheetDay; ", res);
      }
    })
  }

  calculateTotalWork(): string{
    this.todayTimesheetDuration = 0;
    this.timesheetOfTheDay.forEach((item: {startTime: string, endTime: string}) => {
      const durationMs = this.calculateDuration(item.startTime, item.endTime);
      this.todayTimesheetDuration += durationMs;
    });
    return this.formatDuration(this.todayTimesheetDuration);
  }
  calculateDuration(startTime: string, endTime: string) {
    if (!endTime) return 0;
    const startTim: Date = new Date(startTime);
    const endTim: Date = new Date(endTime);
    const durationMs: any = endTim.getTime() - startTim.getTime();
    return durationMs;
  }
  formatDuration(ms: number): string {
    return `${Math.floor((ms / (1000 * 60 * 60)) % 24)}h ${Math.floor((ms / (1000 * 60)) % 60)}m ${Math.floor((ms / 1000) % 60)}s`;
  }

  // timesheet day end

  getTimesheetMonth() {
    this.timesheetSer.getTimesheetMonth(this.timesheetDate).subscribe(res => {
      if(res) {
        this.timesheetOfTheMonth = res;
        // totalMontTime;
        for(let month of this.timesheetOfTheMonth) {
          this.totalMontTime += month.totalTime;
        }
        this.hours = Math.floor(this.totalMontTime / 60);
        this.minutes = this.totalMontTime % 60;
      }
    })
  }

  calculateTimeDifference(startTime: string, endTime: string): string {
    const start = moment(startTime);
    const end = moment(endTime);
    const duration = moment.duration(end.diff(start));
    
    const hours = Math.floor(duration.asHours());
    const minutes = duration.minutes();
  
    return `${hours}h ${minutes}m`;
  }

  approveReject(status: string , guid: string) {
    const data: ApproveTimesheetReq = {
      status: status === 'accept' ? ETimesheet.ACCEPT : ETimesheet.REJECT,
      timesheetGuid: guid
    }  
    this.timesheetSer.approveReject(data).subscribe(res => {
      if(res) {
        // console.log("res: ", res);
        this.getUserTimesheet();
        this.getTimesheetList();
      }
    });
  }

  updateTimesheet(timesheet: ITimesheet) {    
    this.timeSheetForm.patchValue(timesheet);
    this.timesheetId = timesheet.guid;
    console.log("id", this.timesheetId);
    this.update = true;
    if(this.content){   
      this.content.scrollToTop(100);
    }
  }

  deleteTimesheet(id: string) {
    this.timesheetSer.deleteTimesheet(id).subscribe(res => {
      if(res) {
        console.log("deleted successfully");
      }
    });
  }

  getUserTimesheet() {
    const userId = localStorage.getItem('userId') || "";
    this.timesheetSer.getUserTimesheet(this.pageIndex * 100, 100, userId).subscribe(res => {
      if(res) {
        this.userTimesheet = res; 
        // console.log("getUserTimesheet: ", this.userTimesheet); 
        this.highlightedDates = this.getHighlightedDatesFunction();
        // console.log(this.highlightedDates)
      }
    })
  }

  getHighlightedDatesFunction(): Array<{date: string, textColor: string, backgroundColor: string}> {
    let dataArray: Array<{date: string, textColor: string, backgroundColor: string}> = [];
  
    this.userTimesheet.forEach(element => {
      let bgColor: string = 
        element.status === ETimesheet.PENDING ? "orange" :
        element.status === ETimesheet.REJECT ? "red" :
        element.status === ETimesheet.ACCEPT ? "green" : "initial";
  
      const eleDate = new Date(element.date);
      
      // Format the date as YYYY-MM-DD (pad month and day with leading zeros)
      const formattedDate = `${eleDate.getFullYear()}-${(eleDate.getMonth() + 1).toString().padStart(2, '0')}-${eleDate.getDate().toString().padStart(2, '0')}`;
      
      const data: {date: string, textColor: string, backgroundColor: string} = {
        date: formattedDate,
        textColor: "white",
        backgroundColor: bgColor
      };
  
      // Check if the date already exists in the array by comparing 'date'
      if (!dataArray.some(d => d.date === data.date)) {
        dataArray.push(data);
      }
    });
  
    return dataArray;
  }
  
  

  onDateChange(event: any) {
    this.timesheetDate = event.detail.value; // Update the selected date
    this.getTimesheetDay(); // Refresh data for the new selected date
  }
}
