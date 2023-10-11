import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
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
  @Input() employee!: IEmpSelect;
  @Output() createSalary: EventEmitter<'confirm' | 'cancel'> = new EventEmitter();
  employeeId: string = '';
  salarySetupForm!: FormGroup;
  openCalendar1: boolean = false;
  isInProcess: boolean = false;
  calculatedValue: number = 0;
  previousSalary: number = 0;
  maxDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private shareServ: ShareService,
    private loader: LoaderService,
    private adminServ: AdminService,
  ) { }

  ngOnInit() {
    const today = new Date();
    this.maxDate = today;
    this.maxDate.setFullYear(today.getFullYear() + 1, today.getMonth(), today.getDate());
    this.formSetup();
    if(this.employee) {
      this.employeeId = this.employee.guid;
      this.getPreviousRevision();
      this.salarySetupForm.patchValue({
        employeeId: this.employeeId
      });
    }
  }

  formSetup(){
    this.salarySetupForm = this.fb.group({
      employeeId: ['', Validators.required],
      effectiveDate: ['', Validators.required],
      lastIncrementDate: [''],
      current_ctc: [0, Validators.compose([Validators.required, Validators.min(0)])],
      increment: 0,
      advanceSalary: 0,
      deductionAmount: 0,
    });
  }

  getValue(ctrlName: string) {
    const formValue = this.salarySetupForm.controls[ctrlName].value;
    return formValue ? new Date(moment(formValue).format()) : '';
  }


  setEffectiveDate(event: DatetimeCustomEvent){
    this.salarySetupForm.patchValue({
      effectiveDate: moment.utc(event.detail.value).format()
    });
    this.openCalendar1 = false;
  }

  getPreviousRevision(){
    this.isInProcess = true;
    this.adminServ.getEmloyeeReviseSalary(this.employeeId).subscribe(res => {
      if(res) {
        this.salarySetupForm.patchValue({
          lastIncrementDate: res.effectiveDate,
        });
        this.previousSalary = res.current_ctc;
        this.isInProcess = false;
      } else {
        this.isInProcess = false;
      }
    }, (error) => {
      this.isInProcess = false;
    });
  }

  calculateTotal(){
    // const hikePer = this.salarySetupForm.controls['increment'].value;
    const currentCtc = this.salarySetupForm.controls['current_ctc'].value;
    // if(hikePer && reviceSalary){
    //   const incresedValue = (reviceSalary * hikePer) / 100;
    //   this.calculatedValue = reviceSalary + incresedValue;
    // } else if(reviceSalary){
    //   this.calculatedValue = currentCtc;
    // }
    if(this.previousSalary > 0){
      const percent = ((currentCtc - this.previousSalary) / this.previousSalary) * 100;
      this.salarySetupForm.patchValue({
        increment: percent.toFixed(2),
      });
    }
  }

  submit(){
    if(this.salarySetupForm.invalid){
      return;
    } else {
      this.isInProcess = true;
      this.loader.present('');
      if(!this.salarySetupForm.controls['lastIncrementDate'].value){
        this.salarySetupForm.patchValue({
          lastIncrementDate: null
        });
      }
      this.adminServ.employeeSalarySetup(this.salarySetupForm.value).subscribe(res => {
        if(res) {
          this.shareServ.presentToast('Salary setup successfully', 'top', 'success');
          this.isInProcess = false;
          this.createSalary.emit('confirm');
          this.loader.dismiss();
        }
      }, (error) => {
        this.shareServ.presentToast(error.error.message, 'top', 'danger');
        this.loader.dismiss();
        this.isInProcess = false;
      });
    }
  }

}
