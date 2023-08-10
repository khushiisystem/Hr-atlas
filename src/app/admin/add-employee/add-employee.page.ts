import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DatetimeChangeEventDetail, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { AdminService } from 'src/app/services/admin.service';
import { ShareService } from 'src/app/services/share.service';

interface DatetimeCustomEvent extends CustomEvent {
  detail: DatetimeChangeEventDetail;
  target: HTMLIonDatetimeElement;
}


@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.page.html',
  styleUrls: ['./add-employee.page.scss'],
})
export class AddEmployeePage implements OnInit {
  employeeForm!: FormGroup;
  openCalendar: boolean = false;
  today: Date = new Date();
  maxDate: Date = new Date();
  birthDate: any;
  employeeId: string = '';
  action: string = '';

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private adminServ: AdminService,
    private shareServ: ShareService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.today = new Date();
    this.maxDate.setFullYear(this.today.getFullYear() - 10);

    this.employeeForm = this.fb.group({
      firstName: ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      lastName: ['', Validators.compose([Validators.maxLength(50)])],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      mobileNumber: ['', Validators.compose([Validators.required, Validators.maxLength(10)])],
      dateOfBirth: ['', Validators.compose([Validators.required])],
      address: [''],
      gender: ['Male']
    });

    this.birthDate = this.employeeForm.controls['dateOfBirth'].value;
    console.log(this.employeeForm.value, "form");
    console.log(this.birthDate);
    console.warn(this.action, "action");
    console.warn(this.employeeId, "empId");
  }

  selectDate(event: DatetimeCustomEvent){
    this.employeeForm.patchValue({
      dateOfBirth: moment.utc(event.detail.value).format()
    });
    this.getDate();
    console.log(this.employeeForm.value);
  }

  getDate(){
    const formDate = this.employeeForm.controls['dateOfBirth'].value;
    return new Date(formDate != '' ? formDate : this.maxDate);
  }

  submit(){
    if(this.employeeForm.invalid){
      return;
    } else {
      console.log(this.employeeForm.value, "form");
      this.adminServ.addEmployees(this.employeeForm.value).subscribe(res => {
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
