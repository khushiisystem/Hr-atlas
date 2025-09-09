import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { ILeaveLogsResponse } from 'src/app/interfaces/response/ILeave';
import { LoaderService } from 'src/app/services/loader.service';
import { RoleStateService } from 'src/app/services/roleState.service';
import { ShareService } from 'src/app/services/share.service';

export interface LeaveCardButton {
  label: string;
  color: string;
  return: string
}

export interface LeaveAction {
  action: 'Reject' | 'Accept' | 'Cancel';
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

  constructor(private roleState: RoleStateService,
    private alertCtrl: AlertController,
    private loader: LoaderService,
    private shareServ: ShareService) {
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

    return { leaveStatus: leaveStatus, color: color };
  }

  leaveAction(action: 'Reject' | 'Accept' | 'Cancel') {
    if (action === "Cancel" && this.leaveItem.guid) {
      this.cancelLeave(this.leaveItem.guid);
      return;
    }
    this.actionReturn.emit({ action: action, leaveId: this.leaveItem.guid });
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
        handler: () => { }
      }, {
        text: 'Yes',
        role: 'confirm',
        cssClass: 'deleteBtn',
        handler: () => {
          this.loader.present('');

          this.shareServ.cancelLeave(leaveId).subscribe(res => {
            if (res) {
              this.shareServ.presentToast("Leave canceled.", 'top', 'success');
              // this.pageNumber = 0;
              this.loader.dismiss();
              window.location.reload();
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
} 
