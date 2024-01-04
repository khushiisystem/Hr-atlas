import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AttendanceSetupPage } from 'src/app/admin/attendance-setup/attendance-setup.page';
import { HollydaySetupPage } from 'src/app/admin/hollyday-setup/hollyday-setup.page';
import { LeaveSetupPage } from 'src/app/admin/leave-setup/leave-setup.page';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  activeTab: string = '';
  constructor(
    private router: Router,
    private modalCtrl: ModalController,
  ) { }
 

  ngOnInit() {
  }
  
  goBack() {
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
    this.router.navigate(['/tabs/payroll-setup']);
  }
  
  additionalsetup(){
    localStorage.setItem('lastRoute', this.router.url);
    this.router.navigate(['/tabs/additional-setup']);
  }
  
  salarysetup(){
    this.router.navigate(['/tabs/salary']);
  }
  addEmployee(){
    localStorage.setItem('lastRoute', this.router.url);
    this.router.navigate([`/tabs/add-employee/add/${null}`])
  }

  accordionChange(event: CustomEvent){
    if(event.detail.value){
      this.activeTab = event.detail.value;
    }
  }

  async hollydaySetup() {
    const eventModal = this.modalCtrl.create({
      component: HollydaySetupPage,
      mode: 'md',
      initialBreakpoint: 1,
      componentProps: {action: 'add'}
    });

    (await eventModal).present();

    (await eventModal).onDidDismiss().then(result => {
      if(result && result.role === 'confirm'){
        console.log(result);
      }
    });
  }

  ionViewWillLeave(){
    this.activeTab = '';
  }
 
}
