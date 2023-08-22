import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonAccordionGroup } from '@ionic/angular';
import { IAddress } from 'src/app/interfaces/request/IEmployee';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-employee-profile',
  templateUrl: './employee-profile.page.html',
  styleUrls: ['./employee-profile.page.scss'],
})
export class EmployeeProfilePage implements OnInit {
  @ViewChild('accordionGroup', { static: true }) accordionGroup!: IonAccordionGroup;
  employeeId: string = "";
  employeeDetail!: IEmployeeResponse;
  expandedAccordion: string = "Personal";
  dataLoaded: boolean = false;
  randomList: any[] = [];

  constructor(
    private activeRoute: ActivatedRoute,
    private shareServ: ShareService,
  ) {
    this.employeeId = activeRoute.snapshot.params?.['employeeId'];
    this.randomList.length = 7;
  }

  ngOnInit() {
    if(this.employeeId.trim() !== ''){
      this.getEmployeeDetails();
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

}
