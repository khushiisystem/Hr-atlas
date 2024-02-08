import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ILeaveLogsResponse } from 'src/app/interfaces/response/ILeave';
import { RoleStateService } from 'src/app/services/roleState.service';

export interface LeaveCardButton {
  label: string;
  color: string;
  return: string
}

export interface LeaveAction{
  action: 'Reject' | 'Accept' | 'Cancel' | string;
  leaveId: string;
}

@Component({
  selector: 'leave-card',
  templateUrl: './leave-card.page.html',
  styleUrls: ['./leave-card.page.scss'],
})
export class LeaveCardPage implements OnInit, AfterViewInit {
  @Input() leaveItem!: ILeaveLogsResponse;
  @Input() actonButtons: LeaveCardButton[] = [];
  @Output() actionReturn: EventEmitter<LeaveAction> = new EventEmitter<LeaveAction>();
  userRole: string = "";
  isLoggedIn: boolean = false;

  constructor(private roleState: RoleStateService) {
    roleState.getState().subscribe(res => {
      this.userRole = res;
    });
    this.isLoggedIn = localStorage.getItem('token') != null && localStorage.getItem('token')?.toString().trim() != "";
  }

  ngOnInit() {
    this.roleState.getState().subscribe(res => {
      this.userRole = res;
    });
  }

  ngAfterViewInit(): void {
    this.roleState.getState().subscribe(res => {
      this.userRole = res;
    });
  }
  
  getDate(dateStr: Date | string) {
    return new Date(dateStr);
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

  leaveAction(action: 'Reject' | 'Accept' | 'Cancel' | string){
    this.actionReturn.emit({action: action, leaveId: this.leaveItem.guid});
  }
}
