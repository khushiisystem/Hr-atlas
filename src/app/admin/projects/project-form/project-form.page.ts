import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { IProject } from '../projects.page';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AdminService } from 'src/app/services/admin.service';
import { TimeSheetService } from 'src/app/services/time-sheet.service';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-project-form',
  templateUrl: './project-form.page.html',
  styleUrls: ['./project-form.page.scss'],
})
export class ProjectFormPage implements OnInit {

  isDataLoaded: boolean = false;
  action: string = 'add';
  isInProgress:boolean = false;
  projectsForm!: FormGroup;
  pageIndex:number = 0;
  allEmployeeList: IEmployeeResponse[] = [];
  project!: IProject | any;

  constructor(
    private _fb: FormBuilder,
    public router: Router,
    private modelCtrl: ModalController,
    private adminServ: AdminService,
    private timeSheetSer: TimeSheetService,
    private shareServ: ShareService,
  ) { }

  ngOnInit() {
    this.projectsForm = this._fb.group({
      projectName: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(50)])],
    });
    
    if(this.project) {
      this.projectsForm.patchValue(this.project);
    }
    this.getEmployeeList();
  }
  closeModel() {
    this.modelCtrl.dismiss();
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

  createProject() {
    console.log("res");
    this.timeSheetSer.createProject(this.projectsForm.value).subscribe(res => {
      if(res) {
        console.log("res: ", res);
        this.shareServ.presentToast("Project Created Successfully", 'top', 'success');
        this.modelCtrl.dismiss(res, 'confirm');
      }
    }, (error) => {
      this.shareServ.presentToast(error.error.message, 'top', 'danger');      
    });
  }
  
  updateProject() {}

  submit() {
    console.log("first : ", this.projectsForm.value);
    this.modelCtrl.dismiss(this.projectsForm.value);

    if(this.projectsForm.invalid) {
      return;
    }
    else {
      this.isInProgress = true;
      console.log("second", this.projectsForm.value);
      if(this.action === 'add') {
        this.createProject();
      }
      else {
        this.updateProject();
      }
    }
  }

}
