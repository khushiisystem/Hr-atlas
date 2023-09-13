import { Component } from '@angular/core';
import { RoleStateService } from '../services/roleState.service';
import { AdminService } from '../services/admin.service';
import { UserStateService } from '../services/userState.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  userRole: string = "";
  userId: string = "";

  constructor(private roleStateServ: RoleStateService, private adminServ: AdminService, private userStateServ: UserStateService) {
    userStateServ.getState().subscribe(res => {
      if(!res){
        this.userId = localStorage.getItem("userId") || "";
        if(this.userId.trim() !== ""){
          adminServ.getEmployeeById(this.userId).subscribe(res => {
            userStateServ.updateState(res);
            roleStateServ.updateState(res.role);
          });
        }    
      }
    })
    roleStateServ.getState().subscribe(res => {
      this.userRole = res || localStorage.getItem('userRole') || "";
    });
  }

  clearLastRoute(){localStorage.setItem('lastRoute', "/tabs/home");}

}
