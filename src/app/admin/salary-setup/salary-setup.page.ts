import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatetimeChangeEventDetail } from '@ionic/angular';
import * as moment from 'moment';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';
import { IEmpSelect } from 'src/app/share/employees/employees.page';

interface DatetimeCustomEvent extends CustomEvent {
  detail: DatetimeChangeEventDetail;
  target: HTMLIonDatetimeElement;
}

@Component({
  selector: 'app-salary-setup',
  templateUrl: './salary-setup.page.html',
  styleUrls: ['./salary-setup.page.scss'],
})
export class SalarySetupPage implements OnInit {
  employeeId: string = '';
  employee!: IEmpSelect;
  salarySetupForm!: FormGroup;
  openCalendar1: boolean = false;
  isInProcess: boolean = false;
  calculatedValue: number = 0;

  constructor(
    private fb: FormBuilder,
    private shareServ: ShareService,
    private loader: LoaderService,
    private adminServ: AdminService,
  ) { }

  ngOnInit() {
    this.formSetup();
  }

  formSetup(){
    this.salarySetupForm = this.fb.group({
      employeeId: ['', Validators.required],
      effectiveDate: ['', Validators.required],
      lastIncrementDate: [''],
      current_ctc: ['', Validators.compose([Validators.required, Validators.min(0)])],
      increment:['', Validators.compose([Validators.required, Validators.min(0), Validators.max(100)])],
    });
  }

  selectEmploye(event: IEmpSelect) {
    this.employee = event;
    this.employeeId = event.employeeId;
    // this.getPreviousRevision();
    this.salarySetupForm.patchValue({
      employeeId: this.employeeId
    });
  }
  reseteEmployee(){this.employee = null as any; this.employeeId = '';}

  getValue(ctrlName: string) {
    const formValue = this.salarySetupForm.controls[ctrlName].value;
    return formValue ? new Date(moment(formValue).format()) : '';
  }


  setEffectiveDate(event: DatetimeCustomEvent){
    console.log(event, "effectiveDate");
    this.salarySetupForm.patchValue({
      effectiveDate: moment.utc(event.detail.value).format()
    });
    console.log(this.salarySetupForm.value);
    this.openCalendar1 = false;
  }

  getPreviousRevision(){
    this.adminServ.getEmloyeeSalarySetup(this.employeeId).subscribe(res => {
      if(res) {
        console.log(res, 'previous revision');
        this.salarySetupForm.patchValue({
          lastIncrementDate: res.effectiveDate
        });
      }
    });
  }

  calculateTotal(){
    const hikePer = this.salarySetupForm.controls['increment'].value;
    const currentCtc = this.salarySetupForm.controls['current_ctc'].value;
    if(hikePer && currentCtc){
      const incresedValue = (currentCtc * hikePer) / 100;
      this.calculatedValue = currentCtc + incresedValue;
    }
  }

  submit(){
    if(this.salarySetupForm.invalid){
      return;
    } else {
      this.isInProcess = true;
      this.loader.present('');
      console.log(this.salarySetupForm.value, 'form');
      // this.adminServ.employeeSalarySetup(this.salarySetupForm.value).subscribe(res => {
      //   if(res) {
      //     console.log(res);
      //     this.isInProcess = false;
      //     this.shareServ.presentToast('Salary setup successfully', 'top', 'danger');
      //     history.back();
      //   }
      // }, (error) => {
      //   this.shareServ.presentToast(error.error.message, 'top', 'danger');
      //   this.isInProcess = false;
      // });
      this.loader.dismiss();
      this.isInProcess = false;
    }
  }

  goBack(){history.back();}

}
