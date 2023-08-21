import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController } from '@ionic/angular';
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
  employeeList: any[] = [];
  isDataLoaded: boolean = false;
  pageIndex: number = 0;
  isMoreEmployee: boolean = false;
  expandedCard: string = "";

  constructor(
    private adminServ: AdminService,
    private shareServ: ShareService,
    public router: Router,
    private loader: LoaderService,
    private acctionSheet: ActionSheetController,
  ) { }

  ngOnInit() {
    this.randomCard.length = 7;
    const timing = setTimeout(() => {
      this.isDataLoaded = true;
      clearTimeout(timing);
    }, 2000);
    this.getEmployees();
  }
  
  selectAll(event: CustomEvent) {
    if(event.detail.checked === true){
      this.selectedEmployee = ['Arjun','Pritam',3];
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
    if(this.selectedEmployee.length < 1) {return;}
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
      if(result.data && result.data.action) {
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

  goBack(){history.back();}

  handleRefresh(event: any) {
    setTimeout(() => {
      window.location.reload();
      event.target.complete();
    }, 2000);
  }

  getEmployees(){
    this.shareServ.getAllEmployee(this.pageIndex * 10, 10).subscribe(res => {
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
