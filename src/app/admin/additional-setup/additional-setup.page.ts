import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
import { Subject, debounceTime } from 'rxjs';
import { IEmployeeResponse } from 'src/app/interfaces/response/IEmployee';
import { AdminService } from 'src/app/services/admin.service';
import { LoaderService } from 'src/app/services/loader.service';
import { ShareService } from 'src/app/services/share.service';

@Component({
  selector: 'app-additional-setup',
  templateUrl: './additional-setup.page.html',
  styleUrls: ['./additional-setup.page.scss'],
})
export class AdditionalSetupPage implements OnInit {
  activeTab: string = "assign_work_week";
  randomCard: any[] = [];
  selectedEmployee: any[] = [];
  employeeList: IEmployeeResponse[] = [];
  isDataLoaded: boolean = false;
  pageIndex: number = 0;
  isMoreEmployee: boolean = false;
  searchString: string = "";
  expandedCard: string = "";
  private searchSubject = new Subject<string>();
  private readonly debounceTimeMs = 2500;

  constructor(
    private adminServ: AdminService,
    private shareServ: ShareService,
    public router: Router,
    private loader: LoaderService,
    private acctionSheet: ActionSheetController,
  ) { }

  ngOnInit() {
    this.randomCard.length = 7;
    this.getEmployees();
    this.searchSubject.pipe(debounceTime(this.debounceTimeMs)).subscribe((searchValue) => {
      this.searchEmployee(searchValue);
    });
  }
  
  selectAll(event: CustomEvent) {
    if(event.detail.checked === true){
      this.employeeList.forEach((e: IEmployeeResponse, index) => {
        if(!this.selectedEmployee.includes(e.guid)){
          this.selectedEmployee.push(e.guid);
        }
      });
    } else if(event.detail.checked === false) {
      this.selectedEmployee = [];
    }
  }

  selectEmployee(employee: string) {
    const index = this.selectedEmployee.findIndex((e: string) => e === employee);
    if(index !== -1){
      this.selectedEmployee.splice(index, 1);
    } else {
      this.selectedEmployee.push(employee);
    }
  }

  isChecked(employee: any) {
    return this.selectedEmployee.includes(employee);
  }

  async selectWrokWeek(empIds: string[]){
    if(empIds.length < 1) {return;}
    const weekListSheet = this.acctionSheet.create({
      htmlAttributes: {'aria-label': 'Assign work week'},
      header: 'Select Work Week',
      keyboardClose: false,
      backdropDismiss: false,
      buttons: [
        {
          text: 'Saturday Sunday Off',
          data: {action: 'Saturday Sunday Off'},
          cssClass: 'action_week_btn',
        },
        {
          text: 'Sunday Off',
          data: {action: 'Sunday Off'},
          cssClass: 'action_week_btn',
        },
        {
          role: 'cancel',
          text: 'Cancel',
          data: {action: 'cancel'}
        }
      ]
    });

    (await weekListSheet).present();

    (await weekListSheet).onDidDismiss().then(result => {
      if(result.role !== 'cancel' && result.data && result.data.action) {
        this.assignWorkWeek(empIds, result.data.action);
      }
    });
  }

  expandCard(workWeekType: string) {
    if(this.expandedCard === workWeekType){
      this.expandedCard = '';
    } else {
      this.expandedCard = workWeekType
    }
  }

  searchEmployee(searchValue: string){
    if(searchValue.trim().length > 3){
      this.selectedEmployee = [];
      this.isDataLoaded = false;
      const data = {
        searchString: searchValue
      }
      this.employeeList = [];
      this.shareServ.searchEmployee(data).subscribe(res => {
        if(res){
          this.employeeList = res;
          this.isDataLoaded = true;
        }
      }, (error) => {
        console.log(error, "search error");
        this.isDataLoaded = true;
      });
    } else {
      this.getEmployees();
    }
  }

  onSearch() {
    this.searchSubject.next(this.searchString);
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  goBack(){history.back();}

  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }

  getEmployees(){
    this.isDataLoaded = false;
    this.shareServ.getAllEmployee().subscribe(res => {
      if(res){
        this.employeeList = res;
        this.isMoreEmployee = res.length > 9;
        this.isDataLoaded = true;
      }
    })
  }

  next(){
    this.pageIndex++;
    this.getEmployees();
  }
  prev(){
    this.pageIndex--;
    this.getEmployees();
  }

  assignWorkWeek(employeeId: string[], workWeek: string){
    this.loader.present('');
    const data = {
      employeeIds: employeeId,
      workWeek: workWeek
    }
    console.log(data, 'data');
    this.adminServ.assignWorkWeek(data).subscribe(res => {
      if(res){
        this.shareServ.presentToast("work assigned", 'top', 'success');
        this.activeTab = "create_work_week";
        this.loader.dismiss();
      }
    }, (error) => {
      console.log(error, "error");
      this.shareServ.presentToast('womething is wrong', 'top', 'danger');
      this.loader.dismiss();
    });
  }

}
