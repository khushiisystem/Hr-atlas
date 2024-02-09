import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, NgZone, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GestureController, GestureDetail } from '@ionic/angular';
import * as moment from 'moment';
import { ICreditLogsRequest, ICreditLogsResponse } from 'src/app/interfaces/request/IPayrollSetup';
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
export class EmployeePayrollPage implements OnInit, AfterViewInit {
  @Input() employee!: IEmpSelect;
  @Output() createSalary: EventEmitter<'confirm' | 'cancel'> = new EventEmitter();
  @ViewChild('tabsContent', { read: ElementRef }) tabsContent!: ElementRef<HTMLIonCardElement>;
  employeeId: string = '';
  extraIncomeForm!: FormGroup;
  inProgress: boolean = false;
  openCalendar: boolean = false;
  salaryStructureLoaded: boolean = false;
  historyLoaded: boolean = false;
  today: Date = new Date();
  payrollDate: string = "";
  previousLog!: ICreditLogsResponse;
  logHistory: ICreditLogsResponse[] = [];
  salaryStructure!: ISalarySetupResponse;
  tabs: Array<{value: string, label: string}> = [{label: "Earning", value: "earning"}, {label: "Deductions", value: "deductions"}, {label: "History", value: "history"}]
  activeTab: string = 'earning';
  private isTabChangeTriggered = false;

  constructor(
    private fb: FormBuilder,
    private adminServ: AdminService,
    private shareServ: ShareService,
    private loaderServ: LoaderService,
    private gestureCtrl: GestureController,
    private cdRef: ChangeDetectorRef,
    private zone: NgZone,
  ) { }

  ngOnInit() {
    this.today = new Date();
    this.today.setFullYear(this.today.getFullYear(), this.today.getMonth(), this.today.getDate());
    this.employeeId = this.employee.guid;
    this.payrollDate = this.today.toISOString();

    if(this.employeeId.trim() !== ''){
      this.getPayStructure();
    }

    this.extraIncomeForm = this.fb.group({
      bonus: 0,
      advanceAmount: 0,
      compOff: 0,
      deductionAmount: 0,
      otherDeduction: 0,
      description: '',
    });
  }

  ngAfterViewInit(): void {
    const gesture = this.gestureCtrl.create({
      el: this.tabsContent.nativeElement,
      threshold: 0,
      onStart: () => this.onStart(),
      onMove: (detail) => this.onMove(detail),
      onEnd: () => this.onEnd(),
      gestureName: 'change-tab-in-payslip',
    });

    gesture.enable();
    // this.loadPdf();
  }

  loadPdf() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://drive.google.com/file/d/1pRSZZnXUheRDpvKqcFyG3wEsnI-uZrud/view?usp=drive_link', true);
    xhr.responseType = 'blob';

