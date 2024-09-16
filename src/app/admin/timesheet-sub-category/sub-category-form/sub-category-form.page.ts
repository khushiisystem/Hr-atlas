import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ISubCategory } from '../timesheet-sub-category.page';
import { ShareService } from 'src/app/services/share.service';
import { TimeSheetService } from 'src/app/services/time-sheet.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ModalController } from '@ionic/angular';

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

  constructor(
    private shareServ: ShareService,
    private timesheetServ: TimeSheetService,
    private _fb: FormBuilder,
    private loader: LoaderService,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.subCategoryForm = this._fb.group({
      subCategory: [''],
    });

    if(this.action === 'update' && this.subCategory) {
      const data = this.subCategory as ISubCategory;
      this.subCategoryForm.patchValue(data);
      this.subCategoryId = data.guid;

      console.log("subCategory: ", this.subCategoryId);
      console.log("subCategoryId: ", data.guid);
    }
  }

  closeModel() {
    this.modalCtrl.dismiss();
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
        this.modalCtrl.dismiss();
      }
    }, (error) => {
      this.shareServ.presentToast('Something went wrong', 'top', 'danger');
    })
  }

  submit() {
    console.log("form value: ", this.subCategoryForm.value);
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
