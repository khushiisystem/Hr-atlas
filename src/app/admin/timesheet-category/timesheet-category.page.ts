import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { RoleStateService } from 'src/app/services/roleState.service';
import { TimeSheetService } from 'src/app/services/time-sheet.service';
import { CategoryFormPage } from './category-form/category-form.page';
import { ShareService } from 'src/app/services/share.service';
import { LoaderService } from 'src/app/services/loader.service';
import { debounceTime } from 'rxjs';

export interface ICategory {category: string, guid: string}

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
  selectedProjectId!: string;
  selectedIndex!: number;
  action: string = 'add';
  categoryId!: string;
  searchCategory: FormControl = new FormControl('');
  
  constructor(
    public router: Router,
    private modelCtrl: ModalController,
    private timeSheetSer: TimeSheetService,
    private roleStateServ: RoleStateService,
    private shareServ: ShareService,
    public _fb: FormBuilder,
    private loader: LoaderService,
  ) { }

  ngOnInit() {
    this.getAllCategories();

    this.searchCategory.valueChanges.pipe(debounceTime(1000)).subscribe(res => {
      this.isDataLoaded = false;
      this.AllCategory = [];
      if (res && res.trim().length > 2) {
        this.onSearch(res);
      } else {
        this.getAllCategories();
      }
    })
  }

  onSearch(value: string) {
    this.isMoreData = false;
    this.timeSheetSer.searchCategory(value).subscribe(res => {
      if(res && res.data) {
        console.log("res: ", res.data);
        res.data.forEach((category: any) => {
          if (!this.AllCategory.includes(category)) {
            this.AllCategory.push(category);
          }
        });
        this.isDataLoaded = true;
        this.AllCategory = [];
      }
    }, (error) => {
      this.isMoreData = false;
      this.isDataLoaded = true;
      this.AllCategory = [];
    });
  }

  
  getAllCategories() {
    this.timeSheetSer.getAllCategories(this.pageIndex * 10, 10).subscribe(res => {
      if(res) {
        for(let i = 0; i < res.length; i++) {
          if(!this.AllCategory.includes(res[i])) {
            this.AllCategory.push(res[i]);
          }
        }
        this.isMoreData = res.length> 9;
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
  
  async projectMoal(event: ICategory | null, action: "add" | "update"){
    const projectModel = this.modelCtrl.create({
      component: CategoryFormPage,
      componentProps: {
        action: action,
        category: event,
      },
      mode: 'md',
      initialBreakpoint: 0.9
    });
    (await projectModel).present();
    (await projectModel).onDidDismiss().then(result => {
      console.log("result: ",result)
      if(result.data) {
        // this.AllCategory.push(result.data);  
        this.pageIndex = 0;
        this.AllCategory = [];
        this.getAllCategories();
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
      this.timeSheetSer.deleteCategory(this.selectedProjectId).subscribe(
        (res) => {
          if(res) {
            this.AllCategory = this.AllCategory.filter(project => project._id !== this.selectedProjectId);
            this.shareServ.presentToast('Category Deleted Successfully', 'top', 'success');            
            this.loader.dismiss(); 
            this.AllCategory = [];
            this.pageIndex = 0;
            this.getAllCategories();   

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
