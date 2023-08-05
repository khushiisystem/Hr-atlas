import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-attendance-setup',
  templateUrl: './attendance-setup.page.html',
  styleUrls: ['./attendance-setup.page.scss'],
})
export class AttendanceSetupPage implements OnInit {

    currentDate!: string;
    clockInTime!: string;
    clockOutTime!: string;
    workDuration!: string;
    toggleChecked: boolean = true;
    att: 'absent' | 'present' = 'absent';
    gracePeriod!: string;
  
    constructor(private router: Router) { }
  
    ngOnInit() {
      const now = new Date();
      this.currentDate = `${this.padNumber(now.getDate())}/${this.padNumber(now.getMonth() + 1)}/${now.getFullYear().toString().substr(-2)}`;
      this.clockInTime = localStorage.getItem('clockInTime') || '';
      this.clockOutTime = localStorage.getItem('clockOutTime') || '';
      this.calculateWorkDuration();
     
    }
    calculategrace(){
      const startTime = new Date(this.clockInTime);
        const endTime = new Date(this.clockOutTime);
        const duration = startTime.getTime() - endTime.getTime();
    }
    
  
    calculateWorkDuration() {
      if (this.clockInTime && this.clockOutTime) {
        const startTime = new Date(this.clockInTime);
        const endTime = new Date(this.clockOutTime);
        const duration = startTime.getTime() - endTime.getTime();
        const hours = Math.floor(duration / 3600000);
        const minutes = Math.floor((duration % 3600000) / 60000);
        const seconds = Math.floor((duration % 60000) / 1000);
  
        this.workDuration = `${this.padNumber(hours)}:${this.padNumber(minutes)} `;
      } else {
        this.workDuration = '00:00';
      }
    }
  
    padNumber(num: number): string {
      return num.toString().padStart(2, '0');
    }
  
    goBack() {
      this.router.navigate(['./home']);
    }
  
    toggleChanged() {
      if (this.toggleChecked) {
        this.router.navigate(['./user']);
      } else {
        this.router.navigate(['./attendance']);
      }
    }
  
    
  
    clockIn() {
      const now = new Date();
      this.clockInTime = now.toISOString();
      localStorage.setItem('clockInTime', this.clockInTime);
     

    }
  
    clockOut() {
      const now = new Date();
      this.clockOutTime = now.toISOString();
      localStorage.setItem('clockOutTime', this.clockOutTime);
      this.calculateWorkDuration();
      
    }
  
    
    }
  
  