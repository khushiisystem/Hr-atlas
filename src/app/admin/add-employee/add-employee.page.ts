import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatetimeChangeEventDetail, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

interface DatetimeCustomEvent extends CustomEvent {
  detail: DatetimeChangeEventDetail;
  target: HTMLIonDatetimeElement;
}

interface Department {
  name: string,
  subDepartment: string[]
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
  employeeId1: string = '';
  userId: string = '';
  action: string = '';
  isSameAddress: boolean = false;
  isDataLoaded: boolean = false;
  isInProgress: boolean = false;
  expandedCard: string[] = ['personal_card', 'contact_card', 'address_card', 'social_card'];
  touchedCtrls: string[] = [];
  workType: string[] = ['Work From Home', 'Work From Office'];
  deparmentList: Department[] = [
    {
      name: 'HR Department',
      subDepartment: ['Human Resources']
    }, {
      name: 'Administration Department',
      subDepartment: ['Project Management']
    }, {
      name: 'Development Department',
      subDepartment: ['Frontend Development', 'Backend Development', 'UI / UX', 'DevOps']
    }, {
      name: 'Sales Department',
      subDepartment: ['Bussiness Development']
    }
  ];
  activeControl: string = '';
  formIndex: number = 0;


  constructor(
    private fb: FormBuilder,
    public router: Router,
    public activeroute: ActivatedRoute,
    private adminServ: AdminService,
    private shareServ: ShareService,
    private modalCtrl: ModalController,
    private loader: LoaderService,
  ) { }

  ngOnInit() {
    this.today = new Date();
    this.maxDate.setFullYear(this.today.getFullYear() - 10);
    this.action = this.activeroute.snapshot.params?.['action'];
    this.employeeId = this.activeroute.snapshot.params?.['employeeId'];
    this.userId = this.activeroute.snapshot.params?.['userId'];

    this.employeeForm = this.fb.group({
      firstName: ['', Validators.compose([Validators.required, Validators.maxLength(50)])],
      lastName: ['', Validators.compose([Validators.maxLength(50)])],
      email: ['', Validators.compose([Validators.email])],
      dateOfBirth: null,
      gender: ['Male'],
      officialEmail: ['', Validators.compose([Validators.required, Validators.email])],
      mobileNumber: ['', Validators.compose([Validators.required, Validators.minLength(10), Validators.maxLength(10)])],
      alternateMobileNumber: [''],
      maritalStatus: [''],
      imageUrl: [''],
      role: 'Employee',
      bloodGroup: 'Group A',
      employeeType: ['', Validators.required],
      status: ['Active', Validators.required],
      joiningDate: ['', Validators.required],
      resignationDate: [''],
      work_experience: 0,
      workLocation: [''],
      probationPeriod: ['', Validators.required],
      designation: ['', Validators.required],
      jobTitle: ['', Validators.required],
      department: ['', Validators.required],
      subDepartment: ['', Validators.required],
      // workHistory: this.fb.array([]),
      currentAddress: this.fb.group({
        addressLine1: [''],
        addressLine2: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['', Validators.compose([Validators.minLength(4), Validators.maxLength(6)])]
      }),
      permanentAddress: this.fb.group({
        addressLine1: [''],
        addressLine2: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['', Validators.compose([Validators.minLength(4), Validators.maxLength(6)])]
      }),      
    });

    this.birthDate = this.employeeForm.controls['dateOfBirth'].value;
    if(this.action === 'edit' && this.employeeId.trim() !== '' && this.employeeId !== null){
      this.getProfile();
    } else {this.isDataLoaded = true;}

    // this.insertWorkInfoToUser();
    // this.updateEmployee();
  }


  getProfile(){
    this.adminServ.getEmployeeById(this.employeeId).subscribe(res => {
      if(res){
        this.employeeForm.patchValue(res);
        this.isDataLoaded = true;
      }
    }, (error) => {
      this.isDataLoaded = true;
    });
  }

  selectDate(event: DatetimeCustomEvent){
    this.employeeForm.patchValue({
      dateOfBirth: moment(event.detail.value).utc().format()
    });
    this.getDate();
  }

  selectDate1(event: DatetimeCustomEvent, ctrlName: string){
    const nonNesteCtrls : string[] = ['joiningDate', 'resignationDate'];
    if(nonNesteCtrls.includes(ctrlName)){
      if(ctrlName === nonNesteCtrls[0]){
        this.employeeForm.patchValue({
          joiningDate: moment(event.detail.value).utc().format()
        });
      } else if(ctrlName === nonNesteCtrls[1]) {
        this.employeeForm.patchValue({
          resignationDate: moment(event.detail.value).utc().format()
        });
      }
    }
  }

  modalDismiss(){
    this.activeControl = '';
    this.openCalendar = false;
  }

  getDate(){
    const formDate = this.employeeForm.controls['dateOfBirth'].value;
    return new Date(formDate != '' ? formDate : this.maxDate);
  }
  
