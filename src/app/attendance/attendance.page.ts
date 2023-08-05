import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
})
export class AttendancePage implements OnInit {
  toggleChecked: boolean = false;
  selectedDate!: Date;
  weeks: string[] = []; // Array to store the weeks
  attendanceDataList: AttendanceData[] = []; // Array to store attendance data

  constructor(private router: Router) {}

  ngOnInit() {
    this.generateWeeks(); 
    this.initializeAttendanceData(); 
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

  onDateSelected() {
   
    console.log('Selected Date:', this.selectedDate);
  }

  generateWeeks() {
    
    const startDate = new Date(); 
    const endDate = new Date();

    while (startDate <= endDate) {
      const week = startDate.toISOString().slice(0, 10); 
      this.weeks.push(week);
      startDate.setDate(startDate.getDate() + 7); 
    }
  }

  initializeAttendanceData() {
   
    this.attendanceDataList = [
      { name: 'nikhil', status: 'absent' },
      { name: 'xyz', status: 'absent' },
      { name: '', status: 'present' },
    ];
  }

  onStatusChange(attendanceData: AttendanceData) {
    
    console.log('Status changed:', attendanceData.status);
  }
}

interface AttendanceData {
  name: string;
  status: 'present' | 'absent' | 'leave';
}
