import { map } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { AdminService } from 'src/app/services/admin.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { ProjectFormPage } from './project-form/project-form.page';
import { TimeSheetService } from 'src/app/services/time-sheet.service';
import { RoleStateService } from 'src/app/services/roleState.service';

export interface IProject {projectName: string}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.page.html',
  styleUrls: ['./projects.page.scss'],
})
export class ProjectsPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  isDataLoaded: boolean = false;
  searchString: string = "";
  userRole: string = "";
  projectForm!: FormGroup;
  AllProject : any[] = [];
  isMoreData: boolean = true;
  pageIndex: number = 0;
  // isHold: boolean = false;

  // projects: IProject[] = [{projectName:'iMentorly'}, {projectName:'Wokari'}, {projectName:'EdFlik'}, {projectName:'HrAtlas'}];

  constructor(
    public router: Router,
    private modelCtrl: ModalController,
    private timeSheetSer: TimeSheetService,
    private roleStateServ: RoleStateService,
    public _fb: FormBuilder,
  ) {}

  ngOnInit() {
    this.projectForm = this._fb.group({
      projectName: [''],
      // employeeId: [''],
    });
    this.getAllProjects();
  }

  onSearch() {
  }  
  
  getAllProjects() {
    this.timeSheetSer.getAllProjects(this.pageIndex * 10, 10).subscribe(res => {
      if(res) {
        const data: any[] = res;
        console.log("data : ", data)

        this.isDataLoaded = true;
        for(let i = 0; i < data.length; i++) {
          if(!this.AllProject.includes(data[i])) {
            this.AllProject.push(res[i]);
          }
        }
        this.isMoreData = data.length > 9;
        this.infiniteScroll.complete();
        this.isDataLoaded = true;
      }
    }, (error) => {
      this.isMoreData = false;
      this.isDataLoaded = true;
      this.infiniteScroll.complete();
    });
  }

  loadData(event: any) {
    if(this.isMoreData) {
      this.pageIndex ++;
      this.getAllProjects();
    }
  }
  
  async projectMoal(event: IProject | null, action: "add" | "update"){
    const projectModel = this.modelCtrl.create({
      component: ProjectFormPage,
      componentProps: {
        action: action,
        project: event,
      },
      mode: 'md',
      initialBreakpoint: 0.9
    });
    (await projectModel).present();
    (await projectModel).onDidDismiss().then(result => {
      console.log("result: ",result)
      if(result.data) {
        this.AllProject.push(result.data);  
      }
    });
  }
}
