import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AttendanceSetupPage } from 'src/app/admin/attendance-setup/attendance-setup.page';
import { LeaveSetupPage } from 'src/app/admin/leave-setup/leave-setup.page';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  constructor(
    private router: Router,
    private modalCtrl: ModalController,
  ) { }
 

  ngOnInit() {
  }
  
  goBack() {
    localStorage.setItem('lastRoute', 'home');
    history.back();
  }

  async attendanceSetup(){
    const attendanceModal = this.modalCtrl.create({
      component: AttendanceSetupPage,
      initialBreakpoint: 1,
      mode: 'md',
      componentProps: {}
    });

    (await attendanceModal).present();

    (await attendanceModal).onDidDismiss().then(result => {
      console.log(result);
    });
  }

  async leaveSetupModal(){
    const leaveModal = this.modalCtrl.create({
      component: LeaveSetupPage,
      mode: 'md',
      initialBreakpoint: 1
    });

    (await leaveModal).present();

    (await leaveModal).onDidDismiss().then(result => {
      console.log(result, "result");
    });
  }

  payrollSetup(){
    localStorage.setItem('lastRoute', 'setting');
    this.router.navigate(['/tabs/employee-list']);
  }
  
  goToPage4(){
    localStorage.setItem('lastRoute', 'setting');
    this.router.navigate(['./additional-setup']);

  }
 
}
