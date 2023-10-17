import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatetimeCustomEvent } from '@ionic/angular';
import { ILeaveApplyrequest } from 'src/app/interfaces/request/ILeaveApply';
import { ILeaveStatus } from 'src/app/interfaces/response/IAttendanceSetup';
import { ILeaveLogsResponse } from 'src/app/interfaces/response/ILeave';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-employee-leaves',
  templateUrl: './employee-leaves.page.html',
  styleUrls: ['./employee-leaves.page.scss'],
})
export class EmployeeLeavesPage implements OnInit {
  selectedDates: string[] = [];
  toggleChecked: boolean = false;
  showApplyForm: boolean = false;
  selectedLeaveType: string = '';
  startDate!: string;
  endDate!: string;
  leaveType!: string;
  purpose!: string; 
  applyCardTitle: string = '';
  userID: string = '';
  openCalendar: boolean = false;
  moreData: boolean = false;
  platformType: string = "";
  platformBtn: string = "";
  activeTab: string = 'status'
  leaveLogs: ILeaveLogsResponse[] = [];
  pageNumber: number = 0;
  leaveStatus: any;

  constructor(
    private router: Router,
    private shareServ: ShareService,
    private loader: LoaderService,
  ) { 
    this.userID = localStorage.getItem('userId') || '';
  }

  ngOnInit() {
    this.selectedDates = history.state.selectedDates || [];
    this.getLeaveStatus();
    this.getLogs();
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
    this.loader.present('');
    this.shareServ.leaveApply(event).subscribe(res => {
      if(res){
        this.showApplyForm = false;
        this.shareServ.presentToast('Leave requested successfully', 'top', 'success');
        this.loader.dismiss();
        this.getLogs();
        this.getLeaveStatus();
      }
    }, (error) => {
      this.shareServ.presentToast(error.error.message || 'Something went wrong', 'top', 'danger');
      this.loader.dismiss();
    })
  }

  getLogs(){
    const data = { employeeId: this.userID, };
    this.shareServ.getLeaveList(data, this.pageNumber * 10, 10).subscribe(res => {
      if(res) {
        this.leaveLogs = res;
        this.moreData = false;
      }
    });
  }

  getLeaveStatus(){
    this.shareServ.getLeaveStatus().subscribe(res => {
      console.log(res, 'status');
      if(res){
        this.leaveStatus = res;
      }
    }, (error) => {
      console.log(error, "error status");
    });
  }

  getStatus(status: string) {
    let leaveStatus;
    let color;
    switch (status) {
      case 'Reject':
        leaveStatus = 'Rejected';
        color = 'danger';
        break;

      case 'Accept':
        leaveStatus = 'Accepted';
        color = 'success';
        break;

      case 'Pending':
        leaveStatus = 'Pending';
        color = 'warning';
        break;

      case 'Cancel':
        leaveStatus = 'Canceled';
        color = 'danger';
        break;
    
      default:
        leaveStatus = 'Pending';
        color = 'warning';
        break;
    }

    return {leaveStatus: leaveStatus, color: color};
  }

  loadMore(){
    this.pageNumber++;
    this.getLogs();
  }

  cancelLeave(leaveId: string) {
    this.loader.present('');
    this.shareServ.cancelLeave(leaveId).subscribe(res => {
      if(res){
        console.log(res, 'cancel leave res');
        this.shareServ.presentToast("Leave canceled.", 'top', 'success');
        this.loader.dismiss();
        this.getLogs();
      }
    }, (error) => {
      console.log(error, "error");
      this.shareServ.presentToast("Something went wrong.", 'top', 'danger');
      this.loader.dismiss();
    })
  }

}
