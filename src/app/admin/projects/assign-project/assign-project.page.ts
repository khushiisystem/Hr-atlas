import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatetimeCustomEvent, IonContent } from '@ionic/angular';
import * as moment from 'moment';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { AdminService } from 'src/app/services/admin.service';
import { IProject } from '../projects.page';
import { TimeSheetService } from 'src/app/services/time-sheet.service';
import { ShareService } from 'src/app/services/share.service';

export interface IAssignPro {
  map(arg0: (item: any) => any): unknown;
  projectId: string,
  userId: string,
  startDate: string, 
  endDate: string,
  guid: string,
  project: {
    title: string;
    guid: string;
  },
  user: {
    firstName: string;
    lastName: string;
  }
}
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
  projects: IProject[] = [];
  assProjects: IAssignPro[] = [];
  assProjectId: string = '';
  updateForm: boolean = false;
  @ViewChild(IonContent) content!: IonContent;


  constructor(
    private _fb: FormBuilder,
    private adminServ: AdminService,
    private timesheetSer: TimeSheetService,
    private shareServ: ShareService,
  ) { }

  ngOnInit() {
    this.assignProjectForm = this._fb.group({
      projectId: ['', Validators.required],
      userId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
    });
    this.getEmployeeList();
    this.getProjects();
    this.getAssignProjects();
  }

  getDate(ctrlName: string){
    const formDate = this.assignProjectForm.controls[ctrlName].value;
    return formDate != '' ? new Date(formDate) : new Date();
  }

  selectDate(event: DatetimeCustomEvent){
    this.assignProjectForm.controls['startDate'].patchValue(moment(event.detail.value).utc().format());
  }

  getEndDate(ctrlName: string){
    const formDate = this.assignProjectForm.controls[ctrlName].value;
    return formDate != '' ? new Date(formDate) : new Date();
  }

  selectEndDate(event: DatetimeCustomEvent){
    this.assignProjectForm.controls['endDate'].patchValue(moment(event.detail.value).utc().format());
  }

  getEmployeeList(){
    this.isDataLoaded = false;
    if(this.pageIndex < 1){
      this.allEmployeeList = [];
    }
    this.adminServ.getEmployees('Active', this.pageIndex * 100, 100).subscribe(res => {
      if(res){

        // console.log("getEmployeeList res: ",res);
        const data: IEmployeeResponse[] = res;
        this.allEmployeeList = data;
        this.isDataLoaded = true;
      } 
    }, (error) => {
      this.isDataLoaded = true;
    });
  }

  getProjects() {
    this.isDataLoaded = false;
    if(this.pageIndex < 1) {
      this.projects = [];
    }
    this.timesheetSer.getAllProjects(this.pageIndex * 100, 100).subscribe(res => {
      if(res) {
        const data: IProject[] = res;
        this.projects = data;
        this.isDataLoaded = true; 
        // console.log("projects: ", this.projects);       
      }
    })
  }

  getAssignProjects() {
    this.timesheetSer.getAllAssignProjects(this.pageIndex * 100, 100).subscribe(res => {
      if(res) {
        const data: IAssignPro[] = res;
        this.assProjects = data;
        console.log("get assProj res: ", this.assProjects);
      }
    })
  }
  
  submit() {
    if(this.updateForm) {
      if(this.assProjectId.trim() == '') { return }
      this.timesheetSer.updateAssignProject(this.assProjectId, this.assignProjectForm.value).subscribe(res => {
        if(res) {
          this.shareServ.presentToast('Assign Project Updated successfully.', 'top', 'success');
          // console.log("update: ", res);
          this.assignProjectForm.reset();
          this.updateForm = false;
          this.assProjectId = '';
        }
      });
    }
    else {
      console.log("add")
      this.timesheetSer.addAssignProject(this.assignProjectForm.value).subscribe(res => {
        if(res) {
          this.shareServ.presentToast('Assign Project successfully.', 'top', 'success');
          // console.log("add : ", res);
          this.assignProjectForm.reset();
          this.getAssignProjects();
          
        }
      });
    }
  }

  update(assProject: IAssignPro) {
    this.assignProjectForm.patchValue(assProject);
    this.assProjectId = assProject.guid;
    this.updateForm = true;
    if(this.content) {
      this.content.scrollToTop(100);
    }
  }
}
