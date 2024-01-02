import { Component, Input, OnInit } from '@angular/core';
import { ISalarySetupResponse } from 'src/app/interfaces/response/ISalaryResponse';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-salary-history',
  templateUrl: './salary-history.page.html',
  styleUrls: ['./salary-history.page.scss'],
})
export class SalaryHistoryPage implements OnInit {
  incrementHistory: ISalarySetupResponse[] = [];
  isLoaded: boolean = false;
  moreData: boolean = true;
  isExpanded: boolean = false;
  pageIndex: number = 0;
  @Input() employeeId: string ='';

  constructor(
    private adminServ: AdminService
  ) { }

  ngOnInit() {
    if(this.employeeId.trim() !== ''){
      this.getSalaryHistory();
    }
  }

  getSalaryHistory(){
    this.isLoaded = false;
    if(this.pageIndex === 0) {this.incrementHistory = [];}

    this.adminServ.getEmloyeeSalaryHistory(this.employeeId, this.pageIndex * 10, 10).subscribe(res => {
      if(res){
        if(res.length === 0){
          this.moreData = false;
          this.isLoaded = true;
          return;
        } else {
          for(let i=0; i<res.length; i++){
            this.incrementHistory.push(res[i]);
          }
          this.moreData = res.length > 9;
          this.isLoaded = true;
        }
      }
    }, (error) => {
      this.moreData = false;
      this.isLoaded = true;
    });
  }

  loadMore(){
    this.pageIndex++;
    this.getSalaryHistory();
  }

}
