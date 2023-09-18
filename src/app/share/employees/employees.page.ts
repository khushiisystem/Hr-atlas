import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { IonInfiniteScroll } from '@ionic/angular';
import { Subject, debounceTime } from 'rxjs';
import { IRoles } from 'src/app/interfaces/enums/IRoles';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { AdminService } from 'src/app/services/admin.service';
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
  selector: 'app-employees',
  templateUrl: './employees.page.html',
  styleUrls: ['./employees.page.scss'],
})
export class EmployeesPage implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  @Input() isChecklist: boolean = false;
  @Output() employee: EventEmitter<IEmpSelect> = new EventEmitter<IEmpSelect>();
  employeeList: IEmployeeResponse[] = [];
  isDataLoaded: boolean = false;
  isMoreData: boolean = true;
  pageIndex: number = 0;
  userRole: string = "";
  searchString: string = "";
  selectedEmployee: any[] = [];
  private searchSubject = new Subject<string>();
  private readonly debounceTimeMs = 3000;

  constructor(
    private adminServ: AdminService,
    private shareServ: ShareService,
  ) { this.userRole = localStorage.getItem('userRole') || ''; }

  ngOnInit() {
    this.getEmployeeList();
    this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue) => {
      this.searchEmployee(searchValue);
    });
  }

  getEmployeeList(){
    this.isDataLoaded = false;
    if(this.pageIndex < 1){
      this.employeeList = [];
    }
    this.adminServ.getEmployees(this.pageIndex * 10, 10).subscribe(res => {
      if(res){
        const data: IEmployeeResponse[] = res;
        for(let i=0; i<data.length; i++){
          this.employeeList.push(res[i]);
        }
        
        this.isMoreData = res.length > 9;
        this.infiniteScroll.complete();
        this.isDataLoaded = true;
      }
    }, (error) => {
      this.isMoreData = false;
      this.isDataLoaded = true;
      this.infiniteScroll.complete();
    });
  }

  loadData(event: any){
    if (this.isMoreData) {
      this.pageIndex++;
      this.getEmployeeList();
    }
  }

  selectAll(event: CustomEvent) {
    if(event.detail.checked === true){
      this.employeeList.forEach((e: IEmployeeResponse, index) => {
        if(!this.selectedEmployee.includes(e.guid)){
          this.selectedEmployee.push(e.guid);
        }
      });
    } else if(event.detail.checked === false) {
      this.selectedEmployee = [];
    }
    console.log(this.selectedEmployee);
  }

  checkEmployee(employee: string) {
    if(this.isChecklist){
      const index = this.selectedEmployee.findIndex((e: string) => e === employee);
      if(index !== -1){
        this.selectedEmployee.splice(index, 1);
      } else {
        this.selectedEmployee.push(employee);
      }
      console.log(this.selectedEmployee);
    }
  }

  isChecked(employee: any) {
    return this.selectedEmployee.includes(employee);
  }

  selectEmployee(empData: IEmpSelect){
    this.employee.emit(empData);
  }

  searchEmployee(searchValue: string){
    if(searchValue.trim().length > 3){
      this.isDataLoaded = false;
      const data = {
        searchString: searchValue
      }
      this.employeeList = [];
      this.shareServ.searchEmployee(data).subscribe(res => {
        if(res){
          this.employeeList = res;
          this.isDataLoaded = true;
        }
      }, (error) => {
        console.log(error, "search error");
        this.isDataLoaded = true;
      });
    } else {
      this.getEmployeeList();
    }
  }

  getName(employee: IEmployeeResponse) {
    if(employee.lastName && employee.lastName.trim() !== ''){
      return `${employee.firstName.slice(0,1)}${employee.lastName.slice(0,1)}`;
    } else {
      return `${employee.firstName.slice(0,2)}`;
    }
  }

  onSearch() {
    this.searchSubject.next(this.searchString);
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
    this.selectedEmployee = [];
    this.searchString = '';
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }
}
