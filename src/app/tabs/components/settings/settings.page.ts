import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AttendanceSetupPage } from '../attendance-setup/attendance-setup.page';

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
  
  goBack() {history.back();}

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
  goToPage2(){
    this.router.navigate(['./leave-setup']);

  }
  goToPage3(){
    this.router.navigate(['./payroll-setup']);

  }
  goToPage4(){
    this.router.navigate(['./additional-setup']);

  }
 
}
