import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { IPayrollSetupRequest } from 'src/app/interfaces/request/IPayrollSetup';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-payroll-setup',
  templateUrl: './payroll-setup.page.html',
  styleUrls: ['./payroll-setup.page.scss'],
})
export class PayrollSetupPage implements OnInit {
  earningForm!: FormGroup;
  deductionForm!: FormGroup;
  inProgress: boolean = false;
  dateModal: boolean = false;
  today: Date = new Date();
  payslipDate: Date = new Date();
  leaveId: string = '';
  employeeId: string = '';
  activeTab: string = 'earning';

  constructor(
    private fb: FormBuilder,
    private adminServ: AdminService,
    private modalCtrl: ModalController,
    private shareServ: ShareService,
    private loaderServ: LoaderService,
    private activeRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.loaderServ.present('');
    this.employeeId = this.activeRoute.snapshot.params?.['employeeId'];
    this.today = new Date();

    this.earningForm = this.fb.group({
      ctc: [0, Validators.compose([Validators.required, Validators.min(0)])],
      hra: [0, Validators.compose([Validators.min(0)])],
      basics: [0, Validators.compose([Validators.min(0)])],
      salary: [0, Validators.compose([Validators.required, Validators.min(0)])],
      specialAllowance: [0, Validators.compose([Validators.min(0)])],
      payslipDate: [moment.utc(this.payslipDate).format(), Validators.required]
    });

    this.deductionForm = this.fb.group({
      lop: [0, Validators.compose([Validators.required, Validators.min(0), Validators.max(365)])],
      incomeTax: [0, Validators.compose([Validators.required, Validators.min(0)])],
      pt: [0, Validators.compose([Validators.required, Validators.min(0)])],
      comment: ['', Validators.compose([Validators.maxLength(1000)])]
    });

    console.log(this.earningForm.value, "form");
    console.log(this.deductionForm.value, "form");
    this.loaderServ.dismiss();
  }

  selectPayslipDate(event: any){
    console.log(event.detail.value, "event");
    if(this.payslipDate){
      this.earningForm.patchValue({
        payslipDate: moment.utc(this.payslipDate).format()
      });
    }
  }

  getMonthYear(){
    let customDate = '';
    let monthArray = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    if(this.payslipDate){
      customDate = `${monthArray[new Date(this.payslipDate).getMonth()]} ${new Date(this.payslipDate).getFullYear()}`;
    }
    return customDate;
  }

  saveEarnings(){
    console.log(this.earningForm.value, "earnign from");
    this.activeTab = 'deductions';
  }

  submit(){
    if(this.earningForm.invalid || this.deductionForm.invalid){
      return;
    } else {
      let formData: IPayrollSetupRequest = {...this.earningForm.value, ...this.deductionForm.value};
      formData.employeeId = this.employeeId;
      formData.currency = 'INR';
      console.log(formData, "formData");
      this.adminServ.addEmployees(this.earningForm.value).subscribe(res => {
        if(res){
          this.shareServ.presentToast('Employee added successfully.', 'top', 'success');
          this.modalCtrl.dismiss(res, 'confirm');
        }
      }, (error) =>{
        this.shareServ.presentToast('Something is wrong.', 'bottom', 'danger');
      });
    }
  }

  goBack(){history.back();}

}
