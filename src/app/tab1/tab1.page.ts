import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AddEmployeePage } from '../admin/add-employee/add-employee.page';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit {
  navigateToUser() {
    throw new Error('Method not implemented.');
  }
  isRunning: boolean = false;
  stopwatchInterval: any;
  stopwatchTime: string = '00:00:00';
  buttonLabel: string = 'Clock in';
  userRole: string = "Employee";

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
  ) {}

  ngOnInit() {
    const directoryIcon = document.getElementById('directoryIcon');
    if (directoryIcon) {
      directoryIcon.addEventListener('click', this.showdirectory.bind(this));
    }
  }

  toggleStopwatch() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.buttonLabel = 'Clock out\t';
      this.clockIn();
    } else {
      this.isRunning = false;
      this.buttonLabel = 'Clock in';
      this.clockOut();
    }
  }

  clockIn() {
    // Store the clock-in time in localStorage
    const currentTime = new Date().toISOString();
    localStorage.setItem('clockInTime', currentTime);

    let seconds = 0;
    this.stopwatchTime = this.formatTime(seconds);

    this.stopwatchInterval = setInterval(() => {
      seconds++;
      this.stopwatchTime = this.formatTime(seconds);
    }, 1000);
  }

  clockOut() {
    // Store the clock-out time in localStorage
    const currentTime = new Date().toISOString();
    localStorage.setItem('clockOutTime', currentTime);

    clearInterval(this.stopwatchInterval);
    this.stopwatchTime = '00:00:00';
  }

  formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    return `\n${this.padNumber(hours)}:${this.padNumber(
      minutes
    )}:${this.padNumber(remainingSeconds)}`;
  }

  padNumber(num: number): string {
    return num.toString().padStart(2, '0');
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }

  showdirectory() {
    this.router.navigate(['./directory']);
  }

  async addEmployee(){
    const employeeModel = this.modalCtrl.create({
      component: AddEmployeePage,
      componentProps: {
        action: 'add',
        employeeId: ""
      },
    });

    (await employeeModel).present();

    (await employeeModel).onDidDismiss().then(result => {
      console.log(result, "result");
    });
  }

  showattendance() {
    this.router.navigate(['./attendance']);
  }
  showleaves() {
    this.router.navigate(['./leaves']);
  }
  showpayroll() {
    this.router.navigate(['./payroll']);
  }
  showsettings() {
    this.router.navigate(['./settings']);
  }
  showprofile() {
    this.router.navigate(['./profile']);
  }
  showhome() {
    this.router.navigate(['./home']);
  }
}