  getDate1(ctrlName: string){
    const formDate = this.employeeForm.controls[ctrlName].value;
    return formDate ? new Date(moment(formDate).format()) : '';
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
    this.isSameAddress = event.detail.checked;
    if(this.isSameAddress){
      (this.employeeForm.controls['permanentAddress'] as FormGroup).patchValue((this.employeeForm.controls['currentAddress'] as FormGroup).value);
    } else {
      (this.employeeForm.controls['permanentAddress'] as FormGroup).reset();
    }
  }

  checkSameAddress(){
    const permanentAdd = (this.employeeForm.controls['permanentAddress'] as FormGroup).value;
    const currentAdd = (this.employeeForm.controls['currentAddress'] as FormGroup).value;
    return permanentAdd || currentAdd ? JSON.stringify(currentAdd) === JSON.stringify(permanentAdd) : false;
  }
  
  submit(){
    if(this.employeeForm.invalid){
      return;
    } else {
      this.isInProgress = true;
      this.loader.present('');
      this.action === 'add' ? this.addEmployee() : this.updateEmployee();
    }
  }

  addEmployee(){
    this.adminServ.addEmployees(this.employeeForm.value).subscribe(res => {
      if(res){
        this.shareServ.presentToast('Employee added successfully.', 'top', 'success');
        // this.modalCtrl.dismiss(res, 'confirm');
        const lastRoute = localStorage.getItem('lastRoute') || '/tabs/home';
        localStorage.setItem('lastRoute', '/tabs/home');
        this.router.navigateByUrl(lastRoute, {replaceUrl: true});
        this.isInProgress = false;
        this.loader.dismiss();
      }
    }, (error) =>{
      this.shareServ.presentToast(error.error.Message, 'bottom', 'danger');
      this.isInProgress = false;
      this.loader.dismiss();
    });
  }
  
  updateEmployee(){
    this.adminServ.updateEmployee(this.employeeId, this.employeeForm.value).subscribe(res => {
      if(res){
        this.shareServ.presentToast('Employee updated successfully.', 'top', 'success');
        // this.modalCtrl.dismiss(res, 'confirm');
        const lastRoute = localStorage.getItem('lastRoute') || '/tabs/home';
        localStorage.setItem('lastRoute', '/tabs/home');
        this.router.navigateByUrl(lastRoute, {replaceUrl: true});
        this.isInProgress = false;
        this.loader.dismiss();
      }
    }, (error) =>{
      // this.shareServ.presentToast(error.error.Message, 'bottom', 'danger');
      this.isInProgress = false;
      this.loader.dismiss();
    });
  }

  insertWorkInfoToUser(){

    this.adminServ.insertWorkInfoToUser(this.employeeId, this.employeeForm.value).subscribe(res => {
      if(res){
        this.shareServ.presentToast('WorkInfo Inserted successfully.', 'top', 'success');
        // this.modalCtrl.dismiss(res, 'confirm');
        const lastRoute = localStorage.getItem('lastRoute') || '/tabs/home';
        localStorage.setItem('lastRoute', '/tabs/home');
        this.router.navigateByUrl(lastRoute, {replaceUrl: true});
        this.isInProgress = false;
        this.loader.dismiss();
      }
    }, (error) =>{
      // this.shareServ.presentToast(error.error.Message, 'bottom', 'danger');
      this.isInProgress = false;
      this.loader.dismiss();
    });
  }

  goBack(){
    history.back();
  }

  getError(ctrlName: AbstractControl<any> | null, errorMsg: string, invalidMsg?: string){
    if(ctrlName && ctrlName.touched && ctrlName.errors){
      if(ctrlName.value !== '' && ctrlName.invalid){
        return invalidMsg ?? '';
      } else {
        return errorMsg;
      }
    } else {
      return null;
    }
  }

  getChildCtrl(groupName: string): FormGroup{
    return (this.employeeForm.get(groupName) as FormGroup);
  }

  getSubDeparments() {
    const department = this.employeeForm.controls['department'].value;
    if(department) {
      const index = this.deparmentList.find((e: Department, index) => e.name === department);
      return index ? index.subDepartment : [];
    } else {return [];}
  }

  statusChange(event: any){
    if(this.employeeForm.controls["status"].value === 'Resigned'){
      this.employeeForm.addControl('resignationDate', new FormControl('', Validators.compose([Validators.required])));
    } else {
      this.employeeForm.removeControl("resignationDate");
    }
  }
  toggleCtrl(ctrlName: string, frmIndex?: number){
    this.activeControl = ctrlName;
    this.openCalendar = true;
    this.formIndex = frmIndex ?? -1;
    if(!this.touchedCtrls.includes(`${ctrlName}${frmIndex??''}`)){
      this.touchedCtrls.push(`${ctrlName}${frmIndex??''}`);
    }
  }

  getCtrlDate(ctrlName: string){
    const formDate = this.employeeForm.controls[ctrlName].value;
    return formDate ? new Date(moment(formDate).format()) : '';
  }
}