    xhr.onload = (e: any) => {
      console.log(xhr);
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: 'application/pdf' });
      }
    };

    xhr.send();
  }
  onFileSelected() {
    let $img: any = document.querySelector('#file');
  
    if (typeof (FileReader) !== 'undefined') {
      let reader = new FileReader();
  
      reader.onload = (e: any) => {
      };
  
      reader.readAsArrayBuffer($img.files[0]);
    }
  }
  afterLoadComplete(pdf: any) {
    this.zone.run(() => {
      console.log('PDF loaded', pdf);
    });
  }
  
  handleLoadError(error: any) {
    this.zone.run(() => {
      console.error('Error loading PDF', error);
    });
  }

  private onStart() {
    this.isTabChangeTriggered = false;
    this.cdRef.detectChanges();
  }
  
  private onMove(detail: GestureDetail) {
    if(this.isTabChangeTriggered){return;}
    const tabIndex = this.tabs.findIndex((tab) => tab.value === this.activeTab);
    
    if(detail.deltaX < -90 && tabIndex < this.tabs.length-1){
      this.activeTab = this.tabs[tabIndex+1].value;
      this.isTabChangeTriggered = true;
    } else if(detail.deltaX > 90 && tabIndex > 0){
      this.activeTab = this.tabs[tabIndex-1].value;
      this.isTabChangeTriggered = true;
    }
    
    // const { type, currentX, deltaX, velocityX } = detail;
    // this.debug.nativeElement.innerHTML = `
    //   <div>Type: ${type}</div>
    //   <div>Current X: ${currentX}</div>
    //   <div>Delta X: ${deltaX}</div>
    //   <div>Velocity X: ${velocityX}</div>`;
  }

  private onEnd() {
    this.isTabChangeTriggered = false;
    this.cdRef.detectChanges();
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
    if(this.payrollDate){
      this.extraIncomeForm.patchValue({
        payslipDate: moment.utc(this.payrollDate).format()
      });
    }
  }

  getPayStructure(){
    this.loaderServ.present('');
    this.salaryStructureLoaded = false;
    this.adminServ.getEmloyeePayStructure(this.employeeId, moment.utc(this.payrollDate).format()).subscribe(res => {
      if(res){
        this.salaryStructure = res;
        this.salaryStructureLoaded = true;
      }
    }, (error) => {
      this.shareServ.presentToast(error.error.message, 'top', 'danger');
      this.salaryStructureLoaded = true;
      this.loaderServ.dismiss();
    });

    this.getLogHistory();
  }

  getLogHistory(){
    this.historyLoaded = false;
    this.adminServ.getLogHistoryByEmployeeId(this.employeeId).subscribe(res => {
      if(res){
        this.logHistory = res;
        this.previousLog = this.logHistory[0];
        this.loaderServ.dismiss();
        this.historyLoaded = true;
      }
    }, (error) => {
      this.historyLoaded = true;
      this.loaderServ.dismiss();
    });
  }

  get basicSalary(): number {
    return this.salaryStructure ? (this.salaryStructure.current_ctc / 12) : 0;
  }
  get currentCtc(): number {
    return this.salaryStructure ? this.salaryStructure.current_ctc : 0;
  }

  getFormValue(ctrlName: string){
    const value = this.extraIncomeForm.controls[ctrlName].value;
    if(value === null || value.toString().trim() === ""){
      return 0
    } else{
      return value;
    }
  }

  checkFormValidation(){
    return this.getFormValue("bonus") === 0 && this.getFormValue("advanceAmount") === 0 && this.getFormValue("otherDeduction") === 0 && this.getFormValue("deductionAmount") === 0 && this.getFormValue("compOff") === 0;
  }

  submit(){    
    if(this.extraIncomeForm.invalid){
      return;
    } else {
      const reqData: ICreditLogsRequest = {
        employeeId: this.employeeId,
        bonus: this.getFormValue("bonus"),
        advanceAmount: this.getFormValue("advanceAmount"),
        deductionAmount: this.getFormValue("deductionAmount"),
        otherDeduction: this.getFormValue("otherDeduction"),
        compOff: this.getFormValue("compOff"),
        description: this.extraIncomeForm.controls["description"].value,
      }
      console.log(reqData);
      
      this.loaderServ.present('');
      this.adminServ.createPayrollLog(reqData).subscribe(res => {
        if(res){
          console.log(res);
          this.logHistory.unshift(res);
          this.activeTab = 'history';
          this.shareServ.presentToast('Logs created successfully.', 'top', 'success');
          this.loaderServ.dismiss();
          this.extraIncomeForm.patchValue({
            bonus: 0,
            advanceAmount: 0,
            compOff: 0,
            deductionAmount: 0,
            otherDeduction: 0,
            description: '',
          });
        }
      }, (error) =>{
        console.log(error);
        this.shareServ.presentToast(error.error.errorMessage || 'Something is wrong.', 'bottom', 'danger');
        this.loaderServ.dismiss();
      });
    }
  }
}
