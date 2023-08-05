import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.page.html',
  styleUrls: ['./user.page.scss'],
})
export class UserPage implements OnInit {
  currentDate!: string;
  clockInTime!: string;
  clockOutTime!: string;
  workDuration!: string;
  toggleChecked: boolean = true;
  att: 'absent' | 'present' = 'absent';

  constructor(private router: Router) { }

  ngOnInit() {
    const now = new Date();
    this.currentDate = `${this.padNumber(now.getDate())}/${this.padNumber(now.getMonth() + 1)}/${now.getFullYear().toString().substr(-2)}`;
    this.clockInTime = localStorage.getItem('clockInTime') || '';
    this.clockOutTime = localStorage.getItem('clockOutTime') || '';
    this.calculateWorkDuration();
    this.findpre();
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

  gooooooBack() {
    this.router.navigate(['./home']);
  }

  toggleChanged() {
    if (this.toggleChecked) {
      this.router.navigate(['./user']);
    } else {
      this.router.navigate(['./attendance']);
    }
  }

  findpre() {
    if (this.clockInTime !== '') {
      this.att = 'present';
    } else {
      this.att = 'absent';
    }
  }

  clockIn() {
    const now = new Date();
    this.clockInTime = now.toISOString();
    localStorage.setItem('clockInTime', this.clockInTime);
    this.findpre();
  }

  clockOut() {
    const now = new Date();
    this.clockOutTime = now.toISOString();
    localStorage.setItem('clockOutTime', this.clockOutTime);
    this.calculateWorkDuration();
    this.findpre();
  }

  requestLeave() {
    const promptMessage = 'Enter reason for leave:';
    const reason = prompt(promptMessage);
    if (reason) {
      const leaveRequest = {
        date: this.currentDate,
        reason: reason
      };
      const leaveRequests = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
      leaveRequests.push(leaveRequest);
      localStorage.setItem('leaveRequests', JSON.stringify(leaveRequests));
    }
  }
}
