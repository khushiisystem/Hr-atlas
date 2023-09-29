import { Component, OnInit } from '@angular/core';
import { RoleStateService } from 'src/app/services/roleState.service';

@Component({
  selector: 'app-leaves',
  templateUrl: './leaves.page.html',
  styleUrls: ['./leaves.page.scss'],
})
export class LeavesPage implements OnInit {
  userRole: string = '';
  isSwitchable: boolean = false;

  constructor(
    private roleStateServ: RoleStateService,
  ) {
    this.roleStateServ.getState().subscribe(res => {
      if(res){
        this.userRole = res;
        this.isSwitchable = this.userRole === 'Admin';
      } else {
        this.userRole = localStorage.getItem('userRole') || "";
        this.isSwitchable = this.userRole === 'Admin';
      }
    });
  }

  ngOnInit() {
  }

  goBack() {history.back();}

  roleToggle(event: any) {
    if(event.detail.checked){
      this.roleStateServ.updateState('Admin');
      localStorage.setItem('userRole', 'Admin');
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
