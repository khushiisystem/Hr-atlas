import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { AddEmployeePage } from '../admin/add-employee/add-employee.page';
import { ShareService } from '../services/share.service';
import { IEmployeeResponse } from '../interfaces/response/IEmployee';
import { RoleStateService } from '../services/roleState.service';
import { LoaderService } from '../services/loader.service';
import * as moment from 'moment';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit, AfterViewInit {
  navigateToUser() {
    throw new Error('Method not implemented.');
  }
  isRunning: boolean = false;
  stopwatchInterval: any;
  stopwatchTime: string = '00:00:00';
  buttonLabel: string = 'Clock in';
  userRole: string = "";
  userId: string = '';
  isDataLoaded: boolean = false;
  userDetails!: IEmployeeResponse;
  demoCard: any[] = [];
  clockInTime: string = '';

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private shareServ: ShareService,
    private roleStateServ: RoleStateService,
    private loader: LoaderService,
  ) {}

  ngOnInit() {
    this.roleStateServ.getState().subscribe(res => {
      this.userRole = res || "";
    });
    this.userId = localStorage.getItem("userId") || "";
    const directoryIcon = document.getElementById('directoryIcon');
    if (directoryIcon) {
      directoryIcon.addEventListener('click', this.showdirectory.bind(this));
    }
    localStorage.setItem('lastRoute', this.router.url);
    if(this.userId.trim() !== '') {
      this.getProfile();
    }
    this.demoCard.length = 12;
    this.clockInTime = localStorage.getItem('clockInTime') || "";
    if(this.clockInTime.trim() !== ''){
      this.isRunning = true;
      this.buttonLabel = "Clock Out";
      this.startWatch(this.clockInTime);
    }
  }
  ngAfterViewInit(): void {
    this.clockInTime = localStorage.getItem('clockInTime') || "";
    console.log(this.clockInTime, 'after');
  }

  getProfile(){
    this.shareServ.getEmployeeById(this.userId).subscribe(res => {
      if(res) {
        this.userDetails = res;
        this.isDataLoaded = true;
        this.roleStateServ.updateState(this.userDetails.role);
        if(this.userDetails.role === 'Employee'){
          this.getAttendance();
        }
      }
    }, (error) => {
      console.log(error);
      this.isDataLoaded = true;
    })
  }

  getAttendance(){
    this.shareServ.todayAttendance().subscribe(res => {
      if(res && !res.message) {
        this.isRunning = true;
        this.buttonLabel = 'Clock Out\t';
        const currentTime = new Date(moment(res.clockIn).format()).toISOString();
        localStorage.setItem('clockinId', res.guid);
        localStorage.setItem('clockInTime', currentTime);        
        this.startWatch(res.clockIn);
      }
    })
  }

  toggleStopwatch() {
    if (!this.isRunning) {
      this.clockIn();
    } else {
      this.clockOut();
    }
  }

  clockIn() {
    this.loader.present('');
    
    this.shareServ.clockIn().subscribe(res => {
      if(res){
        this.isRunning = true;
        this.buttonLabel = 'Clock Out\t';
        const currentTime = new Date(moment(res.clockIn).format()).toISOString();
        localStorage.setItem('clockinId', res.guid);
        localStorage.setItem('clockInTime', currentTime);
        
        this.startWatch(res.clockIn);
        this.loader.dismiss();
      }
    }, (error) => {
      this.loader.dismiss();
    });
    this.loader.dismiss();
  }

  clockOut() {
    this.loader.present('');

    // Store the clock-out time in localStorage
    const currentTime = new Date().toISOString();
    localStorage.setItem('clockOutTime', currentTime);

    clearInterval(this.stopwatchInterval);
    this.stopwatchTime = '00:00:00';

    const clockId = localStorage.getItem('clockinId');
    if(clockId){
      this.shareServ.clockOut(clockId).subscribe(res => {
        if(res){
          console.log(res);
          this.isRunning = false;
          this.buttonLabel = 'Clock In';
          this.loader.dismiss();
          localStorage.removeItem('clockinId');
        }
      }, (error) => {
        this.loader.dismiss();
      });
    }
    this.loader.dismiss();
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

  startWatch(clockIn: string | Date){
    let seconds = 0;
    // this.stopwatchTime = this.formatTime(seconds);
    
    this.stopwatchInterval = setInterval(() => {
      seconds++;
      this.stopwatchTime = this.calculateDurationAndAddSeconds(clockIn,seconds);
    }, 1000);
  }

  calculateDurationAndAddSeconds(startTime: string | Date, secondsToAdd: number): string {
    const startDate = new Date(moment(startTime).format());
    const endDate = new Date();
  
    // Calculate the time duration in milliseconds
    const durationMs = endDate.getTime() - startDate.getTime();
  
    // Add the seconds to the duration
    const updatedDurationMs = durationMs + secondsToAdd * 1000;
  
    // Create a new Date object to represent the updated duration
    const updatedDuration = new Date(updatedDurationMs);
  
    // Extract hours, minutes, and seconds from the updated duration
    const hours = updatedDuration.getUTCHours();
    const minutes = updatedDuration.getUTCMinutes();
    const seconds = updatedDuration.getUTCSeconds();
  
    // Format the result as HH:MM:SS
    const formattedResult = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
    return formattedResult;
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

  getName() {
    if(this.userDetails.lastName && this.userDetails.lastName.trim() !== ''){
      return `${this.userDetails.firstName.slice(0,1)}${this.userDetails.lastName.slice(0,1)}`;
    } else {
      return `${this.userDetails.firstName.slice(0,2)}`;
    }
  }

  showattendance() {
    this.router.navigate(['/tabs/attendance']);
  }
  showleaves() {
    if(this.userRole === 'Admin'){
      this.router.navigate(['./tabs/admin-leaves']);
    } else {
      this.router.navigate(['./tabs/leaves']);
    }
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
