import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonMenu } from '@ionic/angular';
import { AuthService } from 'src/app/core/auth.service';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { RoleStateService } from 'src/app/services/roleState.service';
import { UserStateService } from 'src/app/services/userState.service';

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.page.html',
  styleUrls: ['./side-nav.page.scss'],
})
export class SideNavPage implements OnInit {
  @ViewChild(IonMenu) sideNav!: IonMenu;
  userRole: string = '';
  userDetails!: IEmployeeResponse;
  userId: string = "";
  isSwitchable: boolean = false;

  constructor(
    private authServ: AuthService,
    private userStateServ: UserStateService,
    private roleStateServ: RoleStateService,
    private router: Router,
  ) { 
    this.userStateServ.getState().subscribe(res => {
      if(res){
        this.userDetails = res;
      }
    });
    this.roleStateServ.getState().subscribe(res => {this.userRole = res;});

    this.isSwitchable = localStorage.getItem("isSwitchable") !== null && (localStorage.getItem("isSwitchable") === 'true');
  }

  ngOnInit() {
    this.userId = localStorage.getItem('userId') || "";
  }

  logout() {
    this.authServ.signOut();
    this.sideNav.toggle();
  }
  
  goNext(route: string[],){
    if(this.userRole === 'Employee'){
      this.router.navigate([route[0]]);
    } else if(this.userRole === 'Admin' || this.userRole === 'HR'){
      this.router.navigate([route[1]]);
    }
    this.sideNav.toggle();
  }

  goNextAttendance(route: string[],){
    console.log(this.userRole, " userrole")
    if(this.userRole === 'Employee'){
      this.router.navigate(['/tabs/attendance/' + this.userId]);
    } else if(this.userRole === 'Admin' || this.userRole === 'HR'){
      this.router.navigate(['/tabs/attendance-status']);
    }
    this.sideNav.toggle();
  }
}
