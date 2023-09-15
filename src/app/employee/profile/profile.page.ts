import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonAccordionGroup, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/core/auth.service';
import { LoaderService } from 'src/app/services/loader.service';
import { EditProfilePage } from '../edit-profile/edit-profile.page';
import { IAddress } from 'src/app/interfaces/request/IEmployee';
import { IEmployeeResponse, IEmployeeWrokResponse } from 'src/app/interfaces/response/IEmployee';
import { ShareService } from 'src/app/services/share.service';

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
  activeTab: string = "";
  dataLoaded: boolean = false;
  expandedAccordion: string = "Personal";

  constructor(
    private router: Router,
    private authServ: AuthService,
    private shareServ: ShareService,
    private loadingServ: LoaderService,
    private modalCtrl: ModalController,
  ) { }

  ngOnInit() {
    this.employeeId = localStorage.getItem('userId') || "";
    if(this.employeeId.trim() !== ''){
      this.getEmployeeDetails();
      this.getWorkDetails();
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
      console.log(error, "error");
      this.dataLoaded = true;
    });
  }

  getWorkDetails(){
    this.shareServ.getWorkByEmployeeId(this.employeeId).subscribe(res => {
      if(res) {
        this.workDetail = res[0];
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

  async editProfile(){
    const profileModal = this.modalCtrl.create({
      component: EditProfilePage,
      mode: 'md',
      showBackdrop: true,
      backdropDismiss: false,
      initialBreakpoint: 1,
      componentProps: {userId: this.employeeId}
    });

    (await profileModal).present();

    (await profileModal).onDidDismiss().then(result => {
      console.log(result, "result");
    });
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

  goBack() {history.back();}

  logout() {this.authServ.signOut();}
  
  openWorkPage() {
    this.router.navigate(['./workpage']);
  }
  workWeek() {
    this.router.navigate([`/employee-work-week/${this.employeeId}`]);
  }


}
