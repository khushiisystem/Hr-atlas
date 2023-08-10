import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
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
  inProgress: boolean = false;
  today: Date = new Date();
  leaveId: string = '';
  action: string = 'add';

  constructor(
    private fb: FormBuilder,
    private adminServ: AdminService,
    private modalCtrl: ModalController,
    private shareServ: ShareService,
    private loaderServ: LoaderService,
  ) { }

  ngOnInit() {
    this.loaderServ.present('');
    this.today = new Date();

    this.earningForm = this.fb.group({
      creditCycle: ['', Validators.required],
      creditPeriod: ['', Validators.required],
      annualLeave: ['', Validators.compose([Validators.required, Validators.min(0), Validators.max(365)])],
      creditLeave: ['', Validators.compose([Validators.required, Validators.min(0), Validators.max(365)])],
    });

    console.log(this.earningForm.value, "form");
    console.warn(this.action, "action");
    console.warn(this.leaveId, "empId");
    this.loaderServ.dismiss();
  }

  submit(){
    if(this.earningForm.invalid){
      return;
    } else {
      const formData: IPayrollSetupRequest = {...this.earningForm.value}
      console.log(this.earningForm.value, "form");
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

  goBack(){this.modalCtrl.dismiss();}

}
