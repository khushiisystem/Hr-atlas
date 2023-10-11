import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonInfiniteScroll, ModalController, NavController } from '@ionic/angular';
import { Subject, debounceTime } from 'rxjs';
import { AddEmployeePage } from 'src/app/admin/add-employee/add-employee.page';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { AdminService } from 'src/app/services/admin.service';
import { RoleStateService } from 'src/app/services/roleState.service';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.page.html',
  styleUrls: ['./directory.page.scss'],
})
export class DirectoryPage implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  employeeList: IEmployeeResponse[] = [];
  isDataLoaded: boolean = false;
  isMoreData: boolean = true;
  pageIndex: number = 0;
  lastRoute: string = "";
  userRole: string = "";
  searchString: string = "";
  selectedEmployee: any[] = [];
  private searchSubject = new Subject<string>();
  private readonly debounceTimeMs = 2000;
  userId: string = '';
  isHold: boolean = false;

  constructor(
    private adminServ: AdminService,
    private modelCtrl: ModalController,
    private alertCtrl: AlertController,
    private shareServ: ShareService,
    public router: Router,
    private roleStateServ: RoleStateService,
  ) { this.userId = localStorage.getItem("userId") || ''; }

  ngOnInit() {}

  ionViewWillEnter(){
    this.roleStateServ.getState().subscribe(res => {
      this.userRole = res || "";
    });
    this.lastRoute = localStorage.getItem('lastRoute') || "";
    this.isDataLoaded = false;
    this.getEmployeeList();
    this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue) => {
      this.searchEmployee(searchValue);
    });
  }

  getEmployeeList(){
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
      this.isHold = false;
      console.log(this.isHold);
    }, (error) => {
      this.isMoreData = false;
      this.isDataLoaded = true;
      this.isHold = false;
      this.infiniteScroll.complete();
    });
  }

  loadData(event: any){
    if (this.isMoreData) {
      this.pageIndex++;
      this.getEmployeeList();
    }
  }

  async employeeMoal(employeeItem: string | null, action: "add" | "edit"){
    // const employeeModel = this.modelCtrl.create({
    //   component: AddEmployeePage,
    //   componentProps: {
    //     action: action,
    //     employeeId: employeeItem
    //   },
    //   mode: 'md',
    //   initialBreakpoint: 1
    // });

    // (await employeeModel).present();

    // (await employeeModel).onDidDismiss().then(result => {
    //   if(result.data) {
    //     this.getEmployeeList();
    //   }
    // });
    localStorage.setItem('lastRoute', this.router.url);
    this.router.navigate([`/tabs/add-employee/${action}/${employeeItem}`]);
  }

  async deleteEmployee(employeeItem: any){
    const deleteCtrl = await this.alertCtrl.create({
      header: 'Delete',
      subHeader: 'Are you sure, you want to delete this employee?',
      mode: 'md',
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'cancelBtn',
        handler: () => {}
      },{
        text: 'Delete',
        role: 'confirm',
        cssClass: 'deleteBtn',
        handler: () => {
          this.adminServ.deleteEmployee(employeeItem).subscribe(res => {
            if(res){
              this.shareServ.presentToast('Employee deleted', 'top', 'success');
              this.pageIndex = 0;
              this.getEmployeeList();
            }
          }, (error) => {console.log(error.error)});
        }
      },]
    });

    await deleteCtrl.present();
  }

  viewProfile(empId: string) {
    this.searchString = "";
    this.searchSubject.complete();
    if(this.lastRoute === '/tabs/settings'){
      this.router.navigate([`/tabs/payroll-setup/${empId}`]);
    } else {
      this.router.navigateByUrl(`/tabs/employee-profile/${empId}`);
    }
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
        this.isHold = false;
      }, (error) => {
        this.isDataLoaded = true;
        this.isHold = false;
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
    this.isHold = true;
    this.searchSubject.next(this.searchString);
  }
  checkEmpty(){
    if(this.searchString === ''){this.isHold = true;}
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
