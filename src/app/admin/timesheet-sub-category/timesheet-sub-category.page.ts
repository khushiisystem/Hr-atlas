import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { RoleStateService } from 'src/app/services/roleState.service';
import { TimeSheetService } from 'src/app/services/time-sheet.service';
import { SubCategoryFormPage } from './sub-category-form/sub-category-form.page';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';
import { debounceTime } from 'rxjs';

export interface ISubCategory {subCategory: string, guid: string}

@Component({
  selector: 'app-timesheet-sub-category',
  templateUrl: './timesheet-sub-category.page.html',
  styleUrls: ['./timesheet-sub-category.page.scss'],
})
export class TimesheetSubCategoryPage {

  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  isDataLoaded: boolean = false;
  searchString: string = "";
  userRole: string = "";
  subCategoryForm!: FormGroup;
  AllSubCategory : any[] = [];
  isMoreData: boolean = true;
  pageIndex: number = 0;
  selectedSubCatId!: string;
  selectedIndex!: number;
  searchSubCategory: FormControl = new FormControl('');

  constructor(
    public router: Router,
    private modelCtrl: ModalController,
    private timeSheetSer: TimeSheetService,
    private roleStateServ: RoleStateService,
    public _fb: FormBuilder,
    private loader: LoaderService,
    private shareServ: ShareService,
  ) { }

  ngOnInit() {
    // this.subCategoryForm = this._fb.group({
    //   subCategory:['']
    // });

    this.getAllSubCategories();
    this.searchSubCategory.valueChanges.pipe(debounceTime(1000)).subscribe(res => {
      this.isDataLoaded = false;
      this.AllSubCategory = [];
      if(res && res.trim().length > 2) {
        this.onSearch(res);
      }else {
        this.getAllSubCategories();
      }
    })
  }

  onSearch(value: string) {
    this.isMoreData = false;
    this.timeSheetSer.searchSubCategory(value).subscribe(res => {
      if(res && res.data) {
        console.log("res.data: ", res.data);
        res.data.forEach((subCategory: any) => {
          if(!this.AllSubCategory.includes(subCategory)) {
            this.AllSubCategory.push(subCategory);
          }
        });
        this.isDataLoaded = true;
      }
    }, (error) => {
      this.isMoreData = false;
      this.isDataLoaded = false;
    })
  }

  getAllSubCategories() {
    this.timeSheetSer.getAllSubCategories(this.pageIndex * 10, 10).subscribe(res => {
      if(res) {
        const data: any[] = res;
        console.log("sub-categories : ", data);
        
        this.isDataLoaded = true;
        for(let i = 0; i < data.length; i++) {
          if(!this.AllSubCategory.includes(data[i])) {
            this.AllSubCategory.push(res[i]);
          }
        }
        this.isMoreData = data.length > 9;
        this.infiniteScroll.complete();
        this.isDataLoaded  = true;
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


  async subCategoryMoal(event: ISubCategory | null, action: "add" | "update"){
    const projectModel = this.modelCtrl.create({
      component: SubCategoryFormPage,
      componentProps: {
        action: action,
        subCategory: event,
      },
      mode: 'md',
      initialBreakpoint: 0.9
    });
    (await projectModel).present();
    (await projectModel).onDidDismiss().then(result => {
      console.log("result: ",result)
      if(result.data) {
        // this.AllSubCategory.push(result.data);  
        this.pageIndex = 0;
        this.AllSubCategory = [];
        this.getAllSubCategories();
      }
    });
  }



  openDeletePopover(projectId: string, index: number) {
    this.selectedSubCatId = projectId;
    this.selectedIndex = index;
    // console.log("index: ", index);
    // console.log("projecrId: ", projectId);
  }

  deleteCat() {
    if (this.selectedSubCatId) {
      this.loader.present('');
      this.timeSheetSer.deleteSubCategory(this.selectedSubCatId).subscribe(
        (res) => {
          if(res) {
            this.AllSubCategory = this.AllSubCategory.filter(project => project._id !== this.selectedSubCatId);
            this.shareServ.presentToast('Sub Category Deleted Successfully', 'top', 'success');            
            this.loader.dismiss(); 
            this.AllSubCategory = [];
            this.pageIndex = 0;
            this.getAllSubCategories();   
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
