import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { IonInfiniteScroll, IonToggle } from '@ionic/angular';
import { Subject, debounceTime } from 'rxjs';
import { IRoles } from 'src/app/interfaces/enums/IRoles';
import { AttendaceStatus } from 'src/app/interfaces/enums/leaveCreditPeriod';
import { IClockInResponce } from 'src/app/interfaces/response/IAttendanceSetup';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { RoleStateService } from 'src/app/services/roleState.service';
import { ShareService } from 'src/app/services/share.service';

interface InfiniteScrollCustomEvent extends CustomEvent {
  target: HTMLIonInfiniteScrollElement;
}

export interface IEmpSelect {
  firstName: string;
  lastName: string;
  role: IRoles;
  employeeId: string;
  guid: string;
}

@Component({
  selector: 'app-attendance-status',
  templateUrl: './attendance-status.page.html',
  styleUrls: ['./attendance-status.page.scss'],
})
export class AttendanceStatusPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  @ViewChild(IonToggle) roleToggle!: IonToggle;
  @Output() employee: EventEmitter<IEmpSelect> = new EventEmitter<IEmpSelect>();
  employeeList: IEmployeeResponse[] = [];
  attendanceList: IClockInResponce[] = [];
  isDataLoaded: boolean = false;
  isMoreData: boolean = true;
  openCalendar: boolean = false;
  attendanceLoaded: boolean = false;
  pageIndex: number = 0;
  searchString: string = "";
  selectedEmployee: any[] = [];
  attendanceDate: Date = new Date();
  today: Date = new Date();
  userRole: string = 'Admin';

  constructor(
    private adminServ: AdminService,
    private router: Router,
  ) { }
  
  ngOnInit() {
    this.today.setFullYear(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
    this.attendanceDate = this.today;
    this.getEmployeeList();
  }

  ionViewWillEnter(){
    this.roleToggle.checked = this.userRole === 'Admin' ? true : false;
  }

  getEmployeeList(){
    this.isDataLoaded = false;
    if(this.pageIndex < 1){
      this.employeeList = [];
    }
    this.adminServ.getEmployees(this.pageIndex * 30, 30).subscribe(res => {
      if(res){
        const data: IEmployeeResponse[] = res;
        for(let i=0; i<data.length; i++){
          this.employeeList.push(res[i]);
        }
        this.isMoreData = res.length > 29;
      }
      this.getTodayAttendance(this.today.toISOString());
    }, (error) => {
      this.isMoreData = false;
      this.isDataLoaded = true;
      this.infiniteScroll.complete();
    });
  }

  getTodayAttendance(dateStr: string) {
    this.attendanceLoaded = false;
    this.adminServ.getDailyAttendance(dateStr, this.pageIndex * 60, 60).subscribe(res => {
      if(res.length < 1){
        this.isDataLoaded = true;
        this.attendanceLoaded = true;
        return;
      } else {
        this.attendanceList = [...this.attendanceList, ...res];
        console.log(this.attendanceList, 'list');
        this.isDataLoaded = true;
        this.attendanceLoaded = true;
      }
    }, (error) => {
      this.isDataLoaded = true;
      this.attendanceLoaded = true;
    });
  }

  loadData(event: InfiniteScrollCustomEvent){
    if (this.isMoreData) {
      this.pageIndex++;
      this.getEmployeeList();
    } else {
      this.infiniteScroll.complete();
    }
  }

  getName(employee: IEmployeeResponse) {
    if(employee.lastName && employee.lastName.trim() !== ''){
      return `${employee.firstName.slice(0,1)}`;
    } else {
      return `${employee.firstName.slice(0,1)}`;
    }
  }

  getStatus(empId: string){
    let status: AttendaceStatus = AttendaceStatus.ABSENT;
    if(this.attendanceList.length < 1){
      return AttendaceStatus.ABSENT;
    } else {
      this.attendanceList.forEach((item) => {
        if(item.employeeId === empId){
          status = item.status;
        }
      });
    }
    return status;
  }

  selectEmployee(empData: IEmployeeResponse){
    const data: IEmpSelect = {
      employeeId: empData.employeeId,
      guid: empData.guid,
      firstName: empData.firstName,
      lastName: empData.lastName,
      role: empData.role,
    }
    this.employee.emit(empData);
    let navExtra: NavigationExtras = {
      queryParams : data
    }
    this.router.navigate([`tabs/employee-attendance`], navExtra);
  }

  selectAttendanceDate(event: any){
    if(event.detail.value){
      this.attendanceDate = new Date(event.detail.value);
      this.getTodayAttendance(this.attendanceDate.toISOString());
    }
  }
  selectDate(event: Date){
    this.attendanceList = [];
    this.getTodayAttendance(event.toISOString());
  }

  ngOnDestroy(): void {
    this.selectedEmployee = [];
    this.attendanceList = [];
  }

  goBack() {history.back();}

}
