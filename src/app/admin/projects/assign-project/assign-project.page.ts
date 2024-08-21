import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DatetimeCustomEvent } from '@ionic/angular';
import * as moment from 'moment';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-assign-project',
  templateUrl: './assign-project.page.html',
  styleUrls: ['./assign-project.page.scss'],
})
export class AssignProjectPage implements OnInit {
  isDataLoaded: boolean = true;
  assignProjectForm!: FormGroup;
  pageIndex:number = 0;
  allEmployeeList: IEmployeeResponse[] = [];
  isInProgress:boolean = false;
  localDate!: Date;
  openCalendar: boolean = false;
  today: Date = new Date();


  constructor(
    private _fb: FormBuilder,
    private adminServ: AdminService,
  ) { }

  ngOnInit() {
    this.assignProjectForm = this._fb.group({
      projectName: [''],
      allEmp:[],
      startDate: [''],
      endDate: [''],
    });
    this.getEmployeeList();
  }

  getEmployeeList(){
    this.isDataLoaded = false;
    if(this.pageIndex < 1){
      this.allEmployeeList = [];
    }
    this.adminServ.getEmployees('Active', this.pageIndex * 100, 100).subscribe(res => {
      if(res){
        const data: IEmployeeResponse[] = res;
        this.allEmployeeList = data;
        this.isDataLoaded = true;
      } 
    }, (error) => {
      this.isDataLoaded = true;
    });
  }

  getStartDate(){
    const formValue = this.assignProjectForm.controls['startDate'].value;
    return formValue ? new Date(moment(formValue).format()) : '';
  }

  setStartDate(event: DatetimeCustomEvent){
    this.assignProjectForm.patchValue({
      startDate: moment.utc(event.detail.value).format()
    });
  }

  getEndDate(){
    const formValue = this.assignProjectForm.controls['endDate'].value;
    return formValue ? new Date(moment(formValue).format()) : '';
  }

  setEndDate(event: DatetimeCustomEvent){
    this.assignProjectForm.patchValue({
      endDate: moment.utc(event.detail.value).format()
    });
  }

  submit() {
    console.log(this.assignProjectForm.value);
  }
}
