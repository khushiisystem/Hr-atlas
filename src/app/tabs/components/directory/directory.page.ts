import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import {
  AlertController,
  IonInfiniteScroll,
  ModalController,
  NavController,
} from "@ionic/angular";
import { Subject, debounceTime } from "rxjs";
import { AddEmployeePage } from "src/app/admin/add-employee/add-employee.page";
import { EmployeeFilter } from "src/app/interfaces/enums/leaveCreditPeriod";
import { IEmployeeResponse } from "src/app/interfaces/response/IEmployee";
import { AdminService } from "src/app/services/admin.service";
import { RoleStateService } from "src/app/services/roleState.service";
import { ShareService } from "src/app/services/share.service";

@Component({
  selector: "app-directory",
  templateUrl: "./directory.page.html",
  styleUrls: ["./directory.page.scss"],
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
  private readonly debounceTimeMs = 1500;
  userId: string = "";
  isHold: boolean = false;
  empType: "All" | "Active" | "InActive" | "Resigned" = "Active";

  constructor(
    private adminServ: AdminService,
    private modelCtrl: ModalController,
    private alertCtrl: AlertController,
    private shareServ: ShareService,
    public router: Router,
    private roleStateServ: RoleStateService
  ) {
    this.userId = localStorage.getItem("userId") || "";
  }

  ngOnInit() {}

  ionViewWillEnter() {
    this.roleStateServ.getState().subscribe((res) => {
      this.userRole = res || "";
    });
    this.lastRoute = localStorage.getItem("lastRoute") || "";
    this.isDataLoaded = false;
    this.pageIndex = 0;
    this.getEmployeeList();
    this.searchSubject
      .pipe(debounceTime(this.debounceTimeMs))
      .subscribe((searchValue) => {
        this.searchEmployee(searchValue);
      });
  }

  getEmployeeList() {
    if (this.pageIndex < 1) {
      this.employeeList = [];
    }
    this.adminServ
      .getEmployees(this.empType, this.pageIndex * 10, 10)
      .subscribe(
        (res) => {
          if (res) {
            const data: IEmployeeResponse[] = res;
            for (let i = 0; i < data.length; i++) {
              if (!this.employeeList.includes(data[i])) {
                this.employeeList.push(res[i]);
              }
            }
            this.employeeList.sort((a, b) => a.firstName.localeCompare(b.firstName))
            this.isMoreData = data.length > 9;
            this.infiniteScroll.complete();
            this.isDataLoaded = true;
          }
          this.isHold = false;
        },
        (error) => {
          this.isMoreData = false;
          this.isDataLoaded = true;
          this.isHold = false;
          this.infiniteScroll.complete();
        }
      );
  }

  loadData(event: any) {
    if (this.isMoreData) {
      this.pageIndex++;
      this.getEmployeeList();
    }
  }

  async employeeMoal(employeeItem: string | null, action: "add" | "edit") {
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
    localStorage.setItem("lastRoute", this.router.url);
    this.router.navigate([`/tabs/add-employee/${action}/${employeeItem}`]);
  }

  async deleteEmployee(employeeItem: any) {
    const deleteCtrl = await this.alertCtrl.create({
      header: "Delete",
      subHeader: "Are you sure, you want to delete this employee?",
      mode: "md",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "cancelBtn",
          handler: () => {},
        },
        {
          text: "Delete",
          role: "confirm",
          cssClass: "deleteBtn",
          handler: () => {
            this.adminServ.deleteEmployee(employeeItem).subscribe(
              (res) => {
                if (res) {
                  this.shareServ.presentToast(
                    "Employee deleted",
                    "top",
                    "success"
                  );
                  this.pageIndex = 0;
                  this.getEmployeeList();
                }
              },
              (error) => {
                console.log(error.error);
              }
            );
          },
        },
      ],
    });

    await deleteCtrl.present();
  }

  viewProfile(empId: string) {
    this.searchString = "";
    this.searchSubject.complete();

    const isSwitchable = localStorage.getItem("isSwitchable");
    if (this.userId === empId) {
      if (
        this.userRole === "Employee" &&
        (!isSwitchable ||
          isSwitchable?.toString().trim().toLocaleLowerCase() === "false")
      ) {
        this.router.navigateByUrl(`/tabs/profile`);
      } else if (
        isSwitchable ||
        isSwitchable?.toString().trim().toLocaleLowerCase() === "true"
      ) {
        this.router.navigateByUrl(`/tabs/admin-profile`);
      }
    } else {
      this.router.navigateByUrl(`/tabs/employee-profile/${empId}`);
    }
  }

  searchEmployee(searchValue: string) {
    if (searchValue.trim().length > 2) {
      this.isHold = true;
      this.isDataLoaded = false;
      const data = {
        searchString: searchValue,
        status: this.empType,
      };
      this.employeeList = [];
      this.shareServ.searchEmployee(data).subscribe(
        (res) => {
          if (res) {
            this.employeeList = res;
            this.isDataLoaded = true;
            this.employeeList.sort((a, b) => a.firstName.localeCompare(b.firstName))
          }
          this.isHold = false;
        },
        (error) => {
          this.isDataLoaded = true;
          this.isHold = false;
        }
      );
    } else if (searchValue.trim() === "") {
      this.isHold = true;
      this.isDataLoaded = false;
      this.pageIndex = 0;
      this.getEmployeeList();
    }
  }

  getTypedEmployee(event: "All" | "Active" | "InActive" | "Resigned") {
    this.isDataLoaded = false;
    this.empType = event;
    this.pageIndex = 0;
    this.getEmployeeList();
  }

  getName(employee: IEmployeeResponse) {
    if (employee.lastName && employee.lastName.trim() !== "") {
      return `${employee.firstName.slice(0, 1)}${employee.lastName.slice(
        0,
        1
      )}`;
    } else {
      return `${employee.firstName.slice(0, 2)}`;
    }
  }

  onSearch() {
    this.searchSubject.next(this.searchString);
  }
  checkEmpty() {
    if (this.searchString === "") {
      this.isHold = true;
    }
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

  goBack() {
    history.back();
  }
}
