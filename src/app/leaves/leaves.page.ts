import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-leaves',
  templateUrl: './leaves.page.html',
  styleUrls: ['./leaves.page.scss'],
})
export class LeavesPage {
  selectedDates: string[] = [];
  toggleChecked: boolean = false;
  showApplyForm: boolean = false;
  showApplyFormForCasualLeave: boolean = false;
  showApplyFormForLossOfPay: boolean = false;
  startDate!: string;
  endDate!: string;
  leaveType!: string;
  purpose!: string; 
  applyCardTitle: string = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.selectedDates = history.state.selectedDates || [];
  }

  gooooooBack() {
    this.router.navigate(['./home']);
  }

  goback() {
    this.router.navigate(['./logs']);
  }

  toggleChanged() {
    if (this.toggleChecked) {
      this.router.navigate(['./leaves']);
    } else {
      this.router.navigate(['./leaveadmin']);
    }
  }

  calculateCreditedLeaves(): number {
  
    return this.getMonthNumber() * 1.5;
  }

  getAppliedLeaves(): number {
    
    return 5;
  }

  getPenalty(): number {
    
    return 2;
  }

  getCreditedData(): string {
  
    return '365';
  }

  getCreditedDataForLossOfPay(): string {
  
    return '365';
  }

  getAppliedDataForLossOfPay(): string {
  
    return '10';
  }

  getPenaltyForLossOfPay(): number {
    
    return 2;
  }

  openApplyCard(cardTitle: string) {
    this.showApplyForm = true;
    this.applyCardTitle = cardTitle;
    this.startDate = '';
    this.endDate = '';
    this.leaveType = 'fullDay';

    if (cardTitle === 'Casual Leave') {
      this.showApplyFormForCasualLeave = true;
      this.showApplyFormForLossOfPay = false;
    } else if (cardTitle === 'Loss of Pay') {
      this.showApplyFormForLossOfPay = true;
      this.showApplyFormForCasualLeave = false;
    }
  }

  submitLeave() {
    
    this.showApplyForm = false;
    this.startDate = '';
    this.endDate = '';
    this.leaveType = 'fullDay';
    this.purpose = ''; 
    this.showApplyFormForCasualLeave = false;
    this.showApplyFormForLossOfPay = false;
  }

  private getMonthNumber(): number {
    const currentDate = new Date();
    return currentDate.getMonth() + 1; 
  }

  getToday(): string {
    const today = new Date();
    return today.toISOString(); 
  }
}
