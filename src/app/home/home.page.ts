import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})

export class HomePage implements OnInit {
navigateToUser() {
throw new Error('Method not implemented.');
}
  isRunning: boolean = false;
  stopwatchInterval: any;
  stopwatchTime: string = '00:00:00';
  buttonLabel: string = 'Clock in 00:00:00';

  constructor(private router: Router) { }

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
      this.buttonLabel = 'Clock in   00:00:00';
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

    return `\n${this.padNumber(hours)}:${this.padNumber(minutes)}:${this.padNumber(remainingSeconds)}`;
  }

  padNumber(num: number): string {
    return num.toString().padStart(2, '0');
  }

  showdirectory() {
    this.router.navigate(['./directory']);
  }

  onAddEmployeesClick() {
    this.router.navigate(['./addemp']);
  }
  showattendance(){
    this.router.navigate(['./attendance']);
  }
  showleaves(){
    this.router.navigate(['./leaves']);
  }
  showpayroll(){
    this.router.navigate(['./payroll']);
  }
  showsettings(){
    this.router.navigate(['./settings']);
  }
  showprofile(){
    this.router.navigate(['./profile']);
  }
  showhome(){
    this.router.navigate(['./home']);
  }

  
}
