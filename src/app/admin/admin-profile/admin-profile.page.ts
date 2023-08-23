import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonAccordionGroup, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/core/auth.service';
import { EditProfilePage } from 'src/app/employee/edit-profile/edit-profile.page';
import { IAddress } from 'src/app/interfaces/request/IEmployee';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';
import { AddEmployeePage } from '../add-employee/add-employee.page';

@Component({
  selector: 'app-admin-profile',
  templateUrl: './admin-profile.page.html',
  styleUrls: ['./admin-profile.page.scss'],
})
export class AdminProfilePage implements OnInit {
  @ViewChild('accordionGroup', { static: true }) accordionGroup!: IonAccordionGroup;
  userId: string = "";
  adminDetail!: IEmployeeResponse;
  activeTab: string = "Personal";
  dataLoaded: boolean = false;
  randomList: any[] = [];

  constructor(
    private router: Router,
    private authServ: AuthService,
    private modalCtrl: ModalController,
    private sahreServ: ShareService,
  ) { this.randomList.length = 7; }

  ngOnInit() {
    this.userId = localStorage.getItem('userId') || "";
    if(this.userId.trim() !== ''){
      this.getAdminProfile();
    }
  }

  getAdminProfile(){
    this.dataLoaded = false;
    this.sahreServ.getEmployeeById(this.userId).subscribe(res => {
      if(res) {
        this.adminDetail = res;
        this.dataLoaded = true;
      }
    }, (error) => {
      console.error(error, "get profile error");
      this.dataLoaded = true;
    });
  }

  async editProfile(){
    const profileModal = this.modalCtrl.create({
      component: AddEmployeePage,
      mode: 'md',
      showBackdrop: true,
      backdropDismiss: false,
      initialBreakpoint: 1,
      componentProps: {action: "edit", employeeId: this.userId}
    });

    (await profileModal).present();

    (await profileModal).onDidDismiss().then(result => {
      if(result.data && result.role === 'confirm'){
        this.getAdminProfile();
      }
    });
  }

  goBack() {history.back();}

  logout() {this.authServ.signOut();}
  
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
