import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { IPayrollSetupRequest } from 'src/app/interfaces/request/IPayrollSetup';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';
import { IEmpSelect } from 'src/app/share/employees/employees.page';

@Component({
  selector: 'app-payroll-setup',
  templateUrl: './payroll-setup.page.html',
  styleUrls: ['./payroll-setup.page.scss'],
})
export class PayrollSetupPage implements OnInit {
  employeeId: string = '';
  employee!: IEmpSelect;

  constructor(
    private adminServ: AdminService,
    private loader: LoaderService,
    private shareServ: ShareService,
  ) { }

  ngOnInit() {
  }

  selectEmploye(event: IEmpSelect) {
    this.employee = event;
    this.employeeId = event.guid;
  }

  reseteEmployee(){this.employee = null as any; this.employeeId = '';}

  formSubmited(event: 'confirm' | 'cancel'){
    if(event === 'confirm'){
      this.employee = null as any;
      this.employeeId = '';
    }
  }

  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }

  goBack(){history.back();}

}
