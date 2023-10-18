import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { IPayrollSetupRequest } from 'src/app/interfaces/request/IPayrollSetup';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { ISalarySetupResponse } from 'src/app/interfaces/response/ISalaryResponse';
import { IPayslipResponse } from 'src/app/interfaces/response/payslipResponse';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';
import { IEmpSelect } from 'src/app/share/employees/employees.page';

@Component({
  selector: 'app-employee-payroll',
  templateUrl: './employee-payroll.page.html',
  styleUrls: ['./employee-payroll.page.scss'],
})
export class EmployeePayrollPage implements OnInit {
  @Input() employee!: IEmpSelect;
  @Output() createSalary: EventEmitter<'confirm' | 'cancel'> = new EventEmitter();
  employeeId: string = '';
  payslipFrom!: FormGroup;
  inProgress: boolean = false;
  openCalendar: boolean = false;
  salaryStructureLoaded: boolean = false;
  today: Date = new Date();
  payslipDate: Date = new Date();
  activeTab: string = 'earning';
  employeeDetail!: IEmployeeResponse;
  paySlip!: IPayslipResponse;
  salaryStructure!: ISalarySetupResponse;

  constructor(
    private fb: FormBuilder,
    private adminServ: AdminService,
    private modalCtrl: ModalController,
    private shareServ: ShareService,
    private loaderServ: LoaderService,
  ) { }

  ngOnInit() {
    this.today = new Date();
    this.today.setFullYear(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
    this.employeeId = this.employee.guid;
    this.payslipDate = this.today;

    if(this.employeeId.trim() !== ''){
      this.getProfile(this.employeeId);
    }

    this.payslipFrom = this.fb.group({
      employeeId: [this.employeeId, Validators.required],
      ctc: [0, Validators.compose([Validators.required, Validators.min(1)])],
      basicSalary: [0, Validators.compose([Validators.required, Validators.min(1)])],
      bonus: [0, Validators.compose([Validators.min(0)])],
      advanceSalary: [0, Validators.compose([Validators.min(0)])],
      deductionAmount: [0, Validators.compose([Validators.min(0)])],
      lop: [0, Validators.compose([Validators.min(0), Validators.max(365)])],
      incomeTax: [0, Validators.compose([Validators.min(0)])],
      payslipDate: [moment.utc(this.payslipDate).format(), Validators.required],
    });
  }


  getProfile(empId: string) {
    this.loaderServ.present('');
    this.adminServ.getEmployeeById(empId).subscribe(res => {
      if(res) {
        this.employeeDetail = res;
        this.loaderServ.dismiss();
        this.getPayStructure();
      }
    }, (error) => {
      this.loaderServ.dismiss();
      this.getPayStructure();
    });
  }
  getName(employee: IEmployeeResponse) {
    if(employee.lastName && employee.lastName.trim() !== ''){
      return `${employee.firstName.slice(0,1)}${employee.lastName.slice(0,1)}`;
    } else {
      return `${employee.firstName.slice(0,2)}`;
    }
  }

  selectPayslipDate(event: any){
    console.log(event.detail.value, "event");
    if(this.payslipDate){
      this.payslipFrom.patchValue({
        payslipDate: moment.utc(this.payslipDate).format()
      });
    }
  }

  getPayslipOfTheMonth(){
    this.paySlip = null as any;
    this.payslipFrom.patchValue({
      bonus: 0,
      advanceSalary: 0,
      deductionAmount: 0,
      lop: 0,
      incomeTax: 0,
    });
    this.salaryStructureLoaded = false;
    this.adminServ.getEmployeePayslip({employeeId: this.employeeId, date: moment.utc(this.payslipDate).format()}).subscribe(res => {
      if(res != null){
        this.paySlip = res;
        this.payslipFrom.patchValue(res);
        if(!res.payslipDate) {
          this.payslipFrom.patchValue({
            payslipDate: moment.utc(this.payslipDate).format(),
          });
        }
        console.log(this.payslipFrom.value);
        this.salaryStructureLoaded = true;
        this.loaderServ.dismiss();
      } else {
        this.loaderServ.dismiss();
      }
    }, (error) => {
      this.shareServ.presentToast(error.error || error.error.message, 'top', 'danger');
      this.loaderServ.dismiss();
    });
  }

  getPayStructure(){
    this.loaderServ.present('');
    this.adminServ.getEmloyeePayStructure(this.employeeId, moment.utc(this.payslipDate).format()).subscribe(res => {
      if(res){
        console.log(res);
        this.salaryStructure = res;
        this.payslipFrom.patchValue({
          ctc: res.current_ctc,
          basicSalary: res.current_ctc / 12
        });
        console.log(this.payslipFrom.value);
        this.salaryStructureLoaded = true;
      }
    }, (error) => {
      this.shareServ.presentToast(error.error.message, 'top', 'danger');
      this.salaryStructureLoaded = false;
    });

    this.getPayslipOfTheMonth();
  }

  submit(){
    if(this.payslipFrom.invalid){
      return;
    } else {
      this.loaderServ.present('');
      this.paySlip = null as any;
      console.log(this.payslipFrom.value);
      this.adminServ.createIndividualPayslip(this.payslipFrom.value).subscribe(res => {
        if(res){
          this.paySlip = res;
          this.payslipFrom.patchValue(res);
          this.activeTab = 'payslip';
          this.shareServ.presentToast('Payslip created successfully.', 'top', 'success');
          console.log(res);
          this.loaderServ.dismiss();
        }
      }, (error) =>{
        console.log(error);
        this.shareServ.presentToast(error.error.errorMessage || 'Something is wrong.', 'bottom', 'danger');
        this.loaderServ.dismiss();
      });
    }
  }
}
