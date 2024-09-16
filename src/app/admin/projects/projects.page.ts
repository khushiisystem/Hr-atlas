import { debounceTime, map } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { AdminService } from 'src/app/services/admin.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { ProjectFormPage } from './project-form/project-form.page';
import { TimeSheetService } from 'src/app/services/time-sheet.service';
import { RoleStateService } from 'src/app/services/roleState.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

export interface IProject {title: string, guid: string}

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
  selectedProjectId!: string;
  selectedIndex!: number;
  searchTitle: FormControl = new FormControl('');

  constructor(
    public router: Router,
    private modelCtrl: ModalController,
    private timeSheetSer: TimeSheetService,
    private roleStateServ: RoleStateService,
    public _fb: FormBuilder,
    private loader: LoaderService,
    private shareServ: ShareService,
  ) {}

  ngOnInit() {
    this.getAllProjects();

    this.searchTitle.valueChanges.pipe(debounceTime(1000)).subscribe(res => {
      this.isDataLoaded = false;
      this.AllProject = [];
      if (res && res.trim().length > 2) {
        this.onSearch(res);
      } else {
        this.getAllProjects();
      }
    })
  }

  onSearch(value: string) {
    this.isMoreData = false;
    this.timeSheetSer.searchProject(value).subscribe(res =>{
      if(res) {
        for(let i = 0; i < res.data.length; i++) {
          if(!this.AllProject.includes(res.data[i])) {
            this.AllProject.push(res.data[i]);
          }
        }
        this.isDataLoaded = true;
      }
      }, (error) => {
        this.isMoreData = false;
        this.isDataLoaded = true;
      });
  }
  
  getAllProjects() {
    this.timeSheetSer.getAllProjects(this.pageIndex * 10, 10).subscribe(res => {
      if(res) {
        for(let i = 0; i < res.length; i++) {
          if(!this.AllProject.includes(res[i])) {
            this.AllProject.push(res[i]);
          }
        }
        this.isMoreData = res.length > 9;
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
        title: event,
      },
      mode: 'md',
      initialBreakpoint: 0.9
    });
    (await projectModel).present();
    (await projectModel).onDidDismiss().then(result => {
      if(result.data) {
        // this.AllCategory.push(result.data);  
        this.pageIndex = 0;
        this.AllProject = [];
        this.getAllProjects();
      }
    });
  }
  openDeletePopover(projectId: string, index: number) {
    this.selectedProjectId = projectId;
    this.selectedIndex = index;
    // console.log("index: ", index);
    // console.log("projecrId: ", projectId);
  }
  deleteCat() {
    if (this.selectedProjectId) {
      this.loader.present('');
      this.timeSheetSer.deleteProject(this.selectedProjectId).subscribe(
        (res) => {
          if(res) {
            this.AllProject = this.AllProject.filter(project => project._id !== this.selectedProjectId);
            this.shareServ.presentToast('Project Deleted Successfully', 'top', 'success') 
            this.loader.dismiss(); 
            this.AllProject = [];
            this.pageIndex = 0;
            this.getAllProjects();   
          }
          else{
            this.shareServ.presentToast("Something weng wrong", 'top', 'danger');
            this.loader.dismiss();
          }
        },
        (error) => {
          console.error('Error deleting project:', error);
          this.loader.dismiss();
        }
      );
    }
  }


}
