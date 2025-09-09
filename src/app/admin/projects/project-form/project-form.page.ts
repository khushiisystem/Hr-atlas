import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { IProject } from '../projects.page';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AdminService } from 'src/app/services/admin.service';
import { TimeSheetService } from 'src/app/services/time-sheet.service';
import { ShareService } from 'src/app/services/share.service';
import { LoaderService } from 'src/app/services/loader.service';

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
  title!: IProject | any;
  projectId!: string;

  constructor(
    private _fb: FormBuilder,
    public router: Router,
    private modelCtrl: ModalController,
    private adminServ: AdminService,
    private timeSheetSer: TimeSheetService,
    private shareServ: ShareService,
    private loader: LoaderService,
  ) { }

  ngOnInit() {
    this.projectsForm = this._fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      isDefault: [false]
    });
    
    if(this.action === 'update' && this.title) {
      const data = this.title as IProject;
      this.projectsForm.patchValue(data);
      this.projectId = data.guid;

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
    this.timeSheetSer.addProject(this.projectsForm.value).subscribe(res => {
      if(res) {
        this.shareServ.presentToast("Project Created Successfully", 'top', 'success');
        this.loader.dismiss();
        this.modelCtrl.dismiss(res);
      }
    }, (error) => {
      this.shareServ.presentToast("Something went wrong", 'top', 'danger');
      this.isInProgress = false;
      this.loader.dismiss();
    })
  }
  
  updateProject() {
    this.timeSheetSer.updateProject(this.projectId, this.projectsForm.value).subscribe(res => {
      if(res) {
        this.shareServ.presentToast("Project Updated Successfully", 'top', 'success');
        this.loader.dismiss();
        this.modelCtrl.dismiss(res);
      }
    }, (error) => {
      this.shareServ.presentToast("Something went wrong", 'top', 'danger');
      this.isInProgress = false;
      this.loader.dismiss();
    })
  }

  submit() {
    // this.modelCtrl.dismiss(this.projectsForm.value);

    if(this.projectsForm.invalid) {
      return;
    }
    else {
      this.isInProgress = true;
      if(this.action === 'add') {
        this.createProject();
      }
      else {
        this.updateProject();
      }
    }
  }
}
