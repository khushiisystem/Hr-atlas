import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-directory',
  templateUrl: './directory.page.html',
  styleUrls: ['./directory.page.scss'],
})
export class DirectoryPage {
  employeeData: any[] = [];

  constructor(private navCtrl: NavController) { }

  ionViewWillEnter() {
    this.loadEmployeeData();
  }

  loadEmployeeData() {
    
    const storedData = localStorage.getItem('employeeData');
    if (storedData) {
      this.employeeData = JSON.parse(storedData);
    } else {
      this.employeeData = [];
    }
  }

  deleteEmployeeData(data: any) {
    
    const index = this.employeeData.indexOf(data);
    if (index > -1) {
      this.employeeData.splice(index, 1);
    }

    localStorage.setItem('employeeData', JSON.stringify(this.employeeData));
  }

  showOptions(data: any) {
   
    data.showOptions = !data.showOptions;
  }

  gooooooBack() {
    this.navCtrl.navigateBack('/home');
  }
  callEmployee(phoneNumber: string) {
   
}
}
