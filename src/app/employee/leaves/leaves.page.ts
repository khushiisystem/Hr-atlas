import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatetimeCustomEvent } from '@ionic/angular';
import { ILeaveApplyrequest } from 'src/app/interfaces/request/ILeaveApply';
import { ILeaveLogsResponse, ILeaveStatus } from 'src/app/interfaces/response/ILeave';
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
  moreData: boolean = false;
  platformType: string = "";
  platformBtn: string = "";
  activeTab: string = 'status'
  leaveLogs: ILeaveLogsResponse[] = [];
  pageNumber: number = 0;
  leaveStatus!: ILeaveStatus;

  constructor(
    private router: Router,
    private shareServ: ShareService,
    private loader: LoaderService,
  ) {}

  ngOnInit() {
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

}
