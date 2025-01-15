import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';
import { TimeSheetService } from 'src/app/services/time-sheet.service';
import { ICategory } from '../timesheet-category.page';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.page.html',
  styleUrls: ['./category-form.page.scss'],
})
export class CategoryFormPage implements OnInit {

  catForm!: FormGroup;
  action: string = 'add';
  categoryId: string = '';
  isDataLoaded: boolean = false; 
  isInProgress:boolean = false;
  category!: ICategory;

  constructor(
    private shareServ: ShareService,
    private timesheetCat: TimeSheetService,
    private _fb: FormBuilder,
    private loader: LoaderService,
    private modelCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.catForm = this._fb.group({
      category: ['', [Validators.required, Validators.minLength(3)]],
      subCategory: this._fb.array([])
    });

    if(this.action === 'update' && this.category) {
      this.category.subCategory.forEach((e: string) =>{
        this.newSubCategory()      
      });
      this.catForm.patchValue(this.category);
      this.categoryId = this.category.guid;

    }
  }
  newSubCategory() {
    const subCategory = this.catForm.controls['subCategory'] as FormArray
    subCategory.push(new FormControl('', Validators.required))
  }

  removeSubCategory(index: number) {
    const subCategory = this.catForm.controls['subCategory'] as FormArray
    subCategory.removeAt(index);
  }

  get SubCategoryArray(): FormArray {
    return this.catForm.controls['subCategory'] as FormArray;
  }
  closeModel() {
    this.modelCtrl.dismiss();
  }

  createCategory() {
    this.timesheetCat.addCategory(this.catForm.value).subscribe(res => {
      if(res) {
        this.shareServ.presentToast("Category Created Successfully", 'top', 'success');
        this.loader.dismiss();
        this.modelCtrl.dismiss(res);        
      }
    }, (error) => {
      this.shareServ.presentToast('Something went wrong', 'top', 'danger');
      this.isInProgress = false;
      this.loader.dismiss();
    });
  }

  updateCategory() {
    this.timesheetCat.updateCategory(this.categoryId, this.catForm.value).subscribe(res => {
      if(res) {
        this.shareServ.presentToast("Category Updated", 'top', 'success');
        this.loader.dismiss();
        this.modelCtrl.dismiss(res);
      }
    }, (error) => {
      this.shareServ.presentToast(error.error.message, 'top', 'danger');
      this.isInProgress = false;
      this.loader.dismiss();
    })
  }

  submit() {
    // this.modelCtrl.dismiss(this.projectsForm.value);
    if(this.catForm.invalid) {
      return;
    }
    else {
      this.isInProgress = true;
      // this.loader.present('');
      if(this.action === 'add') {
        this.createCategory();
      }
      else {
        this.updateCategory();
      }
    }
  }
}
