import { ChangeDetectorRef, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { GestureController, GestureDetail, IonInfiniteScroll } from '@ionic/angular';
import { ILeaveLogsResponse } from 'src/app/interfaces/response/ILeave';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { RoleStateService } from 'src/app/services/roleState.service';
import { ShareService } from 'src/app/services/share.service';
import { LeaveAction } from 'src/app/share/components/leave-card/leave-card.page';

@Component({
  selector: 'app-admin-leaves',
  templateUrl: './admin-leaves.page.html',
  styleUrls: ['./admin-leaves.page.scss'],
})
export class AdminLeavesPage implements OnInit {
  @ViewChild("requestsInfiniteScroll") requestsInfiniteScroll!: IonInfiniteScroll;
  @ViewChild('logsInfiniteScroll') logsInfiniteScroll!: IonInfiniteScroll;
  @ViewChild('tabsContent', { read: ElementRef }) tabsContent!: ElementRef<HTMLDivElement>;
  @Input() leaveType?: string;
  selectedDates: string[] = [];
  requestLoaded: boolean = false;
  logsLoaded: boolean = false;
  applyCardTitle: string = '';
  openCalendar: boolean = false;
  moreRequests: boolean = false;
  moreLogs: boolean = false;
  pageNumber: number = 0;
  logPageNumber: number = 0;
  activeTab: string = '';
  leaveLogs: ILeaveLogsResponse[] = [];
  requestedLeaveList: ILeaveLogsResponse[] = [];
  userRole: string = '';
  tabs: Array<{value: string, label: string}> = [{label: "Requests", value: "requests"}, {label: "logs", value: "logs"}]
  private isTabChangeTriggered = false;

  constructor(
    private router: Router,
    private shareServ: ShareService,
    private adminServ: AdminService,
    private roleStateServ: RoleStateService,
    private loader: LoaderService,
    private el: ElementRef,
    private gestureCtrl: GestureController,
    private cdRef: ChangeDetectorRef,
  ) {
    this.roleStateServ.getState().subscribe(res => {
      if(res){
        this.userRole = res;
      } else {
        this.userRole = localStorage.getItem('userRole') || "";
      }
    });

    this.activeTab = this.leaveType ? this.leaveType : 'requests'
  }

  ngOnInit() {
    this.selectedDates = history.state.selectedDates || [];
    this.requestedLeaves();
    this.getLogs();
  }

  ngAfterViewInit(): void {
    const gesture = this.gestureCtrl.create({
      el: this.tabsContent.nativeElement,
      threshold: 0,
      onStart: () => this.onStart(),
      onMove: (detail) => this.onMove(detail),
      onEnd: () => this.onEnd(),
      gestureName: 'change-tab-in-adminLeaves',
    });

    gesture.enable();
  }

  private onStart() {
    this.isTabChangeTriggered = false;
    this.cdRef.detectChanges();
  }
  
  private onMove(detail: GestureDetail) {
    if(this.isTabChangeTriggered){return;}
    const tabIndex = this.tabs.findIndex((tab) => tab.value === this.activeTab);
    
    if(detail.deltaX < -90 && tabIndex < this.tabs.length-1){
      this.activeTab = this.tabs[tabIndex+1].value;
      this.isTabChangeTriggered = true;
    } else if(detail.deltaX > 90 && tabIndex > 0){
      this.activeTab = this.tabs[tabIndex-1].value;
      this.isTabChangeTriggered = true;
    }
  }

  private onEnd() {
    this.isTabChangeTriggered = false;
    this.cdRef.detectChanges();
  }

  goBack() {history.back();}
  
  getDate(dateStr: Date | string) {
    return new Date(dateStr);
  }

  leaveApprovel(event: LeaveAction){
    const approvel: boolean = event.action === "Accept";
    
    this.loader.present('');
    const leaveData = {
      leaveGuid: event.leaveId,
      approveLeave: approvel
    }
    this.adminServ.leaveApprove(leaveData).subscribe(res => {
      if(res){
        if(res.Message){
          this.shareServ.presentToast(res.Message, 'top', 'success');
        } else {
          this.shareServ.presentToast('Responded', 'top', 'success');
        }
        this.logPageNumber = 0;
        this.pageNumber = 0;
        this.loader.dismiss();
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
    this.shareServ.getLeaveList(data, this.logPageNumber * 20, 20).subscribe(res => {
      if(res) {
        if(res.length < 1){this.moreLogs = false; this.logsLoaded = true;}
        
        if(this.logPageNumber < 1){this.leaveLogs = [];}
        for(let i=0; i < res.length; i++){
          if(!this.leaveLogs.some((item: ILeaveLogsResponse) => item.guid === res[i].guid) && res[i].status !== "Pending"){
            this.leaveLogs.push(res[i]);
          }
          if (res[i].status == "Pending" && !this.requestedLeaveList.some((item) => item.guid === res[i].guid)) {
            this.requestedLeaveList.push(res[i]);
            this.requestLoaded = true;
            this.requestedLeaveList.sort((a, b) => new Date(a.created_date).getTime() - new Date(b.created_date).getTime());
          }
        }
        this.moreLogs = res.length > 19;
        if(this.logsInfiniteScroll && !this.moreLogs){
          this.logsInfiniteScroll.complete();
        }
        this.logsLoaded = true;
      }
    }, (error) => {
      this.logsLoaded = true;
    });
  }

  requestedLeaves(){
    this.requestLoaded = false;
    const data = {
      status: 'Pending'
    };
    this.shareServ.getLeaveList(data, this.pageNumber * 20, 20).subscribe(res => {
      if(res) {
        if(res.length < 1){this.moreRequests = false; this.requestLoaded = true;}

        if(this.pageNumber < 1){this.requestedLeaveList = [];}
        for(let i=0; i < res.length; i++){
          if(!this.requestedLeaveList.some((item: ILeaveLogsResponse) => item.guid === res[i].guid)){
            this.requestedLeaveList.push(res[i]);
          }
        }
        this.moreRequests = res.length > 19;
        if(this.requestsInfiniteScroll){
          if(!this.moreRequests){
          this.requestsInfiniteScroll.complete();}
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

  loadRequests(event: any){
    if (this.moreRequests) {
      this.pageNumber++;
      this.requestedLeaves();
    }
  }

  loadLogs(event: any){
    if (this.moreLogs) {
      this.logPageNumber++;
      this.getLogs();
    }
  }

  handleRefresh(event: any) {
    console.log("Refresher triggered ", this.userRole);
    setTimeout(() => {
      event.target.complete();
      window.location.reload();
    }, 2000);
  }
}
