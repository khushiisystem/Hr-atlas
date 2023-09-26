import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { AddEmployeePage } from '../admin/add-employee/add-employee.page';
import { ShareService } from '../services/share.service';
import { IEmployeeResponse } from '../interfaces/response/IEmployee';
import { RoleStateService } from '../services/roleState.service';
import { LoaderService } from '../services/loader.service';
import * as moment from 'moment';
import { UserStateService } from '../services/userState.service';

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
  isSwitchable: string = '';

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private shareServ: ShareService,
    private roleStateServ: RoleStateService,
    private loader: LoaderService,
    private userStateServ: UserStateService,
  ) {
    this.isSwitchable = localStorage.getItem('isSwitchable') || 'false';
  }

  ngOnInit() {
    this.userId = localStorage.getItem("userId") || "";
    this.getStates();
    localStorage.setItem('lastRoute', this.router.url);
    this.demoCard.length = 12;
    this.clockInTime = localStorage.getItem('clockInTime') || "";
    const clockOutTime = localStorage.getItem('clockOutTime') || "";
    if(this.clockInTime.trim() !== '' && !clockOutTime){
      this.isRunning = true;
      this.buttonLabel = "Clock Out";
      this.startWatch(this.clockInTime);
    }
  }
  ngAfterViewInit(): void {
    this.clockInTime = localStorage.getItem('clockInTime') || "";
  }

  getStates(){
    this.userStateServ.getState().subscribe(res => {
      if(res){
        this.userDetails = res;

        if(res.role === 'Employee'){
          localStorage.setItem('isSwitchable', 'false');
        } else {
          localStorage.setItem('isSwitchable', 'true');
        }
        this.roleStateServ.updateState(this.userDetails.role);
        this.getAttendance();
        this.isDataLoaded = true;
      }
    });

    this.roleStateServ.getState().subscribe(res => {
      console.log(this.userRole);
      this.userRole = res || "";
    });
  }

  getAttendance(){
    this.shareServ.todayAttendance().subscribe(res => {
      if(res && !res.message && !res.clockOut) {
        this.isRunning = true;
        this.buttonLabel = 'Clock Out\t';
        const currentTime = new Date(moment(res.clockIn).format()).toISOString();
        localStorage.setItem('clockinId', res.guid);
        localStorage.setItem('clockInTime', currentTime);
        if(res.clockOut){
          const outTime = new Date(moment(res.clockOut).format()).toISOString();
          localStorage.setItem('clockOutTime', outTime);
        }
        if(res.clockIn.trim() !== '' && !res.clockOut){
          this.isRunning = true;
          this.buttonLabel = "Clock Out";
          this.startWatch(this.clockInTime);
        }
      }
    }, (error) => {
      console.log(error, 'err');
    });
  }

  toggleStopwatch() {
    !this.isRunning ? this.clockIn() : this.clockOut();
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
      this.shareServ.presentToast(error.error.Message, 'top', 'danger')
      this.loader.dismiss();
    });
  }

  async clockOut(){
    const clockOutAlert = await this.alertCtrl.create({
      header: 'Clock out',
      subHeader: 'Are you sure, you want to clock out?',
      mode: 'md',
      buttons: [{
        text: 'No',
        role: 'cancel',
        cssClass: 'cancelBtn',
        handler: () => {}
      },{
        text: 'Yes',
        role: 'confirm',
        cssClass: 'deleteBtn',
        handler: () => {
          this.loader.present('');

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
                localStorage.removeItem('clockOutTime');
                localStorage.removeItem('clockInTime');
              }
            }, (error) => {
              this.loader.dismiss();
            });
          }
          this.loader.dismiss();
        }
      },]
    });

    await clockOutAlert.present();
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
    this.stopwatchInterval = setInterval(() => {
      this.stopwatchTime = this.calculateDurationAndAddSeconds(clockIn,1);
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

  roleToggle(event: any) {
    console.log(event, 'event');
    if(event.detail.checked){
      this.roleStateServ.updateState('Admin');
      localStorage.setItem('userRole', 'Admin');
    } else {
      this.roleStateServ.updateState('Employee');
      localStorage.setItem('userRole', 'Employee');
    }
  }

  showattendance() {
    this.router.navigate(['/tabs/attendance']);
  }
  showleaves() {
    this.router.navigate(['./tabs/leaves']);
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
