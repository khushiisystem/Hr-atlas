import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-employee-work-week',
  templateUrl: './employee-work-week.page.html',
  styleUrls: ['./employee-work-week.page.scss'],
})
export class EmployeeWorkWeekPage implements OnInit {
  employeeId: string = '';
  weekArray: string[] = [];
  numberOfWeek: string[] = [];

  constructor(
    private activeRoute: ActivatedRoute,
    private shareServ: ShareService,
    private loaderServ: LoaderService,
  ) {}
  
  ngOnInit() {
    this.employeeId = this.activeRoute.snapshot.params?.['employeeId'];
    this.weekArray = moment.weekdaysShort();
    this.weekCount();
    console.log(this.weekArray);
    console.log(this.numberOfWeek);
  }

  weekCount() {
    const today = new Date();
    const firstOfMonth = new Date(today.getFullYear(), today.getMonth()-1, 1);
    const lastOfMonth = new Date(today.getFullYear(), today.getMonth(), 0);

    const used = firstOfMonth.getDay() + lastOfMonth.getDate();

    let i=0;
    while (i < Math.ceil( used / 7)) {
      this.numberOfWeek.push('box');
      i++;
    }

    // return Math.ceil( used / 7);
  }

  goBack(){history.back();}

}
