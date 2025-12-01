import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from "@angular/core";
import { Router } from "@angular/router";
import { IonInfiniteScroll } from "@ionic/angular";
import * as moment from "moment";
import { Subject, debounceTime } from "rxjs";
import { IRoles } from "src/app/interfaces/enums/IRoles";
import { IEmployeeResponse } from "src/app/interfaces/response/IEmployee";
import { AdminService } from "src/app/services/admin.service";
import { LoaderService } from "src/app/services/loader.service";
import { RoleStateService } from "src/app/services/roleState.service";
import { ShareService } from "src/app/services/share.service";

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
  selector: "app-employees",
  templateUrl: "./employees.page.html",
  styleUrls: ["./employees.page.scss"],
})
export class EmployeesPage implements OnInit, OnDestroy {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  @Input() isChecklist: boolean = false;
  @Input() isPayroll?: boolean;
  @Output() employee: EventEmitter<IEmpSelect> = new EventEmitter<IEmpSelect>();
  @Output() payslipDateChange = new EventEmitter<Date>();
  employeeList: IEmployeeResponse[] = [];
  isDataLoaded: boolean = false;
  isMoreData: boolean = true;
  openCalendar: boolean = false;
  pageIndex: number = 0;
  userRole: string = "";
  searchString: string = "";
  empType: "All" | "Active" | "InActive" | "Resigned" = "Active";
  selectedEmployee: any[] = [];
  @Input() payslipDate?: Date;
  @Input() payrollSetup?: boolean;
  today: Date = new Date();
  private searchSubject = new Subject<string>();
  private readonly debounceTimeMs = 1500;

  constructor(
    private adminServ: AdminService,
    private shareServ: ShareService,
    private loader: LoaderService,
    private roleStateServ: RoleStateService,
    public router: Router
  ) {
    roleStateServ.getState().subscribe((res) => {
      if (res) {
        this.userRole = res;
      } else {
        this.userRole = localStorage.getItem("userRole") || "";
      }
    });
  }

  ngOnInit() {
    this.today.setFullYear(
      this.today.getFullYear(),
      this.today.getMonth(),
      this.today.getDate()
    );
    if (this.payrollSetup) {
      const storedDate = localStorage.getItem("payslipDate");
      this.payslipDate = storedDate ? new Date(storedDate) : this.today;
    }
    this.getEmployeeList();
    this.searchSubject
      .pipe(debounceTime(this.debounceTimeMs))
      .subscribe((searchValue) => {
        this.searchEmployee(searchValue);
      });
  }

  getEmployeeList() {
    this.isDataLoaded = false;
    if (this.pageIndex < 1) {
      this.employeeList = [];
    }
    this.adminServ
      .getPayrollEmployees(
        this.empType,
        this.pageIndex * 10,
        10,
        moment(this.payslipDate).utc().format()
      )
      .subscribe(
        (res) => {
          if (res) {
            const data: any[] = res;
            for (let i = 0; i < data.length; i++) {
              this.employeeList.push(res[i]);
            }

            this.isMoreData = res.length > 9;
            this.infiniteScroll.complete();
            this.isDataLoaded = true;
          }
        },
        (error) => {
          this.isMoreData = false;
          this.isDataLoaded = true;
          this.infiniteScroll.complete();
        }
      );
  }

  getTypedEmployee(event: "All" | "Active" | "InActive" | "Resigned") {
    this.empType = event;
    this.pageIndex = 0;
    this.selectedEmployee = [];
    this.getEmployeeList();
  }

  loadData(event: InfiniteScrollCustomEvent) {
    if (this.isMoreData) {
      this.pageIndex++;
      this.getEmployeeList();
    }
  }

  selectAll(event: CustomEvent) {
    if (event.detail.checked === true) {
      this.allSelect();
    } else if (event.detail.checked === false) {
      this.deselectAll();
    }
  }

  allSelect() {
    this.employeeList.forEach((e: IEmployeeResponse, index) => {
      if (!this.selectedEmployee.includes(e.guid) && e.salaryStatus) {
        this.selectedEmployee.push(e.guid);
      }
    });
  }
  deselectAll() {
    this.selectedEmployee = [];
  }

  checkEmployee(employee: string, salaryStatus?: boolean) {
    if (this.userRole !== "Admin") return;
    if (!salaryStatus) return;

    console.log("emp data : ", salaryStatus);
    if (this.isChecklist) {
      const index = this.selectedEmployee.findIndex(
        (e: string) => e === employee
      );
      console.log("index : ", index);
      if (index !== -1) {
        this.selectedEmployee.splice(index, 1);
      } else {
        this.selectedEmployee.push(employee);
      }
    }
  }

  isChecked(employee: any) {
    return this.selectedEmployee.includes(employee);
  }

  selectEmployee(empData: IEmpSelect) {
    if (this.userRole !== "Admin") return;

    if (this.selectedEmployee.length > 0) {
      this.checkEmployee(empData.guid);
    } else {
      this.employee.emit(empData);
    }
  }

  searchEmployee(searchValue: string) {
    if (searchValue.trim().length > 2) {
      this.isDataLoaded = false;
      const data = {
        searchString: searchValue,
        status: this.empType,
      };
      this.employeeList = [];
      this.adminServ
        .searchEmployees(
          this.empType,
          this.pageIndex * 10,
          10,
          moment(this.payslipDate).utc().format(),
          data
        )
        .subscribe(
          (res) => {
            if (res) {
              this.employeeList = res;
              this.isDataLoaded = true;
            }
          },
          (error) => {
            console.log(error, "search error");
            this.isDataLoaded = true;
          }
        );
    } else if (searchValue.trim() === "") {
      this.pageIndex = 0;
      this.getEmployeeList();
    }
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

  ngOnDestroy(): void {
    this.searchSubject.complete();
    this.selectedEmployee = [];
    this.searchString = "";
  }

  getMonthYear() {
    let customDate = "";
    let monthArray = moment.months();
    if (this.payslipDate) {
      customDate = `${
        monthArray[new Date(this.payslipDate).getMonth()]
      } ${new Date(this.payslipDate).getFullYear()}`;
    }
    return customDate;
  }

  selectPayslipDate(event: any) {
    if (event.detail.value) {
      this.payslipDate = new Date(event.detail.value);
      localStorage.setItem("payslipDate", this.payslipDate.toString());
      this.pageIndex = 0;
      this.employeeList = [];
      this.getEmployeeList();
      this.payslipDateChange.emit(this.payslipDate);
    }
  }

  generatePaySlip(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.loader.present("");
    this.adminServ
      .createPayslip({
        employeeIds: this.selectedEmployee,
        payslipDate: moment.utc(this.payslipDate).format(),
      })
      .subscribe(
        (result) => {
          this.shareServ.presentToast("Payslip generated", "top", "success");
          this.selectedEmployee = [];
          this.loader.dismiss();
          this.router.navigateByUrl(
            `/tabs/pdf-details?date=${moment(this.payslipDate).utc().format()}`
          );
        },
        (error) => {
          console.log(error);
          this.shareServ.presentToast(error.error.message, "top", "danger");
          this.loader.dismiss();
        }
      );
  }
}
