import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonAccordionGroup, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/core/auth.service';
import { LoaderService } from 'src/app/services/loader.service';
import { EditProfilePage } from '../edit-profile/edit-profile.page';
import { IAddress } from 'src/app/interfaces/request/IEmployee';
import { IEmployeeResponse, IEmployeeWrokResponse } from 'src/app/interfaces/response/IEmployee';
import { ShareService } from 'src/app/services/share.service';
import { IEmplpoyeeWorWeek } from 'src/app/interfaces/response/IEmplpoyeeWorWeek';
import * as moment from 'moment';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  @ViewChild('accordionGroup', { static: true }) accordionGroup!: IonAccordionGroup;
  employeeId: string = "";
  employeeDetail!: IEmployeeResponse;
  workDetail!: IEmployeeWrokResponse;
  workWeekDetail!: IEmplpoyeeWorWeek;
  activeTab: string[] = ["experience","Account", "Personal", "Employment", "workWeek", "Contact", "Address", "Social_info"];
  weekArray: string[] = [];
  offDays: string[] = [];
  dataLoaded: boolean = false;
  workLoaded: boolean = false;
  workWeekLoaded: boolean = false;
  expandedAccordion: string = "Personal";

  constructor(
    private router: Router,
    private authServ: AuthService,
    private shareServ: ShareService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter(){
    this.employeeId = localStorage.getItem('userId') || "";
    if(this.employeeId.trim() !== ''){
      this.getEmployeeDetails();
      this.getWorkDetails();
      this.getWorkWeek();
    }
  }

  getEmployeeDetails(){
    this.dataLoaded = false;
    this.shareServ.getEmployeeById(this.employeeId).subscribe(res => {
      if(res){
        this.employeeDetail = res;
        this.dataLoaded = true;
      }
    }, (error) => {
      this.dataLoaded = true;
    });
  }

    getWorkDetails(){
    this.shareServ.getWorkByEmployeeId(this.employeeId).subscribe(res => {
      if(res) {
        this.workDetail = res;
        this.workLoaded = true;
      }
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

  accordionChange(event: CustomEvent){
    if(event.detail.value){
      this.activeTab = event.detail.value;
    }
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

  editProfile(){
    localStorage.setItem('lastRoute', this.router.url);
    this.router.navigate([`/tabs/edit-profile/${this.employeeId}`]);
  }

  getAddress(add: IAddress){
    const fullAddress = `${add.addressLine1}, ${add.addressLine2}, ${add.city}, ${add.state}, ${add.country}, ${add.zipCode}`;
    return fullAddress;
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

  goBack() {this.router.navigate([`/tabs/home`]);}

  logout() {this.authServ.signOut();}
  
  openWorkPage() {
    this.router.navigate(['./workpage']);
  }
  workWeek() {
    this.router.navigate([`/employee-work-week/${this.employeeId}`]);
  }
  
  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }

}
