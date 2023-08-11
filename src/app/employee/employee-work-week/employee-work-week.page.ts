import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-employee-work-week',
  templateUrl: './employee-work-week.page.html',
  styleUrls: ['./employee-work-week.page.scss'],
})
export class EmployeeWorkWeekPage implements OnInit {
  employeeId: string = '';

  constructor(
    private activeRoute: ActivatedRoute,
    private shareServ: ShareService,
    private loaderServ: LoaderService,
  ) {
    this.employeeId = activeRoute.snapshot.params?.['employeeId'];
  }

  ngOnInit() {
    localStorage.removeItem('lastRoute');
  }

  goBack(){history.back();}

}
