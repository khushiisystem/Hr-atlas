import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { IonAccordionGroup, ModalController } from '@ionic/angular';
import { IAddress } from 'src/app/interfaces/request/IEmployee';
import { IEmployeeResponse, IEmployeeWrokResponse } from 'src/app/interfaces/response/IEmployee';
import { LoaderService } from 'src/app/services/loader.service';
import { RoleStateService } from 'src/app/services/roleState.service';
import { ShareService } from 'src/app/services/share.service';
import { AddExperiencePage } from 'src/app/admin/add-experience/add-experience.page';
import { AddEmployeePage } from 'src/app/admin/add-employee/add-employee.page';
import { IEmplpoyeeWorWeek } from 'src/app/interfaces/response/IEmplpoyeeWorWeek';
import * as moment from 'moment';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.page.html',
  styleUrls: ['./employee-profile.page.scss'],
})
export class EmployeeProfilePage {
  @ViewChild('accordionGroup', { static: true }) accordionGroup!: IonAccordionGroup;
  employeeId: string = "";
  employeeDetail!: IEmployeeResponse;
  workDetail!: IEmployeeWrokResponse;
  expandedAccordion: string = "Personal";
  dataLoaded: boolean = false;
  workWeekLoaded: boolean = false;
  workLoaded: boolean = false;
  workWeekDetail!: IEmplpoyeeWorWeek;
  offDays: string[] = [];
  weekArray: string[] = [];
  randomList: any[] = [];
  userRole: string | null = "";

  constructor(
    private activeRoute: ActivatedRoute,
    private shareServ: ShareService,
    private roleStateServ: RoleStateService,
    private modalCtrl: ModalController,
    public router: Router,
    private loader: LoaderService,
  ) {}

  ionViewWillEnter(){
    this.employeeId = this.activeRoute.snapshot.params?.['employeeId'];
    this.randomList.length = 7;
    if(this.employeeId.trim() !== ''){
      this.getEmployeeDetails();
      this.getWorkDetails();
      this.getWorkWeek();
    }
    this.roleStateServ.getState().subscribe(res => {
      this.userRole = res || localStorage.getItem('userRole');
    });
  }

  getEmployeeDetails(){
    this.dataLoaded = false;
    this.loader.present('');
    this.shareServ.getEmployeeById(this.employeeId).subscribe(res => {
      if(res){
        this.employeeDetail = res;
        this.dataLoaded = true;
        this.loader.dismiss();
      }
    }, (error) => {
      console.log(error, "error");
      this.dataLoaded = true;
      this.loader.dismiss();
    });
  }

  getWorkDetails(){
    this.shareServ.getWorkByEmployeeId(this.employeeId).subscribe(res => {
      if(res) {
        this.workDetail = res[0];
        this.workLoaded = true;
      }
    }, (error) => {
      this.workLoaded = true;
    });
  }

  getWorkWeek(){
    this.workWeekLoaded = false;
    this.offDays = [];
    this.shareServ.employeeAssignedWorkWeek(this.employeeId).subscribe(res => {
      if(res) {
        this.workWeekDetail = res;
        this.weekArray = moment.weekdays();
        this.offDays = this.workWeekDetail.workweekDetails.weekOff;
        this.workWeekLoaded = true;
      }
    }, (error) => {
      this.workWeekLoaded = true;
    });
  }

  toggleAccordion = (accordionvalue: string) => {
    const nativeEl = this.accordionGroup;
    if (nativeEl.value === accordionvalue) {
      nativeEl.value = undefined;
    } else {
      nativeEl.value = accordionvalue;
    }
  };

  goBack(){
    history.back();
  }
  
  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }

  changeAccordion(event: any){
    this.expandedAccordion = event.detail.value;
  }

  getAddress(add: IAddress){
    const fullAddress = Object.values(add).join(', ');
    return Object.values(add).filter((e) => e.trim() !== '').length > 0 ? fullAddress : '';
  }
  isAvailableAddress(){
    return this.getAddress(this.employeeDetail.currentAddress) !== '' && this.getAddress(this.employeeDetail.permanentAddress) !== '';
  }

  getName() {
    if(this.employeeDetail.lastName && this.employeeDetail.lastName.trim() !== ''){
      return `${this.employeeDetail.firstName.slice(0,1)}${this.employeeDetail.lastName.slice(0,1)}`;
    } else {
      return `${this.employeeDetail.firstName.slice(0,2)}`;
    }
  }

  setupWorkInfo(){
    let navigationExtras: NavigationExtras = {
      queryParams: {
        action: this.workDetail ? 'edit' : 'add',
        employeeId: this.employeeDetail.employeeId,
        userId: this.employeeDetail.guid,
      }
    }
    localStorage.setItem('lastRoute', this.router.url);
    this.router.navigate([`/tabs/employee/workinfo`], navigationExtras);
  }
  
  // async editProfile(){
  //   const employeeModel = this.modalCtrl.create({
  //     component: AddEmployeePage,
  //     componentProps: {
  //       action: "edit",
  //       employeeId: this.employeeDetail.guid
  //     },
  //     mode: 'md',
  //     initialBreakpoint: 1
  //   });

  //   (await employeeModel).present();

  //   (await employeeModel).onDidDismiss().then(result => {
  //     if(result.data) {
  //       this.getEmployeeDetails();
  //     }
  //   });
  // }
  editProfile(){
    localStorage.setItem('lastRoute', this.router.url);
    this.router.navigate([`/tabs/edit-profile/${this.employeeId}`], {replaceUrl: true});
  }

  ionViewWillLeave(): void {
    this.employeeDetail = undefined as any;
    this.workDetail = undefined as any;
    this.expandedAccordion = '';
    this.dataLoaded = false;
    this.employeeId = '';
  }

  workWeek() {
    this.router.navigate([`/employee-work-week/${this.employeeId}`]);
  }

}
