import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonInfiniteScroll } from '@ionic/angular';
import { ILeaveLogsResponse } from 'src/app/interfaces/response/ILeave';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { RoleStateService } from 'src/app/services/roleState.service';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-admin-leaves',
  templateUrl: './admin-leaves.page.html',
  styleUrls: ['./admin-leaves.page.scss'],
})
export class AdminLeavesPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  selectedDates: string[] = [];
  requestLoaded: boolean = false;
  logsLoaded: boolean = false;
  applyCardTitle: string = '';
  openCalendar: boolean = false;
  moreRequests: boolean = false;
  moreLogs: boolean = false;
  pageNumber: number = 0;
  logPageNumber: number = 0;
  activeTab: string = 'requests'
  leaveLogs: ILeaveLogsResponse[] = [];
  requestedLeaveList: ILeaveLogsResponse[] = [];
  userRole: string = '';

  constructor(
    private router: Router,
    private shareServ: ShareService,
    private adminServ: AdminService,
    private roleStateServ: RoleStateService,
    private loader: LoaderService,
  ) {
    this.roleStateServ.getState().subscribe(res => {
      if(res){
        this.userRole = res;
      } else {
        this.userRole = localStorage.getItem('userRole') || "";
      }
    });
  }

  ngOnInit() {
    this.selectedDates = history.state.selectedDates || [];
    this.requestedLeaves();
    this.getLogs();
  }

  goBack() {history.back();}

  leaveApprovel(leaveId: string, approvel: boolean){
    this.loader.present('');
    const leaveData = {
      leaveGuid: leaveId,
      aproveLeave: approvel
    }
    this.adminServ.leaveApprove(leaveData).subscribe(res => {
      console.log(res, 'res');
      if(res){
        if(res.Message){
          this.shareServ.presentToast(res.Message, 'top', 'success');
        } else {
          this.shareServ.presentToast('Responded', 'top', 'success');
        }
        this.loader.dismiss();
        this.pageNumber = 0;
        this.logPageNumber = 0;
        this.requestedLeaves();
        this.getLogs();
      }
    }, (error) => {
      this.shareServ.presentToast(error.error.message, 'top', 'danger');
      this.loader.dismiss();
    })
  }

  getLogs(){
    this.logsLoaded = false;
    const data = {};
    if(this.logPageNumber < 1){
      this.requestedLeaveList = []
    }
    this.shareServ.getLeaveList(data, this.logPageNumber * 20, 20).subscribe(res => {
      if(res) {
        if(res.length < 1){this.moreLogs = false; this.logsLoaded = true;}
        
        for(let i=0; i < res.length; i++){
          this.leaveLogs.push(res[i]);
        }
        this.moreLogs = res.length > 19;
        if(this.activeTab === 'logs' && !this.moreLogs && this.infiniteScroll){
          this.infiniteScroll.complete();
        }
        this.logsLoaded = true;
      }
    }, (error) => {
      console.log(error.error)
      this.logsLoaded = true;
    });
  }

  requestedLeaves(){
    this.requestLoaded = false;
    const data = {
      status: 'Pending'
    };
    if(this.pageNumber < 1){
      this.requestedLeaveList = []
    }
    this.shareServ.getLeaveList(data, this.pageNumber * 20, 20).subscribe(res => {
      if(res) {
        if(res.length < 1){this.moreRequests = false; this.requestLoaded = true;}

        for(let i=0; i < res.length; i++){
          this.requestedLeaveList.push(res[i]);
        }
        this.moreRequests = res.length > 19;
        if(this.activeTab === 'requests'  && this.infiniteScroll && !this.moreRequests){
          this.infiniteScroll.complete();
        }
        this.requestLoaded = true;
      }
    }, (error) => {
      console.log(error.error);
      this.requestLoaded = true;
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

  loadRequests(){
    if (this.moreRequests) {
      this.pageNumber++;
      this.requestedLeaves();
    }
  }

  loadLogs(){
    if (this.moreLogs) {
      this.logPageNumber++;
      this.getLogs();
    }
  }

  loadMoreData(event: any){
    if(this.activeTab === 'requests'){
      this.loadRequests();
    } else if(this.activeTab === 'logs'){
      this.loadLogs();
    }
  }
}
