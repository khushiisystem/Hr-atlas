import { Component } from '@angular/core';
import { RoleStateService } from '../services/roleState.service';
import { AdminService } from '../services/admin.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  userRole: string = "";
  userId: string = "";

  constructor(private roleStateServ: RoleStateService, private adminServ: AdminService,) {
    roleStateServ.getState().subscribe(res => {
      this.userRole = res || localStorage.getItem('userRole') || "";
    });
    this.userId = localStorage.getItem("userId") || "";

    if(this.userId.trim() !== ""){
      adminServ.getEmployeeById(this.userId).subscribe(res => {
        roleStateServ.updateState(res.role);
      });
    }
  }

  clearLastRoute(){localStorage.setItem('lastRoute', "/tabs/home");}

}
