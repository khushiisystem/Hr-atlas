import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, DatetimeCustomEvent, IonInfiniteScroll } from '@ionic/angular';
import { ILeaveRequest } from 'src/app/interfaces/request/ILeaveApply';
import { ILeaveStatus } from 'src/app/interfaces/response/IAttendanceSetup';
import { ILeaveLogsResponse } from 'src/app/interfaces/response/ILeave';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';
import { LeaveAction } from 'src/app/share/components/leave-card/leave-card.page';

@Component({
  selector: 'app-employee-leaves',
  templateUrl: './employee-leaves.page.html',
  styleUrls: ['./employee-leaves.page.scss'],
})
export class EmployeeLeavesPage implements OnInit {
  @ViewChild('emplogList') infiniteScroll!: IonInfiniteScroll;
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
  logsLoaded: boolean = false;
  statusLoaded: boolean = false;
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
    private alertCtrl: AlertController,
  ) { 
    this.userID = localStorage.getItem('userId') || '';
  }

  ngOnInit() {
    this.selectedDates = history.state.selectedDates || [];
    this.getLeaveStatus();
    this.getLogs();
  }

  getDate(dateStr: Date | string) {
    return new Date(dateStr);
  }

  private getMonthNumber(): number {
    const currentDate = new Date();
    return currentDate.getMonth() + 1; 
  }

  getToday(): string {
    const today = new Date();
    return today.toISOString(); 
  }

  selectDate(event: DatetimeCustomEvent){
    // this.employeeForm.patchValue({
    //   dateOfBirth: moment.utc(event.detail.value).format()
    // });
    // this.getDate();
    // console.log(this.employeeForm.value);
  }

  leaveApply(event: string){
    console.log('event check : ',event);
    if(event === 'success'){
      this.logsLoaded = false;
      this.showApplyForm = !this.showApplyForm;
      this.selectedLeaveType = '';
      this.pageNumber = 0;
      this.getLogs();
      this.getLeaveStatus();
    }
  }

  getLogs(){
    this.logsLoaded = false;
    const data = { employeeId: this.userID, };
    this.shareServ.getLeaveList(data, this.pageNumber * 10, 10).subscribe(res => {
      if(res) {
        if(this.pageNumber < 1){this.leaveLogs = [];}
        for(let i=0; i<res.length; i++){
          if(!this.leaveLogs.some((item) => item.guid === res[i].guid )){
            this.leaveLogs.push(res[i]);
          }
        }
        this.moreData = res.length > 9;
        this.logsLoaded = true;
        this.loader.dismiss();
      }
    }, (error) => {
      this.moreData = false;
      this.logsLoaded = true;
    });
  }

  loadLogs(event: any){
    if(this.moreData) {
      this.pageNumber++;
      this.getLogs();
    }
  }

  getLeaveStatus(){
    this.statusLoaded = false;
    this.shareServ.getLeaveStatus().subscribe(res => {
      if(res){
        this.leaveStatus = res;
        this.statusLoaded = true;
      }
    }, (error) => {
      this.statusLoaded = true;
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

  leaveAction(event: LeaveAction){
    if(event.action === "Cancel" && event.leaveId){
      this.cancelLeave(event.leaveId);
    }
  }
 
  async cancelLeave(leaveId: string) {
    const cancelAlert = await this.alertCtrl.create({
      header: 'Leave Cancel',
      subHeader: 'Are you sure, you want to cancel leave?',
      mode: 'md',
      buttons: [{
        text: 'No',
        role: 'cancel',
        cssClass: 'cancelBtn',
        handler: () => {}
      },{
        text: 'Yes',
        role: 'confirm',
        cssClass: 'deleteBtn',
        handler: () => {
          this.loader.present('');

          this.shareServ.cancelLeave(leaveId).subscribe(res => {
            if(res){
              this.shareServ.presentToast("Leave canceled.", 'top', 'success');
              this.pageNumber = 0;
              this.getLogs();
              this.getLeaveStatus();
            }
          }, (error) => {
            console.log(error, "error");
            this.shareServ.presentToast("Something went wrong.", 'top', 'danger');
            this.loader.dismiss();
          });
        }
      },]
    });

    await cancelAlert.present();
  }

  handleRefresh(event: any) {
    console.log("Refresher triggered employee page");
    setTimeout(() => {
      event.target.complete();
      window.location.reload();
    }, 1000);
  }

}
