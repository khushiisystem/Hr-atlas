import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { IEmplpoyeeWorWeek } from 'src/app/interfaces/response/IEmplpoyeeWorWeek';
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
  workWeekDetail!: IEmplpoyeeWorWeek;
  isLoaded: boolean = false;

  constructor(
    private activeRoute: ActivatedRoute,
    private shareServ: ShareService,
    private loaderServ: LoaderService,
  ) {}
  
  ngOnInit() {
    this.employeeId = this.activeRoute.snapshot.params?.['employeeId'];
    this.weekArray = moment.weekdays();
    this.weekCount();
    if(this.employeeId.trim() !== ''){
      this.getWorkWeek();
    }
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

  getWorkWeek(){
    this.isLoaded = false;
    this.loaderServ.present('');
    this.shareServ.employeeAssignedWorkWeek(this.employeeId).subscribe(res => {
      if(res) {
        this.workWeekDetail = res;
        this.isLoaded = true;
        this.loaderServ.dismiss();
      }
    }, (error) => {
      this.isLoaded = true;
      this.loaderServ.dismiss();
    });
  }

  goBack(){history.back();}

  getWorkingDays(): string[] {
    let workDay = this.weekArray.filter((e: string) => !this.workWeekDetail.workweekDetails.weekOff.includes(e));
    return workDay;
  }

}
