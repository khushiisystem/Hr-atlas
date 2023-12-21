import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonAccordionGroup, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/core/auth.service';
import { EditProfilePage } from 'src/app/employee/edit-profile/edit-profile.page';
import { IAddress } from 'src/app/interfaces/request/IEmployee';
import { IEmployeeResponse, IEmployeeWrokResponse } from 'src/app/interfaces/response/IEmployee';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';
import { AddEmployeePage } from '../add-employee/add-employee.page';
import { IEmplpoyeeWorWeek } from 'src/app/interfaces/response/IEmplpoyeeWorWeek';
import * as moment from 'moment';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.page.html',
  styleUrls: ['./admin-profile.page.scss'],
})
export class AdminProfilePage implements OnInit {
  @ViewChild('accordionGroup', { static: true }) accordionGroup!: IonAccordionGroup;
  userId: string = "";
  adminDetail!: IEmployeeResponse;
  workDetail!: IEmployeeWrokResponse;
  workWeekDetail!: IEmplpoyeeWorWeek;
  activeTab: string[] = ["Personal", "Contact", "Address", "Social_info", "Settings"];
  dataLoaded: boolean = false;
  workLoaded: boolean = false;
  randomList: any[] = [];
  weekArray: string[] = [];
  numberOfWeek: string[] = [];
  workWeekLoaded: boolean = false;

  constructor(
    private router: Router,
    private authServ: AuthService,
    private modalCtrl: ModalController,
    private shareServ: ShareService,
  ) { this.randomList.length = 7; }

  ngOnInit() {
    this.userId = localStorage.getItem('userId') || "";
    if(this.userId.trim() !== ''){
      this.getAdminProfile();
      this.getEmployeeWork();
      this.getWorkWeek();
    }
  }

  getAdminProfile(){
    this.dataLoaded = false;
    this.shareServ.getEmployeeById(this.userId).subscribe(res => {
      if(res) {
        this.adminDetail = res;
        this.dataLoaded = true;
      }
    }, (error) => {
      console.error(error, "get profile error");
      this.dataLoaded = true;
    });
  }

  getEmployeeWork(){
    this.workLoaded = false;
    this.shareServ.getWorkByEmployeeId(this.userId).subscribe(res => {
      if(res) {
        this.workDetail = res[0];
        this.workLoaded = true;
      }
    }, (error) => {
      this.workLoaded = true;
    });
  }

  getWorkWeek(){
    this.weekArray = moment.weekdays();
    this.weekCount();
    this.workWeekLoaded = false;
    this.shareServ.employeeAssignedWorkWeek(this.userId).subscribe(res => {
      if(res) {
        this.workWeekDetail = res;
        this.workWeekLoaded = true;
      }
    }, (error) => {
      this.workWeekLoaded = true;
    });
  }

  weekCount() {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth()-1, 1);
    const lastOfMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const used = firstOfMonth.getDay() + lastOfMonth.getDate();

    let i=0;
    while (i < Math.ceil( used / 7)) {
      this.numberOfWeek.push('box');
      i++;
    }
  }

  getWorkingDays(): string[] {
    let workDay = this.weekArray.filter((e: string) => !this.workWeekDetail.workweekDetails.weekOff.includes(e));
    return workDay;
  }

  // async editProfile(){
  //   const profileModal = this.modalCtrl.create({
  //     component: EditProfilePage,
  //     mode: 'md',
  //     showBackdrop: true,
  //     backdropDismiss: false,
  //     initialBreakpoint: 1,
  //     componentProps: {userId: this.userId}
  //   });

  //   (await profileModal).present();

  //   (await profileModal).onDidDismiss().then(result => {
  //     if(result.data && result.role === 'confirm'){
  //       this.getAdminProfile();
  //     }
  //   });
  // }

  editProfile(){
    localStorage.setItem('lastRoute', this.router.url);
    this.router.navigate([`/tabs/edit-profile/${this.userId}`]);
  }

  goBack() {this.router.navigate([`/tabs/home`]);}

  logout() {this.authServ.signOut();}

  getName() {
    if(this.adminDetail.lastName && this.adminDetail.lastName.trim() !== ''){
      return `${this.adminDetail.firstName.slice(0,1)}${this.adminDetail.lastName.slice(0,1)}`;
    } else {
      return `${this.adminDetail.firstName.slice(0,2)}`;
    }
  }
  
  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }

  accordionChange(event: CustomEvent){
    if(event.detail.value){
      this.activeTab = event.detail.value;
    }
  }

  getAddress(add: IAddress){
    const fullAddress = `${add.addressLine1}, ${add.addressLine2}, ${add.city}, ${add.state}, ${add.country}, ${add.zipCode}`;
    return fullAddress;
  }

}
