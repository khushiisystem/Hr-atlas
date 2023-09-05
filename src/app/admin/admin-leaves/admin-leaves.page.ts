import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ILeaveLogsResponse } from 'src/app/interfaces/response/ILeave';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-admin-leaves',
  templateUrl: './admin-leaves.page.html',
  styleUrls: ['./admin-leaves.page.scss'],
})
export class AdminLeavesPage implements OnInit {
  selectedDates: string[] = [];
  toggleChecked: boolean = false;
  showApplyForm: boolean = false;
  applyCardTitle: string = '';
  openCalendar: boolean = false;
  activeTab: string = 'requests'
  leaveLogs: ILeaveLogsResponse[] = [];
  requestedLeaveList: ILeaveLogsResponse[] = [];

  constructor(
    private router: Router,
    private shareServ: ShareService,
    private adminServ: AdminService,
    private loader: LoaderService,
  ) {}

  ngOnInit() {
    this.selectedDates = history.state.selectedDates || [];
    this.requestedLeaves();
    this.getLogs();
  }

  goBack() {history.back();}

  leaveApprovel(leaveId: string, action: string){
    this.loader.present('');
    const leaveData = {
      leaveGuid: leaveId,
      aproveLeave: action
    }
    this.adminServ.leaveApprove(leaveData).subscribe(res => {
      console.log(res, 'res');
      if(res){
        this.shareServ.presentToast('Responded', 'top', 'success');
        this.loader.dismiss();
      }
    }, (error) => {
      this.shareServ.presentToast('Something went wrong', 'top', 'danger');
      this.loader.dismiss();
    })
  }

  getLogs(){
    const data = {};
    this.shareServ.getLeaveList(data).subscribe(res => {
      if(res) {
        this.leaveLogs = res;
      }
    });
  }

  requestedLeaves(){
    const data = {
      status: 'Pending'
    };
    this.shareServ.getLeaveList(data).subscribe(res => {
      if(res) {
        this.requestedLeaveList = res;
      }
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

  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }
}
