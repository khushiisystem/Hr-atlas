import { Component, OnInit } from '@angular/core';
import { IEmpSelect } from 'src/app/share/employees/employees.page';

@Component({
  selector: 'app-salary',
  templateUrl: './salary.page.html',
  styleUrls: ['./salary.page.scss'],
})
export class SalaryPage implements OnInit {
  employeeId: string = '';
  employee!: IEmpSelect;

  constructor() { }

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

  goBack(){history.back();}

}
