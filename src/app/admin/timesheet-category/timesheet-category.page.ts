import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { RoleStateService } from 'src/app/services/roleState.service';
import { TimeSheetService } from 'src/app/services/time-sheet.service';

export interface ICategory {category: string}

@Component({
  selector: 'app-timesheet-category',
  templateUrl: './timesheet-category.page.html',
  styleUrls: ['./timesheet-category.page.scss'],
})
export class TimesheetCategoryPage implements OnInit {

  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  isDataLoaded: boolean = false;
  searchString: string = "";
  userRole: string = "";
  categoryForm!: FormGroup;
  AllCategory : any[] = [];
  isMoreData: boolean = true;
  pageIndex: number = 0;
  
  // AllProject : any[] = [];

  constructor(
    public router: Router,
    private modelCtrl: ModalController,
    private timeSheetSer: TimeSheetService,
    private roleStateServ: RoleStateService,
    public _fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.categoryForm = this._fb.group({
      category: ['']
    });
    this.getAllCategories();
  }

  onSearch() {
  }

  getAllCategories() {
    this.timeSheetSer.getAllCategories(this.pageIndex * 10, 10).subscribe(res => {
      if(res) {
        const data: any[] = res;
        console.log("data: ", data);

        this.isDataLoaded = true;
        for(let i = 0; i < data.length; i++) {
          if(!this.AllCategory.includes(data[i])) {
            this.AllCategory.push(res[i]);
          }
        }
        this.isMoreData = data.length> 9;
        this.infiniteScroll.complete();
        this.isDataLoaded = true
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
      this.getAllCategories();
    }
  }
  
  // async projectMoal(event: ICategory | null, action: "add" | "update"){
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
