import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { AddEmployeePage } from '../admin/add-employee/add-employee.page';
import { ShareService } from '../services/share.service';
import { IEmployeeResponse } from '../interfaces/response/IEmployee';
import { RoleStateService } from '../services/roleState.service';
import { LoaderService } from '../services/loader.service';
import * as moment from 'moment';
import { UserStateService } from '../services/userState.service';
import { AdminService } from '../services/admin.service';
import { AdminTutorialsPage } from '../admin/admin-tutorials/admin-tutorials.page';
import Swiper from 'swiper';
import { ILeaveLogsResponse } from '../interfaces/response/ILeave';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
})
export class Tab1Page implements OnInit, AfterViewInit {
  navigateToUser() {
    throw new Error('Method not implemented.');
  }
  @ViewChild('swiper') swiperRef!: ElementRef;
  swiper?: Swiper;
  isRunning: boolean = false;
  stopwatchInterval: any;
  stopwatchTime: string = '';
  buttonLabel: string = 'Clock in';
  userRole: string = "";
  userId: string = '';
  isDataLoaded: boolean = false;
  userDetails!: IEmployeeResponse;
  demoCard: any[] = [];
  requestedLeaveList: ILeaveLogsResponse[] = [];
  clockInTime: string = '';
  clockInId: string = '';
  isSwitchable: boolean = false;
  leaveDone: boolean = false;
  attendanceDone: boolean = false;
  moreRequests: boolean = false;

  constructor(
    private router: Router,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private alertCtrl: AlertController,
    private shareServ: ShareService,
    private authServ: AuthService,
    private adminServ: AdminService,
    private roleStateServ: RoleStateService,
    private loader: LoaderService,
    private userStateServ: UserStateService,
  ) {
    this.isSwitchable = false;
  }

  ngOnInit() {
    this.userId = localStorage.getItem("userId") || "";
    this.getStates();

    localStorage.setItem('lastRoute', this.router.url);
    this.demoCard.length = 12;
    this.swiper = new Swiper('#swiper', {
      autoplay: {delay: 3000},
      initialSlide: 0,
      loop: true,
      navigation: true,
      freeMode: {enabled: true},
      slidesPerView: 1.25,
      spaceBetween: 20,
      centeredSlides: true,
    })
  }
  ngAfterViewInit(): void {
    this.swiperReady();
  }
  swiperSlideChanged(e: any) {
    // console.log('changed: ', e);
  }
 
  swiperReady() {
    this.swiper = this.swiperRef?.nativeElement.swiper;
  }
 
  goNext() {
    this.swiper?.slideNext();
  }
 
  goPrev() {
    this.swiper?.slidePrev();
  }

  getStates(){
    this.userStateServ.getState().subscribe(res => {
      if(res){
        this.userDetails = res;

        if(res.role === 'Employee'){
          localStorage.setItem('isSwitchable', 'false');
          this.isSwitchable = false;
        } else if(res.role === 'Admin') {
          localStorage.setItem('isSwitchable', 'true');
          this.checkAdminSetups();
          this.getRequests();
          this.isSwitchable = true;
        }
        this.roleStateServ.updateState(this.userDetails.role);
        this.getAttendance();
        this.isDataLoaded = true;
      }
    });

    this.roleStateServ.getState().subscribe(res => {
      this.userRole = res || "";

      if(this.userRole === 'Admin'){
        // this.swiper = new Swiper('#swiper', {
        //   autoplay: {delay: 3000},
      // initialSlide: 0,
      // loop: true,
      // navigation: true,
      // freeMode: {enabled: true},
      // slidesPerView: 1.25,
      // spaceBetween: 20,
      // centeredSlides: true,
        // });
    //     this.swiper.addSlide(0, `<ion-card mode="md" class="">
    //   <ion-card-content>
    //     <ion-text>Please setup the leaves before to create an employee.</ion-text><br>
    //     <small><em>Settings > Calendar setup > leave Setup</em></small>
    //   </ion-card-content>
    // </ion-card>`);
    // this.swiper.appendSlide(`<ion-card mode="md" class="">
    //   <ion-card-content>
    //     <ion-text>Please setup the leaves before to create an employee.</ion-text><br>
    //     <small><em>Settings > Calendar setup > leave Setup</em></small>
    //   </ion-card-content>
    // </ion-card>`);
        // console.log(this.swiper, "swper");
        // this.swiper.autoplay.start();
      }
    });
  }

  getRequests(){
    const data = {
      status: 'Pending'
    };
    this.requestedLeaveList = []
    this.shareServ.getLeaveList(data, 0 * 3, 3).subscribe(res => {
      if(res) {
        if(res.length < 1){return;}

        for(let i=0; i < res.length; i++){
          this.requestedLeaveList.push(res[i]);
        }
        this.moreRequests = res.length > 2 ? true : false;
      }
    }, (error) => {});
  }

