import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatetimeCustomEvent, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-leave-setup',
  templateUrl: './leave-setup.page.html',
  styleUrls: ['./leave-setup.page.scss'],
})
export class LeaveSetupPage implements OnInit {
  leaveSetupForm!: FormGroup;
  inProgress: boolean = false;
  today: Date = new Date();

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

    this.leaveSetupForm = this.fb.group({
      creditCycle: ['', Validators.required],
      creditPeriod: ['', Validators.required],
      annualLeave: ['', Validators.compose([Validators.required, Validators.min(0), Validators.max(365)])],
      creditLeave: ['', Validators.compose([Validators.required, Validators.min(0), Validators.max(365)])],
      reserveDays: 0,
    });

    this.getSetup();
  }
  
  getSetup(){
    this.adminServ.getLeaveSetup().subscribe(res => {
      if(res) {
        this.leaveSetupForm.patchValue(res);
      }
      this.loaderServ.dismiss();
    }, (error) => {
      this.loaderServ.dismiss();
    });
  }

  submit(){
    if(this.leaveSetupForm.invalid){
      return;
    } else {
      this.adminServ.addLeaveSetup(this.leaveSetupForm.value).subscribe(res => {
        if(res){
          this.shareServ.presentToast('Leave setup successfully.', 'top', 'success');
          this.modalCtrl.dismiss(res, 'confirm');
        }
      }, (error) =>{
        this.shareServ.presentToast('Something is wrong.', 'bottom', 'danger');
      });
    }
  }

  goBack(){this.modalCtrl.dismiss();}

}
