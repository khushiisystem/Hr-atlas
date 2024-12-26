import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatetimeChangeEventDetail, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

interface DatetimeCustomEvent extends CustomEvent {
  detail: DatetimeChangeEventDetail;
  target: HTMLIonDatetimeElement;
}

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.page.html',
  styleUrls: ['./edit-profile.page.scss'],
})
export class EditProfilePage implements OnInit {
  employeeForm!: FormGroup;
  employeeDetail!: IEmployeeResponse;
  openCalendar: boolean = false;
  today: Date = new Date();
  userId: string = '';
  // imgUrl: string = 'https://ionicframework.com/docs/img/demos/avatar.svg';
  imgUrl: string = '';
  expandedCard: string[] = ['personal_card', 'contact_card', 'address_card', 'social_card']

  constructor(
    private fb: FormBuilder,
    private adminServ: AdminService,
    private shareServ: ShareService,
    private modalCtrl: ModalController,
    private loader: LoaderService,
    private router: Router,
    private activeRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    this.today = new Date();
    this.userId = this.activeRoute.snapshot.params?.['employeeId'];

    this.employeeForm = this.fb.group({
      firstName: ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      lastName: ['', Validators.compose([Validators.maxLength(50)])],
      email: ['', Validators.compose([Validators.email, Validators.required])],
      officialEmail: ['', Validators.compose([Validators.email])],
      mobileNumber: [''],
      alternateMobileNumber: ['', Validators.compose([Validators.minLength(9), Validators.maxLength(10), Validators.required])],
      dateOfBirth: '',
      gender: ['Male', Validators.required],
      maritalStatus: ['', Validators.required],
      imageUrl: [''],
      guid: [''],
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
      linkedinUrl: [''],
      facebookUrl: [''],
      twitterUrl: ['']
    });
    
    if(this.userId.trim() !== '') {this.getEmployeeDetail();}
  }

  getEmployeeDetail(){
    this.loader.present('fullHide');
    this.shareServ.getEmployeeById(this.userId).subscribe(res => {
      if(res) {
        this.employeeDetail = res;
        this.employeeForm.patchValue(res);
        this.loader.dismiss();
      }
    }, (error) => {
      this.loader.dismiss();
    });
  }


  expandCard(cardName: string) {
    const index = this.expandedCard.findIndex((e: string) => e === cardName);
    if(index != -1){
      this.expandedCard.splice(index, 1);
    } else {
      this.expandedCard.push(cardName);
    }
  }
  isExpanded(cardName: string){
    return this.expandedCard.includes(cardName);
  }

  sameAddress(event: CustomEvent){
    if(event.detail.checked === true){
      (this.employeeForm.controls['permanentAddress'] as FormGroup).patchValue((this.employeeForm.controls['currentAddress'] as FormGroup).value);
    } else {
      (this.employeeForm.controls['permanentAddress'] as FormGroup).reset();
    }
  }

  checkSameAddress(){
    const permanentAdd = (this.employeeForm.controls['permanentAddress'] as FormGroup).value;
    const currentAdd = (this.employeeForm.controls['currentAddress'] as FormGroup).value;
    return permanentAdd && currentAdd && Object.values(permanentAdd)[0] !== '' && Object.values(currentAdd)[0] !== '' ? JSON.stringify(currentAdd) === JSON.stringify(permanentAdd) : false;
  }

  handleInput(event: Event){
    this.loader.present('');
    event.preventDefault();
    event.stopPropagation();
    console.log(event, "file input");

    const file = (event.target as any).files[0];

    if((file.type as string).toLowerCase().search('image') != -1){
      let reader = new FileReader;
      reader.readAsDataURL(file);
      let imgPath: string = '';
      reader.onload = (event: ProgressEvent) => {
        console.log(event.target, "readerEnvent");
        imgPath = (event.target as FileReader)?.result as string || '';
        this.imgUrl = imgPath;
        this.loader.dismiss();
      }
    } else {
      alert("Please upload image in jpeg, jpg, png format.");
      this.loader.dismiss();
    }
  }

  setDob(event: DatetimeCustomEvent){
    this.employeeForm.patchValue({
      dateOfBirth: moment.utc(event.detail.value).format()
    });
  }
  getDob(){
    const formValue = this.employeeForm.controls['dateOfBirth'].value;
    return formValue ? new Date(moment(formValue).format()) : '';
  }

  submit(){
    if(this.employeeForm.invalid){
      return;
    } else {
      this.loader.present('');
      this.adminServ.updateEmployee(this.employeeDetail.guid, this.employeeForm.value).subscribe(res => {
        if(res){
          this.shareServ.presentToast('Profile updated successfully.', 'top', 'success');
          // this.modalCtrl.dismiss(res, 'confirm');
          this.loader.dismiss();
          const lastRoute = localStorage.getItem('lastRoute') || '/tabs/home';
          localStorage.setItem('lastRoute', '/tabs/home');
          this.router.navigateByUrl(lastRoute, {replaceUrl: true});
        }
      }, (error) =>{
        this.shareServ.presentToast(error.error || error.error.message, 'top', 'danger');
        this.loader.dismiss();
      });
    }
  }

  goBack(){
    const lastRoute = localStorage.getItem('lastRoute') || '/tabs/home';
    this.router.navigate([lastRoute]);
  }
  getName() {
    if(this.employeeDetail){
      if(this.employeeDetail.lastName && this.employeeDetail.lastName.trim() !== ''){
        return `${this.employeeDetail.firstName.slice(0,1)}${this.employeeDetail.lastName.slice(0,1)}`;
      } else {
        return `${this.employeeDetail.firstName.slice(0,2)}`;
      }
    } else {
      return 'UK';
    }
  }
  getGroup(ctrlName: string) {
    return this.employeeForm.get(ctrlName) as FormGroup;
  }

}
