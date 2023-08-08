import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface LeaveRequest {
  title: string;
  startDate: string;
  endDate: string;
  leaveType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
}

@Component({
  selector: 'app-leaveadmin',
  templateUrl: './leaveadmin.page.html',
  styleUrls: ['./leaveadmin.page.scss'],
})
export class LeaveadminPage implements OnInit {
  selectedDates: string[] = [];
  toggleChecked: boolean = false;
  leaveRequests: LeaveRequest[] = []; // Array to store leave requests

  constructor(private router: Router) { }

  ngOnInit() {
    this.selectedDates = history.state.selectedDates || [];

    // Example data, you should replace this with your API call to get the actual leave requests
    this.leaveRequests = [
      {
        title: 'Leave Request 1',
        startDate: '2023-07-16',
        endDate: '2023-07-18',
        leaveType: 'Full Day',
        status: 'PENDING',
      },
      {
        title: 'Leave Request 2',
        startDate: '2023-07-20',
        endDate: '2023-07-22',
        leaveType: 'First Half',
        status: 'PENDING',
      },
      
    ];
  }

  gooooooBack() {
    this.router.navigate(['./home']);
  }

  goback() {
    this.router.navigate(['./logs']);
  }

  toggleChanged() {
    if (this.toggleChecked) {
      this.router.navigate(['./leaveadmin']);
    } else {
      this.router.navigate(['./leaves']);
    }
  }

  approveLeave(leaveRequest: LeaveRequest) {
    // Implement logic to approve the leave request
    leaveRequest.status = 'APPROVED';
  }

  rejectLeave(leaveRequest: LeaveRequest) {
    // Implement logic to reject the leave request
    leaveRequest.status = 'REJECTED';
    leaveRequest.rejectionReason = ''; // Clear the rejection reason field when rejected
  }
}
