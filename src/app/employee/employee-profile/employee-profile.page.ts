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
    console.log('entered');
    if(this.employeeId.trim() !== ''){
      this.getEmployeeDetails();
      this.getWorkDetails();
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

  goBack(){
    const lastRoute = localStorage.getItem('lastRoute');
    if(lastRoute && lastRoute.trim() !== '/tabs/home'){
      this.router.navigate([lastRoute]);
    } else {history.back();}
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

  async openWorkModal() {
    const workModal = this.modalCtrl.create({
      component: AddExperiencePage,
      backdropDismiss: false,
      mode: 'md',
      animated: true,
      showBackdrop: true,
      handleBehavior: 'cycle',
      componentProps: {employeeId: this.employeeDetail.employeeId, userId: this.employeeDetail.guid, action: this.workDetail ? 'edit' : 'add'}
    });
    
    (await workModal).present();
    (await workModal).onDidDismiss().then(res => {
      console.log(res, "res");
      if(res.data && res.role === 'confirm'){
        this.getWorkDetails();
      }
    });
  }
  
  async editProfile(){
    const employeeModel = this.modalCtrl.create({
      component: AddEmployeePage,
      componentProps: {
        action: "edit",
        employeeId: this.employeeDetail.guid
      },
      mode: 'md',
      initialBreakpoint: 1
    });

    (await employeeModel).present();

    (await employeeModel).onDidDismiss().then(result => {
      if(result.data) {
        this.getEmployeeDetails();
      }
    });
  }

  ionViewWillLeave(): void {
    this.employeeDetail = undefined as any;
    this.workDetail = undefined as any;
    this.expandedAccordion = '';
    this.dataLoaded = false;
    this.employeeId = '';
  }

}
