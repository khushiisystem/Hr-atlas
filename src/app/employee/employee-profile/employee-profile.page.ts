import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
export class EmployeeProfilePage implements OnInit {
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
  ) {
    this.employeeId = activeRoute.snapshot.params?.['employeeId'];
    this.randomList.length = 7;
  }

  ngOnInit() {
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
        console.log(this.workDetail);
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

  goBack(){history.back();}
  
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

  async openWorkModal() {
    const workModal = this.modalCtrl.create({
      component: AddExperiencePage,
      initialBreakpoint: 1,
      backdropDismiss: false,
      mode: 'md',
      animated: true,
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

}
