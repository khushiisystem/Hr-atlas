import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatetimeChangeEventDetail, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { AdminService } from 'src/app/services/admin.service';
import { ShareService } from 'src/app/services/share.service';

interface DatetimeCustomEvent extends CustomEvent {
  detail: DatetimeChangeEventDetail;
  target: HTMLIonDatetimeElement;
}

@Component({
  selector: 'app-add-experience',
  templateUrl: './add-experience.page.html',
  styleUrls: ['./add-experience.page.scss'],
})
export class AddExperiencePage implements OnInit {
  workInfoForm!: FormGroup;
  openCalendar: boolean = false;
  today: Date = new Date();
  maxDate: Date = new Date();
  birthDate: any;
  employeeId: string = '';
  action: string = '';
  activeControl: string = '';
  isSameAddress: boolean = false;
  isDataLoaded: boolean = false;
  isInProgress: boolean = false;
  expandedCard: string[] = ['personal_card', 'contact_card', 'address_card', 'social_card']

  constructor(
    private fb: FormBuilder,
    private adminServ: AdminService,
    private shareServ: ShareService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {
    this.today = new Date();
    this.maxDate.setFullYear(this.today.getFullYear() - 10);
    this.formSetup();
    console.log(this.workInfoForm.value, "form");
    if(this.action === 'edit' && this.employeeId.trim() !== ''){
      this.getProfile();
    } else {this.isDataLoaded = true;}
  }

  formSetup(){
    this.workInfoForm = this.fb.group({
      employeeId: [this.employeeId, Validators.required],
      EmployeeType: ['', Validators.required],
      status: ['', Validators.required],
      joiningDate: ['', Validators.required],
      resignationDate: [''],
      work_experience: [''],
      workLocation: [''],
      probationPeriod: ['', Validators.required],
      designation: ['', Validators.required],
      jobTitle: ['', Validators.required],
      department: ['', Validators.required],
      subDepartment: ['', Validators.required],
      workHistory: this.fb.array([]),
    });
  }

  newWorkHistory(): FormArray {
    return this.workInfoForm.get('workHistory') as FormArray;
  }
  createWorkHistoryForm(){
    return this.fb.group({
      EmployeeType: ['', Validators.required],
      designation: ['', Validators.required],
      jobTitle: ['', Validators.required],
      work_experience: [''],
      department: ['', Validators.required],
      from: ['', Validators.required],
      to: ['', Validators.required],
    });
  }
  addWorkHistory(){
    this.newWorkHistory().push(this.createWorkHistoryForm());
  }
  removeWorkHistory(index: number){
    this.newWorkHistory().removeAt(index);
  }

  getProfile(){
    this.adminServ.getEmployeeById(this.employeeId).subscribe(res => {
      if(res){
        this.workInfoForm.patchValue(res);
        this.isDataLoaded = true;
        console.log(this.workInfoForm.value, "path form");
      }
    }, (error) => {
      console.log(error, "get error");
      this.isDataLoaded = true;
    });
  }

  selectDate(event: DatetimeCustomEvent){
    const nonNesteCtrls : string[] = ['joiningDate', 'resignationDate'];
    if(nonNesteCtrls.includes(this.activeControl)){
      if(this.activeControl === nonNesteCtrls[0]){
        this.workInfoForm.patchValue({
          joiningDate: moment.utc(event.detail.value).format()
        });
      } else if(this.activeControl === nonNesteCtrls[1]) {
        this.workInfoForm.patchValue({
          resignationDate: moment.utc(event.detail.value).format()
        });
      }
    } else {
    }
    // this.getDate();
    console.log(this.workInfoForm.value);
  }

  getNestedCtrl(childCtrl: string, ctrlName: string, isArray: boolean, index?: number) {
    if(isArray && index){
      return ((this.workInfoForm.controls[childCtrl] as FormArray).controls[index] as FormGroup).controls[ctrlName];
    } else {
      return (this.workInfoForm.controls[childCtrl] as FormGroup).controls[ctrlName];
    }
  }

  getBasicDate(ctrlName: string){
    const formDate = this.workInfoForm.controls[ctrlName].value;
    return new Date(formDate != '' ? formDate : this.maxDate);
  }
  getDate(){
    const formDate = this.workInfoForm.controls['dateOfBirth'].value;
    return new Date(formDate != '' ? formDate : this.maxDate);
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

  
  submit(){
    console.log(this.workInfoForm.value, "form");
    if(this.workInfoForm.invalid){
      return;
    } else {
      this.isInProgress = true;
      this.action === 'add' ? this.addEmployee() : this.updateEmployee();
    }
  }

  addEmployee(){
    this.adminServ.addEmployees(this.workInfoForm.value).subscribe(res => {
      if(res){
        this.shareServ.presentToast('Employee added successfully.', 'top', 'success');
        this.modalCtrl.dismiss(res, 'confirm');
        this.isInProgress = false;
      }
    }, (error) =>{
      this.shareServ.presentToast('Something is wrong.', 'bottom', 'danger');
      this.isInProgress = false;
    });
  }

  updateEmployee(){
    this.adminServ.updateEmployee(this.employeeId, this.workInfoForm.value).subscribe(res => {
      if(res){
        this.shareServ.presentToast('Employee updated successfully.', 'top', 'success');
        this.modalCtrl.dismiss(res, 'confirm');
        this.isInProgress = false;
      }
    }, (error) =>{
      this.shareServ.presentToast('Something is wrong.', 'bottom', 'danger');
      this.isInProgress = false;
    });
  }

  goBack(){this.modalCtrl.dismiss();}
}
