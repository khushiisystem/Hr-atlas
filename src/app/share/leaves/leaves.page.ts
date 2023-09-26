import { Component, OnInit } from '@angular/core';
import { RoleStateService } from 'src/app/services/roleState.service';

@Component({
  selector: 'app-leaves',
  templateUrl: './leaves.page.html',
  styleUrls: ['./leaves.page.scss'],
})
export class LeavesPage implements OnInit {
  userRole: string = '';
  isSwitchable: string = '';

  constructor(
    private roleStateServ: RoleStateService,
  ) {
    this.roleStateServ.getState().subscribe(res => {
      if(res){
        this.userRole = res;
      } else {
        this.userRole = localStorage.getItem('userRole') || "";
      }
    });
    this.isSwitchable = localStorage.getItem('isSwitchable') || 'false';
  }

  ngOnInit() {
  }

  goBack() {history.back();}

  roleToggle(event: any) {
    if(event.detail.checked){
      this.roleStateServ.updateState('Admin');
      localStorage.setItem('userRole', 'Admin');
      // this.router.navigateByUrl('/tabs/admin-leaves');
      console.log('admin');
    } else {
      this.roleStateServ.updateState('Employee');
      localStorage.setItem('userRole', 'Employee');
      // this.router.navigateByUrl('/tabs/leaves');
      console.log('employee');
    }
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }

}
