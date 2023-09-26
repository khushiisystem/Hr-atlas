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

  constructor(
    private fb: FormBuilder,
    private shareServ: ShareService,
    private loader: LoaderService,
    private adminServ: AdminService,
  ) { }

  ngOnInit() {
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
      current_ctc: [0, Validators.compose([Validators.min(0)])],
      increment:[0, Validators.compose([Validators.required, Validators.min(0), Validators.max(100)])],
    });
  }

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
    this.isInProcess = true;
    this.adminServ.getEmloyeeReviseSalary(this.employeeId).subscribe(res => {
      if(res) {
        this.salarySetupForm.patchValue({
          lastIncrementDate: res.effectiveDate,
        });
        this.previousSalary = res.current_ctc;
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
    const percent = (currentCtc - this.previousSalary) / this.previousSalary;
    this.salarySetupForm.patchValue({
      increment: percent.toFixed(2),
      currentCtc: this.calculatedValue
    });
    // console.log(reviceSalary, 'revice\n', percent, ' incre\n', currentCtc, ' current\n', this.calculatedValue, 'calc');
    console.log(this.salarySetupForm.value);
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
      console.log(this.salarySetupForm.value, 'form');
      this.adminServ.employeeSalarySetup(this.salarySetupForm.value).subscribe(res => {
        if(res) {
          console.log(res);
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
