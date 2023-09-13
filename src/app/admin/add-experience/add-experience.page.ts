import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatetimeChangeEventDetail, ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { AdminService } from 'src/app/services/admin.service';
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
  selector: 'app-add-experience',
  templateUrl: './add-experience.page.html',
  styleUrls: ['./add-experience.page.scss'],
})
export class AddExperiencePage implements OnInit {
  workInfoForm!: FormGroup;
  openCalendar: boolean = false;
  today: Date = new Date();
  maxDate: Date = new Date();
  minDate: Date = new Date();
  formIndex: number = 0;
  birthDate: any;
  employeeId: string = '';
  userId: string = '';
  employeeWorkId: string = '';
  action: string = '';
  activeControl: string = '';
  activeNestedControl: string = '';
  isSameAddress: boolean = false;
  isDataLoaded: boolean = false;
  isInProgress: boolean = false;
  expandedCard: string[] = ['personal_card', 'contact_card', 'address_card', 'social_card'];
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
    // }, {
    //   name: ' Department',
    //   subDepartment: ['']
    }
  ];

  constructor(
    private fb: FormBuilder,
    private adminServ: AdminService,
    private shareServ: ShareService,
    private modalCtrl: ModalController,
    public router: Router,
    private activeatedRoute: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.activeatedRoute.queryParams.subscribe(param => {
      console.log(param, "param");
      if(param){
        this.employeeId = param?.['employeeId'];
        this.action = param?.['action'];
        this.userId = param?.['userId'];
        console.log(this.employeeId, this.action, this.userId);

        this.today = new Date();
        this.maxDate.setFullYear(this.today.getFullYear() - 10);
        this.formSetup();
        if(this.action === 'edit' && this.userId){
          this.getWorkDetail();
        } else {this.isDataLoaded = true;}
      }
    });
    console.log(this.employeeId, this.action, this.userId);
  }

  formSetup(){
    this.workInfoForm = this.fb.group({
      employeeId: [this.employeeId, Validators.required],
      userId: [this.userId, Validators.required],
      employeeType: ['', Validators.required],
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
      salaryInformation: this.fb.group({
        ctc: ['', Validators.required],
        salary: ['', Validators.required],
        effectiveDate: ['', Validators.required],
      }),
      workHistory: this.fb.array([]),
    });
  }

  newWorkHistory(): FormArray {
    return this.workInfoForm.get('workHistory') as FormArray;
  }
  createWorkHistoryForm(){
    return this.fb.group({
      employeeType: ['', Validators.required],
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

  getWorkDetail(){
    this.adminServ.getWorkByEmployeeId(this.userId).subscribe(res => {
      if(res){
        this.workInfoForm.patchValue(res[0]);
        this.employeeWorkId = res[0].guid;
        this.isDataLoaded = true;
        console.log(this.workInfoForm.value, "patch form");
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
  
  selectExpDate(event: DatetimeCustomEvent){
    const nesteCtrls : string[] = ['from', 'to'];
    if(this.activeControl === nesteCtrls[0]){
      ((this.workInfoForm.controls['workHistory'] as FormArray).controls[this.formIndex] as FormGroup).patchValue({
        from: moment.utc(event.detail.value).format()
      });
      this.minDate = new Date((event.detail.value as string));
    } else if(this.activeControl === nesteCtrls[1]) {
      ((this.workInfoForm.controls['workHistory'] as FormArray).controls[this.formIndex] as FormGroup).patchValue({
        to: moment.utc(event.detail.value).format()
      });
    };
  }

  getNestedCtrl(ctrlName: string, index: number) {
    return ((this.workInfoForm.controls['workHistory'] as FormArray).controls[index] as FormGroup).controls[ctrlName];
  }

  getDate(ctrlName: string){
    const formDate = this.workInfoForm.controls[ctrlName].value;
    return formDate ? new Date(moment(formDate).format()) : '';
  }
  getExpDate(ctrlName: string, index: number){
    const formDate = ((this.workInfoForm.controls['workHistory'] as FormArray).controls[index] as FormGroup).controls[ctrlName].value;
    return formDate ? new Date(moment(formDate).format()) : '';
  }

  getSubGroup(ctrlname: string): FormGroup{
    return this.workInfoForm.controls[ctrlname] as FormGroup
  }
  getSalaryEffeDate(ctrlName: string){
    const formDate = (this.workInfoForm.controls['salaryInformation'] as FormGroup).controls[ctrlName].value;
    return formDate ? new Date(moment(formDate).format()) : '';
  }
  setSalaryEffectiveDate(event: DatetimeCustomEvent){
    if(event.detail.value){
      let setEffDate = new Date(event.detail.value as string);
      setEffDate.setHours(0,0,0);
      (this.workInfoForm.controls['salaryInformation'] as FormGroup).patchValue({
        effectiveDate: moment.utc(setEffDate).format()
      });
    }
    console.log(this.workInfoForm.value);
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

  getSubDeparments() {
    const department = this.workInfoForm.controls['department'].value;
    if(department) {
      const index = this.deparmentList.find((e: Department, index) => e.name === department);
      return index ? index.subDepartment : [];
    } else {return [];}
  }

  
  submit(){
    console.log(this.workInfoForm.value, "form");
    if(this.workInfoForm.invalid){
      return;
    } else {
      this.isInProgress = true;
      this.action === 'add' ? this.addEmployeeWork() : this.updateEmployeeWork();
    }
  }

  addEmployeeWork(){
    this.adminServ.addEmployeesWork(this.workInfoForm.value).subscribe(res => {
      if(res){
        this.shareServ.presentToast('Employee added successfully.', 'top', 'success');
        // this.modalCtrl.dismiss(res, 'confirm');
        localStorage.setItem('lastRoute', '/tabs/directory');
        this.router.navigateByUrl(`/tabs/employee-profile/${this.userId}`);
        this.isInProgress = false;
      }
    }, (error) =>{
      this.shareServ.presentToast('Something is wrong.', 'bottom', 'danger');
      this.isInProgress = false;
    });
  }

  updateEmployeeWork(){
    this.adminServ.updateEmployeeWork(this.employeeWorkId, this.workInfoForm.value).subscribe(res => {
      if(res){
        this.shareServ.presentToast('Employee updated successfully.', 'top', 'success');
        localStorage.setItem('lastRoute', '/tabs/directory');
        this.router.navigateByUrl(`/tabs/employee-profile/${this.userId}`);
        this.isInProgress = false;
        // this.modalCtrl.dismiss(res, 'confirm');
      }
    }, (error) =>{
      this.shareServ.presentToast('Something is wrong.', 'bottom', 'danger');
      this.isInProgress = false;
    });
  }

  goBack(){history.back();}
}
