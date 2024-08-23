import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { RoleStateService } from 'src/app/services/roleState.service';
import { TimeSheetService } from 'src/app/services/time-sheet.service';

export interface ISubCategory {subCategory: string}

@Component({
  selector: 'app-timesheet-sub-category',
  templateUrl: './timesheet-sub-category.page.html',
  styleUrls: ['./timesheet-sub-category.page.scss'],
})
export class TimesheetSubCategoryPage implements OnInit {

  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  isDataLoaded: boolean = false;
  searchString: string = "";
  userRole: string = "";
  subCategoryForm!: FormGroup;
  // AllProject : any[] = [];
  AllSubCategories : any[] = [];
  isMoreData: boolean = true;
  pageIndex: number = 0;

  constructor(
    public router: Router,
    private modelCtrl: ModalController,
    private timeSheetSer: TimeSheetService,
    private roleStateServ: RoleStateService,
    public _fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.subCategoryForm = this._fb.group({
      subCategory: ['']
    });
    this.getAllSubCategories();
  }

  onSearch() {
  }

  getAllSubCategories() {
    this.timeSheetSer.getAllSubCategories(this.pageIndex * 10, 10).subscribe(res => {
      if(res) {
        const data: any[] = res;
        console.log("data: ", data)

        this.isDataLoaded = true;
        for(let i = 0; i < data.length; i++) {
          if(!this.AllSubCategories.includes(data[i])) {
            this.AllSubCategories.push([res[i]]);
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
      this.getAllSubCategories();
    }
  }

  // getAllProjects() {
  //   this.timeSheetSer.getAllProjects(this.pageIndex * 10, 10).subscribe(res => {
  //     if(res) {
  //       const data: any[] = res;
  //       console.log("data : ", data)

  //       this.isDataLoaded = true;
  //       for(let i = 0; i < data.length; i++) {
  //         if(!this.AllProject.includes(data[i])) {
  //           this.AllProject.push(res[i]);
  //         }
  //       }
  //       this.isMoreData = data.length > 9;
  //       this.infiniteScroll.complete();
  //       this.isDataLoaded = true;
  //     }
  //   }, (error) => {
  //     this.isMoreData = false;
  //     this.isDataLoaded = true;
  //     this.infiniteScroll.complete();
  //   });
  // }
  
  // async projectMoal(event: ISubCategory | null, action: "add" | "update"){
  //   const projectModel = this.modelCtrl.create({
  //     component: ProjectFormPage,
  //     componentProps: {
  //       action: action,
  //       project: event,
  //     },
  //     mode: 'md',
  //     initialBreakpoint: 0.9
  //   });
  //   (await projectModel).present();
  //   (await projectModel).onDidDismiss().then(result => {
  //     console.log("result: ",result)
  //     if(result.data) {
  //       this.AllProject.push(result.data);  
  //     }
  //   });
  // }

}