  getAttendance(){
    this.shareServ.todayAttendance().subscribe(res => {
      if(res && !res.message && !res[0].clockOut) {
        if(res[0].clockIn && res[0].clockIn.trim() !== '' && !res[0].clockOut){
          this.isRunning = true;
          this.buttonLabel = "Clock Out";
          this.clockInTime = res[0].clockIn;
          this.clockInId = res[0].guid;
          this.startWatch(this.clockInTime);
        }
      } if(res.message){
        this.isRunning = false;
        this.shareServ.presentToast(res.message, 'top', 'primary');
      }
    }, (error) => {
      this.isRunning = false;
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
        this.clockInTime = moment(res.clockIn).format();
        this.clockInId = res.guid;
        
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
          this.stopwatchTime = '';

          // const clockId = localStorage.getItem('clockinId');
          if(this.clockInId){
            this.shareServ.clockOut(this.clockInId).subscribe(res => {
              if(res){
                console.log(res);
                this.isRunning = false;
                this.buttonLabel = 'Clock In';
                this.loader.dismiss();
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
  // async addEmployee(){
  //   const employeeModel = this.modalCtrl.create({
  //     component: AddEmployeePage,
  //     componentProps: {
  //       action: 'add',
  //       employeeId: ""
  //     },
  //   });

  //   (await employeeModel).present();

  //   (await employeeModel).onDidDismiss().then(result => {
  //     console.log(result, "result");
  //   });
  // }

  addEmployee(){
    localStorage.setItem('lastRoute', this.router.url);
    this.router.navigate([`/tabs/add-employee/add/${null}`])
  }

  getName() {
    if(this.userDetails.lastName && this.userDetails.lastName.trim() !== ''){
      return `${this.userDetails.firstName.slice(0,1)}${this.userDetails.lastName.slice(0,1)}`;
    } else {
      return `${this.userDetails.firstName.slice(0,2)}`;
    }
  }

  async checkAdminSetups(){
    if(!this.leaveDone && !this.attendanceDone){
      this.getLleaveSetup();
    }
  }
  
  getLleaveSetup(){
    this.adminServ.getLeaveSetup().subscribe(res => {
      if(res) {
        this.leaveDone = true;
        this.getAttendanceSetups();
      } else {
        this.tutorialModal('leave');
      }
    }, (error) => {
      this.tutorialModal('leave');
    });
  }
  getAttendanceSetups(){
    this.adminServ.getAttendanceSetup().subscribe(async res => {
      if(!res) {
        this.tutorialModal('attendance');
      }
    }, (error) => {
      this.tutorialModal('attendance');
    });
  }

  instructionsClosed(event: any){
    console.log(event, "popover");
  }

  async tutorialModal(setup: 'leave' | 'attendance') {
    const tutorialPopover = this.popoverCtrl.create({
      component: AdminTutorialsPage,
      cssClass: 'tutorialPopover',
      mode: 'md',
      side: 'end',
      size: 'auto',
      id: 'tutorialAdmin',
      backdropDismiss: false,
      componentProps: {setupName: setup}
    });

    (await tutorialPopover).present();

    (await tutorialPopover).onDidDismiss().then(result => {
      switch (result.data) {
        case 'leaveDone':
          this.leaveDone = true;
          this.getAttendanceSetups();
          break;

        case 'attendanceDone':
          this.attendanceDone = true;
          // this.getAttendanceSetups()
          break;
      
        default:
          break;
      }
    });
    // const tutorialDialog = this.modalCtrl.create({
    //   component: AdminTutorialsPage,
    //   backdropDismiss: false,
    //   mode: 'md',
    //   cssClass: 'tutorialDialog',
    //   componentProps: {setupName: setup}
    // });

    // (await tutorialDialog).present();
    // (await tutorialDialog).onDidDismiss().then(result => {
    //   switch (result.data) {
    //     case 'leaveDone':
    //       this.leaveDone = true;
    //       this.getAttendanceSetups()
    //       break;

    //     case 'attendaceDone':
    //       this.attendanceDone = true;
    //       this.getAttendanceSetups()
    //       break;
      
    //     default:
    //       break;
    //   }
    // });
  }

  leaveApprovel(leaveId: string, approvel: boolean){
    this.loader.present('');
    const leaveData = {
      leaveGuid: leaveId,
      aproveLeave: approvel
    }
    this.adminServ.leaveApprove(leaveData).subscribe(res => {
      if(res){
        if(res.Message){
          this.shareServ.presentToast(res.Message, 'top', 'success');
        } else {
          this.shareServ.presentToast('Responded', 'top', 'success');
        }
        this.loader.dismiss();
        this.getRequests();
      }
    }, (error) => {
      this.shareServ.presentToast(error.error.message, 'top', 'danger');
      this.loader.dismiss();
    })
  }

  roleToggle(event: any) {
    if(event.detail.checked){
      this.roleStateServ.updateState('Admin');
      localStorage.setItem('userRole', 'Admin');
    } else {
      this.roleStateServ.updateState('Employee');
      localStorage.setItem('userRole', 'Employee');
    }
  }

  showleaves() {
    this.router.navigate(['/tabs/leaves']);
  }
  showAllLeaves() {
    this.router.navigateByUrl('/tabs/leaves', {state: {tab: 'requests'}});
  }
  attendancePage(){
    if(this.userRole === 'Employee'){
      this.router.navigate(['/tabs/attendance']);
    } else if(this.userRole === 'Admin'){
      this.router.navigate(['/tabs/attendance-status']);
    }
  }
  viewPayroll(){
    if(this.userRole === 'Employee'){
      this.router.navigate(['/tabs/payroll/'+this.userId]);
    } else if(this.userRole === 'Admin'){
      this.router.navigate(['/tabs/payroll-setup']);
    }
  }
  showprofile() {
    if(this.userRole === 'Employee'){
      this.router.navigate(['/tabs/profile']);
    } else if(this.userRole === 'Admin'){
      this.router.navigate(['/tabs/admin-profile']);
    }
  }
  showhome() {
    this.router.navigate(['./home']);
  }

  logout() {this.authServ.signOut();}
}
