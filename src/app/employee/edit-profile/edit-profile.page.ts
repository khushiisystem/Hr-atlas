import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatetimeCustomEvent, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  employeeForm!: FormGroup;
  openCalendar: boolean = false;
  today: Date = new Date();
  maxDate: Date = new Date();
  birthDate: any;
  employeeId: string = '';
  imgUrl: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';

  constructor(
    private fb: FormBuilder,
    private adminServ: AdminService,
    private shareServ: ShareService,
    private modalCtrl: ModalController,
    private loader: LoaderService,
  ) { }

  ngOnInit() {
    this.today = new Date();
    this.maxDate.setFullYear(this.today.getFullYear() - 10);

    this.employeeForm = this.fb.group({
      firstName: ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      lastName: ['', Validators.compose([Validators.maxLength(50)])],
      email: ['', Validators.compose([Validators.required, Validators.email])],
      officialEmail: ['', Validators.compose([Validators.email])],
      mobileNumber: ['', Validators.compose([Validators.required, Validators.maxLength(10)])],
      alternateMobileNumber: ['', Validators.compose([Validators.maxLength(10)])],
      dateOfBirth: ['', Validators.compose([Validators.required])],
      address: [''],
      gender: ['Male'],
      currentAddress: this.fb.group({
        addressLine1: ['', Validators.compose([Validators.required])],
        addressLine2: ['', Validators.compose([Validators.required])],
        city: ['', Validators.compose([Validators.required])],
        state: ['', Validators.compose([Validators.required])],
        country: ['', Validators.compose([Validators.required])],
        zipCode: ['', Validators.compose([Validators.required])]
      }),
      permanentAddress: this.fb.group({
        addressLine1: ['', Validators.compose([Validators.required])],
        addressLine2: ['', Validators.compose([Validators.required])],
        city: ['', Validators.compose([Validators.required])],
        state: ['', Validators.compose([Validators.required])],
        country: ['', Validators.compose([Validators.required])],
        zipCode: ['', Validators.compose([Validators.required])]
      }),
    });

    this.birthDate = this.employeeForm.controls['dateOfBirth'].value;
    
    if(this.employeeId.trim() !== '') {this.getEmployeeDetail();}
  }

  getEmployeeDetail(){
    this.loader.present('fullHide');
    this.shareServ.getEmployeeById(this.employeeId).subscribe(res => {
      if(res) {
        this.employeeForm.patchValue(res);
        this.loader.dismiss();
      }
    }, (error) => {
      this.loader.dismiss();
    });
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
