import { AfterContentInit, Component, OnInit, ViewChild } from '@angular/core';
import { IonInfiniteScroll, ModalController } from '@ionic/angular';
import { AdminService } from 'src/app/services/admin.service';
import { AddEmployeePage } from '../../../admin/add-employee/add-employee.page';
import { ShareService } from 'src/app/services/share.service';

interface InfiniteScrollCustomEvent extends CustomEvent {
  target: HTMLIonInfiniteScrollElement;
}

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.page.html',
  styleUrls: ['./employee-list.page.scss'],
})
export class EmployeeListPage implements OnInit, AfterContentInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;
  employeeList: any[] = [];
  isMoreData: boolean = true;
  pageIndex: number = 0;

  constructor(
    private adminServ: AdminService,
    private modelCtrl: ModalController,
    private shareServ: ShareService,
  ) { }

  ngOnInit() {
    this.getEmployeeList();
  }
  
  ngAfterContentInit(): void {
    console.log(this.infiniteScroll, "after");
    setTimeout(() => {
      this.infiniteScroll.complete();
    }, 2000);

  }

  getEmployeeList(){
    if(this.pageIndex < 1){
      this.employeeList = [];
    }
    this.adminServ.getEmployees(this.pageIndex * 15, 15).subscribe(res => {
      if(res){
        for(let i=0; i<res.results; i++){
          this.employeeList.push(res.results[i]);
        }

        this.isMoreData = this.employeeList.length < res.total;
        this.infiniteScroll.complete();
      }
    }, (error) => {
      this.isMoreData = false;
      this.infiniteScroll.complete();
    });
  }

  loadData(event: any){
    if (this.isMoreData) {
      this.pageIndex++;
      this.getEmployeeList();
    }
  }

  async employeeMoal(employeeItem: any, action: "add" | "edit"){
    const employeeModel = this.modelCtrl.create({
      component: AddEmployeePage,
      componentProps: {
        action: action,
        employeeId: employeeItem
      },
      mode: 'md',
      initialBreakpoint: 1
    });

    (await employeeModel).present();

    (await employeeModel).onDidDismiss().then(result => {
      console.log(result, "result");
    });
  }

  deleteEmployee(employeeItem: any){
    this.adminServ.deleteEmployee(employeeItem).subscribe(res => {
      if(res){
        this.shareServ.presentToast('Employee deleted', 'top', 'success');
        this.pageIndex = 0;
        this.getEmployeeList();
      }
    }, (error) => {})
  }

  goBack(){history.back();}
}
