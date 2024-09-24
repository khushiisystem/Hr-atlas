import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  category!: ICategory | any;

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
    });

    if(this.action === 'update' && this.category) {
      const data = this.category as ICategory
      this.catForm.patchValue(data);
      this.categoryId = data.guid;

      console.log("category: ", this.categoryId);
      console.log("data: ", data.guid)
    }
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
    console.log("first : ", this.catForm.value);
    // this.modelCtrl.dismiss(this.projectsForm.value);
    if(this.catForm.invalid) {
      return;
    }
    else {
      this.isInProgress = true;
      // this.loader.present('');
      if(this.action === 'add') {
        this.createCategory();
        console.log("second", this.catForm.value);
      }
      else {
        this.updateCategory();
      }
    }
  }
}
