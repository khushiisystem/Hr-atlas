import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import * as moment from 'moment';
import { Subject, debounceTime } from 'rxjs';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { IWorkWeekResponse } from 'src/app/interfaces/response/IWorkWeek';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

export interface ActionSheetButton<T = any> {
  text?: string;
  role?: 'cancel' | 'destructive' | 'selected' | string;
  icon?: string;
  cssClass?: string | string[];
  id?: string;
  htmlAttributes?: { [key: string]: any };
  handler?: () => boolean | void | Promise<boolean | void>;
  data?: T;
}

@Component({
  selector: 'app-additional-setup',
  templateUrl: './additional-setup.page.html',
  styleUrls: ['./additional-setup.page.scss'],
})
export class AdditionalSetupPage implements OnInit {
  activeTab: string = "create_work_week";
  workWeekForm!: FormGroup;
  weekArray: string[] = [];
  workWeekList: IWorkWeekResponse[] = [];
  sheetBtns: ActionSheetButton[] = [];
  randomCard: any[] = [];
  selectedEmployee: any[] = [];
  employeeList: IEmployeeResponse[] = [];
  isEmployeeLoaded: boolean = false;
  pageIndex: number = 0;
  isMoreEmployee: boolean = false;
  searchString: string = "";
  expandedCard: string = "";
  private searchSubject = new Subject<string>();
  private readonly debounceTimeMs = 2000;

  constructor(
    private adminServ: AdminService,
    private shareServ: ShareService,
    public router: Router,
    private loader: LoaderService,
    private acctionSheet: ActionSheetController,
    private fb: FormBuilder,
  ) { }

  ngOnInit() {
    this.randomCard.length = 7;
    this.weekArray = moment.weekdays();
    this.formSetup();
    this.getWorkWeek();
    this.getEmployees();
    this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue) => {
      this.searchEmployee(searchValue);
    });
  }

  formSetup() {
    this.workWeekForm = this.fb.group({
      title: ['', Validators.compose([Validators.required, Validators.maxLength(100)])],
      weekOff: ['', Validators.required]
    });
  }
  
  selectAll(event: CustomEvent) {
    if(event.detail.checked === true){
      this.markAll();
    } else if(event.detail.checked === false) {
      this.selectedEmployee = [];
    }
  }
  markAll(){
    this.employeeList.forEach((e: IEmployeeResponse, index) => {
      if(!this.selectedEmployee.includes(e.guid)){
        this.selectedEmployee.push(e.guid);
      }
    });
  }
  unMarkAll(){
    this.selectedEmployee = [];
  }

  selectEmployee(employee: string) {
    const index = this.selectedEmployee.findIndex((e: string) => e === employee);
    if(index !== -1){
      this.selectedEmployee.splice(index, 1);
    } else {
      this.selectedEmployee.push(employee);
    }
  }

  isChecked(employee: any) {
    return this.selectedEmployee.includes(employee);
  }

  async selectWrokWeek(empIds: string[]){
    if(empIds.length < 1 || this.sheetBtns.length < 1) {return;}
    
    this.sheetBtns.push({
      role: 'cancel',
      text: 'Cancel',
      data: { action: 'cancel' }
    });
    
    const weekListSheet = this.acctionSheet.create({
      htmlAttributes: {'aria-label': 'Assign work week'},
      header: 'Select Work Week',
      keyboardClose: false,
      backdropDismiss: false,
      buttons: this.sheetBtns,
    });

    (await weekListSheet).present();

    (await weekListSheet).onDidDismiss().then(result => {
      if(result.role !== 'cancel' && result.data && result.data.action) {
        this.assignWorkWeek(empIds, result.data.action);
      }
    });
  }

  expandCard(workWeekType: string) {
    if(this.expandedCard === workWeekType){
      this.expandedCard = '';
    } else {
      this.expandedCard = workWeekType
    }
  }

  searchEmployee(searchValue: string){
    if(searchValue.trim().length > 3){
      this.selectedEmployee = [];
      this.isEmployeeLoaded = false;
      const data = {
        searchString: searchValue,
        status: 'Active'
      }
      this.employeeList = [];
      this.shareServ.searchEmployee(data).subscribe(res => {
        if(res){
          this.employeeList = res;
          this.isEmployeeLoaded = true;
        }
      }, (error) => {
        this.isEmployeeLoaded = true;
      });
    } else {
      this.getEmployees();
    }
  }

  onSearch() {
    this.searchSubject.next(this.searchString);
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  goBack(){history.back();}

  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }

  getEmployees(){
    this.isEmployeeLoaded = false;
    this.shareServ.getAllEmployee('Active', this.pageIndex * 20, 20).subscribe(res => {
      if(res){
        this.employeeList = res;
        this.isMoreEmployee = res.length > 19;
        this.isEmployeeLoaded = true;
      }
    }, (error) => {
      this.isEmployeeLoaded = true;
    });
  }

  next(){
    this.pageIndex++;
    this.getEmployees();
  }
  prev(){
    this.pageIndex--;
    this.getEmployees();
  }
  getName(employee: IEmployeeResponse) {
    if(employee.lastName && employee.lastName.trim() !== ''){
      return `${employee.firstName.slice(0,1)}${employee.lastName.slice(0,1)}`;
    } else {
      return `${employee.firstName.slice(0,2)}`;
    }
  }
  employeeWorkWeek(weekId: string){
    const empWeek = this.workWeekList.find((e: IWorkWeekResponse, index) => e.guid === weekId);
    return empWeek ? empWeek.title : '';
  }

  assignWorkWeek(employeeId: string[], workWeek: string){
    this.loader.present('');
    const data = {
      employeeIds: employeeId,
      workWeekId: workWeek
    }
    this.adminServ.assignWorkWeek(data).subscribe(res => {
      if(res){
        if(res.Message){
          this.shareServ.presentToast(res.Message, 'top', 'success');
        } else {
          this.shareServ.presentToast("work assigned", 'top', 'success');
        }
        this.activeTab = "create_work_week";
        this.getWorkWeek();
        this.pageIndex = 0;
        this.getEmployees();
        this.loader.dismiss();
        this.selectedEmployee = [];
      }
    }, (error) => {
      this.shareServ.presentToast('Something is wrong', 'top', 'danger');
      this.loader.dismiss();
    });
  }

  getWorkWeek(){
    this.sheetBtns = [];
    this.isEmployeeLoaded = false;
    this.adminServ.getWorkWeek(0, 10).subscribe(res => {
      if(res) {
        this.workWeekList = res;

        this.workWeekList.map((e: IWorkWeekResponse, index) => {
          const btnObj: ActionSheetButton = {
            role: 'destructive',
            text: e.title,
            data: {action: e.guid},
            cssClass: 'action_week_btn'
          };
          this.sheetBtns.push(btnObj);
        });
        this.isEmployeeLoaded = true;
      }
    }, (error) => {
      this.isEmployeeLoaded = true;
    });
  }

  compareWeek(w1: string, w2: string){
    return (w1 && w2 ? w1 === w2 : w1 == w2)
  }

  createNewWorks(){
    this.loader.present('');
    this.adminServ.createWorkWeek(this.workWeekForm.value).subscribe(res => {
      if(res){
        this.shareServ.presentToast('New Work week created successfully', 'top', 'success');
        this.loader.dismiss();
        this.expandedCard = '';
        this.workWeekForm.reset();
        this.getWorkWeek();
      }
    }, (error) => {
      this.shareServ.presentToast('something is wrong.', 'top', 'danger');
      this.loader.dismiss();
    })
  }

}
