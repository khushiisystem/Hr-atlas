import { Component, OnInit } from '@angular/core';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { RoleStateService } from 'src/app/services/roleState.service';
import { UserStateService } from 'src/app/services/userState.service';

@Component({
  selector: 'app-leaves',
  templateUrl: './leaves.page.html',
  styleUrls: ['./leaves.page.scss'],
})
export class LeavesPage implements OnInit {
  userRole: string = '';
  leaveType: string = '';
  isSwitchable: boolean = false;
  userDetails!: IEmployeeResponse;


  constructor(
    private roleStateServ: RoleStateService,
    private userStateServ: UserStateService,

  ) {
    this.roleStateServ.getState().subscribe(res => {
      if(res){
        this.userRole = res;
        console.log("res: ", res);
      } else {
        this.userRole = localStorage.getItem('userRole') || "";
      }
    });
  }


  ngOnInit() {
    const isSwitched = localStorage.getItem('isSwitchable');
    this.isSwitchable = (isSwitched && isSwitched === 'true') ? true : false;
    console.log(this.isSwitchable);
    this.leaveType = history.state.tab;

    this.getStates();
  }
  getStates(){
    this.userStateServ.getState().subscribe(res => {
      if(res){
        this.userDetails = res;
        console.log("resle: ", res);
        if(res.role === 'Employee'){
          localStorage.setItem('isSwitchable', 'false');
          this.isSwitchable = false;
          // if(this.userDetails.currentAddress.addressLine1 == null || this.userDetails.currentAddress.addressLine1.trim() == '' || !this.userDetails.dateOfBirth){
          //   // this.openUpdationPopup();
          // }
        } else if(res.role === 'Admin' || res.role === 'HR') {
          localStorage.setItem('isSwitchable', 'true');
          // this.checkAdminSetups();
          // this.requestedLeaveList = [];
          // this.getRequests();
          // this.today.setHours(0, 0, 0);
          // this.getTodayAttendance(this.today.toISOString(), 0);
          this.isSwitchable = true;
        }
        this.roleStateServ.updateState(this.userDetails.role);
        // this.getAttendance();
        // this.getCalendar();
        // this.fetchBirthdays();
        // this.isDataLoaded = true;
      }
    });

    this.roleStateServ.getState().subscribe(res => {
      this.userRole = res || "";

      if(this.userRole === 'Admin'){
      }
    });
  }

  goBack() {history.back();}
  
  roleToggle(event: any, actulRole: string) {
    if(event.detail.checked){
      this.roleStateServ.updateState(actulRole);
      localStorage.setItem('userRole', actulRole);
    } else {
      this.roleStateServ.updateState('Employee');
      localStorage.setItem('userRole', 'Employee');
    }
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }

}
