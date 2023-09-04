import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatetimeCustomEvent } from '@ionic/angular';
import { ILeaveApplyrequest } from 'src/app/interfaces/request/ILeaveApply';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-leaves',
  templateUrl: './leaves.page.html',
  styleUrls: ['./leaves.page.scss'],
})
export class LeavesPage implements OnInit {
  selectedDates: string[] = [];
  toggleChecked: boolean = false;
  showApplyForm: boolean = false;
  selectedLeaveType: string = '';
  startDate!: string;
  endDate!: string;
  leaveType!: string;
  purpose!: string; 
  applyCardTitle: string = '';
  openCalendar: boolean = false;
  platformType: string = "";
  platformBtn: string = "";

  constructor(
    private router: Router,
    private shareServ: ShareService,
    private loader: LoaderService,
  ) {}

  ngOnInit() {
    this.selectedDates = history.state.selectedDates || [];
  }

  goBack() {history.back();}

  goback() {
    this.router.navigate(['./logs']);
  }

  toggleChanged() {
    if (this.toggleChecked) {
      this.router.navigate(['./leaves']);
    } else {
      this.router.navigate(['./leaveadmin']);
    }
  }

  calculateCreditedLeaves(): number {
  
    return this.getMonthNumber() * 1.5;
  }

  getAppliedLeaves(): number {
    
    return 5;
  }

  getPenalty(): number {
    
    return 2;
  }

  getCreditedData(): string {
  
    return '365';
  }

  getCreditedDataForLossOfPay(): string {
  
    return '365';
  }

  getAppliedDataForLossOfPay(): string {
  
    return '10';
  }

  getPenaltyForLossOfPay(): number {
    
    return 2;
  }


  submitLeave() {
    
    this.showApplyForm = false;
    this.startDate = '';
    this.endDate = '';
    this.leaveType = 'fullDay';
    this.purpose = ''; 
    // this.showApplyFormForCasualLeave = false;
    // this.showApplyFormForLossOfPay = false;
  }

  private getMonthNumber(): number {
    const currentDate = new Date();
    return currentDate.getMonth() + 1; 
  }

  getToday(): string {
    const today = new Date();
    return today.toISOString(); 
  }
  getDate(){
    // const formDate = this.employeeForm.controls['dateOfBirth'].value;
    // return new Date(formDate != '' ? formDate : this.maxDate);
  }

  selectDate(event: DatetimeCustomEvent){
    // this.employeeForm.patchValue({
    //   dateOfBirth: moment.utc(event.detail.value).format()
    // });
    this.getDate();
    // console.log(this.employeeForm.value);
  }

  leaveApply(event: ILeaveApplyrequest){
    console.log(event, "event");
    this.loader.present('');
    this.shareServ.leaveApply(event).subscribe(res => {
      console.log(res, 'res');
      if(res){
        this.showApplyForm = false;
        this.shareServ.presentToast('Leave requested successfully', 'top', 'success');
        this.loader.dismiss();
      }
    }, (error) => {
      this.shareServ.presentToast('Something went wrong', 'top', 'danger');
      this.loader.dismiss();
    })
  }

}
