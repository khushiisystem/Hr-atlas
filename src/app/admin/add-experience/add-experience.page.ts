import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
    private loader: LoaderService,
  ) { }

  ngOnInit() {
    this.activeatedRoute.queryParams.subscribe(param => {
      if(param){
        this.employeeId = param?.['employeeId'];
        this.action = param?.['action'];
        this.userId = param?.['userId'];

        this.today = new Date();
        this.maxDate.setFullYear(this.today.getFullYear() - 10);
        this.formSetup();
        if(this.action === 'edit' && this.userId){
          this.getWorkDetail();
        } else {this.isDataLoaded = true;}
      }
    });
  }

  formSetup(){
    this.workInfoForm = this.fb.group({
      employeeId: [this.employeeId, Validators.required],
      userId: [this.userId, Validators.required],
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
      workHistory: this.fb.array([]),
    });
    if(this.workInfoForm.controls["status"].value === 'InActive'){      
      this.workInfoForm.addControl('resignationDate', new FormControl('', Validators.compose([Validators.required])));
    } else {
      this.workInfoForm.removeControl("resignationDate");
    }
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

  statusChange(event: any){
    if(this.workInfoForm.controls["status"].value === 'InActive'){
      this.workInfoForm.addControl('resignationDate', new FormControl('', Validators.compose([Validators.required])));
    } else {
      this.workInfoForm.removeControl("resignationDate");
    }
  }

  getWorkDetail(){
    this.adminServ.getWorkByEmployeeId(this.userId).subscribe(res => {
      if(res){
        if(res.status === 'InActive'){
          this.workInfoForm.addControl('resignationDate', new FormControl('', Validators.compose([Validators.required])));
        } else {
          this.workInfoForm.removeControl("resignationDate");
        }
        res.workHistory.forEach((history, index) => {
          this.addWorkHistory();
          ((this.workInfoForm.controls['workHistory'] as FormArray).controls[index] as FormGroup).patchValue(history);
        });
        this.workInfoForm.patchValue(res);
        this.employeeWorkId = res.guid;
        this.isDataLoaded = true;
      }
    }, (error) => {
      this.isDataLoaded = true;
    });
  }

  selectDate(event: DatetimeCustomEvent, ctrlName: string){
    const nonNesteCtrls : string[] = ['joiningDate', 'resignationDate'];
    if(nonNesteCtrls.includes(ctrlName)){
      if(ctrlName === nonNesteCtrls[0]){
        this.workInfoForm.patchValue({
          joiningDate: moment(event.detail.value).utc().format()
        });
      } else if(ctrlName === nonNesteCtrls[1]) {
        this.workInfoForm.patchValue({
          resignationDate: moment(event.detail.value).utc().format()
        });
      }
    }
  }
  
  selectExpDate(event: DatetimeCustomEvent, ctrlName: string){
    const nesteCtrls : string[] = ['from', 'to'];
    if(ctrlName === nesteCtrls[0]){
      ((this.workInfoForm.controls['workHistory'] as FormArray).controls[this.formIndex] as FormGroup).patchValue({
        from: moment(event.detail.value).utc().format()
      });
      this.minDate = new Date((event.detail.value as string));
    } else if(ctrlName === nesteCtrls[1]) {
      ((this.workInfoForm.controls['workHistory'] as FormArray).controls[this.formIndex] as FormGroup).patchValue({
        to: moment(event.detail.value).utc().format()
      });
    };
    this.formIndex = -1;
  }

  toggleCtrl(ctrlName: string, frmIndex?: number){
    this.activeControl = ctrlName;
    this.openCalendar = true;
    this.formIndex = frmIndex ?? -1;
    if(!this.touchedCtrls.includes(`${ctrlName}${frmIndex??''}`)){
      this.touchedCtrls.push(`${ctrlName}${frmIndex??''}`);
    }
  }
  modalDismiss(){
    this.activeControl = '';
    this.openCalendar = false;
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
    if(this.workInfoForm.invalid){
      return;
    } else {
      this.loader.present('');
      this.isInProgress = true;
      this.action === 'add' ? this.addEmployeeWork() : this.updateEmployeeWork();
    }
  }

  addEmployeeWork(){
    this.adminServ.addEmployeesWork(this.workInfoForm.value).subscribe(res => {
      if(res){
        this.shareServ.presentToast('Experience added successfully.', 'top', 'success');
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
  
  updateEmployeeWork(){
    this.adminServ.updateEmployeeWork(this.employeeWorkId, this.workInfoForm.value).subscribe(res => {
      if(res){
        this.shareServ.presentToast('Experience updated successfully.', 'top', 'success');
        const lastRoute = localStorage.getItem('lastRoute') || '/tabs/home';
        localStorage.setItem('lastRoute', '/tabs/home');
        this.router.navigateByUrl(lastRoute, {replaceUrl: true});
        this.isInProgress = false;
        this.loader.dismiss();
        // this.modalCtrl.dismiss(res, 'confirm');
      }
    }, (error) =>{
      this.shareServ.presentToast(error.error.Message, 'bottom', 'danger');
      this.isInProgress = false;
      this.loader.dismiss();
    });
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
    return (this.workInfoForm.get(groupName) as FormGroup);
  }

  goBack(){history.back();}
}
