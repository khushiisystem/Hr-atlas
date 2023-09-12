import { AfterContentInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { AdminService } from 'src/app/services/admin.service';
import { AddEmployeePage } from '../../../admin/add-employee/add-employee.page';
import { ShareService } from 'src/app/services/share.service';
import { Router } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { RoleStateService } from 'src/app/services/roleState.service';

interface InfiniteScrollCustomEvent extends CustomEvent {
  target: HTMLIonInfiniteScrollElement;
}

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.page.html',
  styleUrls: ['./employee-list.page.scss'],
})
export class EmployeeListPage implements OnInit, AfterContentInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
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
    private modelCtrl: ModalController,
    private shareServ: ShareService,
    public router: Router,
    private roleStateServ: RoleStateService,
  ) { }

  ngOnInit() {
    this.roleStateServ.getState().subscribe(res => {
      this.userRole = res || "";
    });
    this.getEmployeeList();
    this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue) => {
      this.searchEmployee(searchValue);
    });
  }
  
  ngAfterContentInit(): void {
    setTimeout(() => {
      this.infiniteScroll.complete();
    }, 2000);
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

  async employeeMoal(employeeItem: string, action: "add" | "edit"){
    const employeeModel = this.modelCtrl.create({
      component: AddEmployeePage,
      componentProps: {
        action: action,
        employeeId: employeeItem
      },
      mode: 'md',
      initialBreakpoint: 1
    });

    (await employeeModel).present();

    (await employeeModel).onDidDismiss().then(result => {
      if(result.data) {
        this.getEmployeeList();
      }
    });
  }

  deleteEmployee(employeeItem: any){
    this.adminServ.deleteEmployee(employeeItem).subscribe(res => {
      if(res){
        this.shareServ.presentToast('Employee deleted', 'top', 'success');
        this.pageIndex = 0;
        this.getEmployeeList();
      }
    }, (error) => {})
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

  selectEmployee(employee: string) {
    const index = this.selectedEmployee.findIndex((e: string) => e === employee);
    if(index !== -1){
      this.selectedEmployee.splice(index, 1);
    } else {
      this.selectedEmployee.push(employee);
    }
    console.log(this.selectedEmployee);
  }

  isChecked(employee: any) {
    return this.selectedEmployee.includes(employee);
  }

  goToSetup(empId: string) {
    this.router.navigate([`/tabs/payroll-setup/${empId}`]);
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
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }

  goBack(){history.back();}
}
