import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ISubCategory } from '../timesheet-sub-category.page';
import { ShareService } from 'src/app/services/share.service';
import { TimeSheetService } from 'src/app/services/time-sheet.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ModalController } from '@ionic/angular';
import { ICategory } from '../../timesheet-category/timesheet-category.page';

@Component({
  selector: 'app-sub-category-form',
  templateUrl: './sub-category-form.page.html',
  styleUrls: ['./sub-category-form.page.scss'],
})
export class SubCategoryFormPage implements OnInit {

  subCategoryForm!: FormGroup;
  action: string = 'add';
  subCategoryId: string = '';
  isDataLOaded: boolean = false;
  isInProgress: boolean = false;
  subCategory!: ISubCategory | any;
  categories: ICategory[] = [];
  isDataLoaded: boolean = true;
  pageIndex: number = 0;


  constructor(
    private shareServ: ShareService,
    private timesheetServ: TimeSheetService,
    private _fb: FormBuilder,
    private loader: LoaderService,
    private modalCtrl: ModalController,
    private timesheetSer: TimeSheetService,
  ) { }

  ngOnInit() {
    this.subCategoryForm = this._fb.group({
      categoryId: ['', Validators.required],
      subCategory: ['', [Validators.required, Validators.minLength(3)]],
    });

    if(this.action === 'update' && this.subCategory) {
      const data = this.subCategory as ISubCategory;
      this.subCategoryForm.patchValue(data);
      this.subCategoryId = data.guid;

    }
    this.getCategories();
  }

  closeModel() {
    this.modalCtrl.dismiss();
  }

  getCategories() {
    this.timesheetSer.getAllCategories(this.pageIndex * 100, 100).subscribe(res => {
      if(res) {
        const data: ICategory[] = res;
        this.categories = data;
        this.isDataLoaded = true;
      }
    })
  }

  createSubCategory() {
    this.timesheetServ.addSubCateory(this.subCategoryForm.value).subscribe(res => {
      if(res) {
        this.shareServ.presentToast("SubCategory Created Successfully", 'top', 'success');
        this.loader.dismiss();
        this.modalCtrl.dismiss(res);
      }
    }, (error) => {
      this.shareServ.presentToast("Something weing wrong", 'top', 'danger');
      this.isInProgress = false;
      this.loader.dismiss();
    })
  }

  updateSubCategory() {
    this.timesheetServ.updateSubCategory(this.subCategoryId, this.subCategoryForm.value).subscribe(res => {
      if(res) {
        this.shareServ.presentToast("SubCategory Updated", 'top', 'success');
        this.loader.dismiss();
        this.modalCtrl.dismiss(res);
      }
    }, (error) => {
      this.shareServ.presentToast('Something went wrong', 'top', 'danger');
    })
  }

  submit() {
    if(this.subCategoryForm.invalid) {
      return;
    }
    else {
      this.isInProgress = true;
      if(this.action == 'add') {
        this.createSubCategory();
      }
      else {
        this.updateSubCategory();
      }
    }
  }

}
