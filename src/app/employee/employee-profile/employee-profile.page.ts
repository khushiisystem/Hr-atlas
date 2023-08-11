import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonAccordionGroup } from '@ionic/angular';
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
  employeeDetail: any;
  activeTab: string = "";

  constructor(
    private activeRoute: ActivatedRoute,
    private shareServ: ShareService,
    private loaderServ: LoaderService,
  ) {
    this.employeeId = activeRoute.snapshot.params?.['employeeId'];
  }

  ngOnInit() {
    if(this.employeeId.trim() !== ''){
      // this.getEmployeeDetails();
    }
  }

  getEmployeeDetails(){
    this.loaderServ.present('fullHide');
    this.shareServ.getEmployeeById(this.employeeId).subscribe(res => {
      if(res){
        this.employeeDetail = res;
        this.loaderServ.dismiss();
      }
    }, (error) => {
      console.log(error, "error");
      this.loaderServ.dismiss();
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

}
