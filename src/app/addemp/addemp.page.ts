import { Component } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-addemp',
  templateUrl: './addemp.page.html',
  styleUrls: ['./addemp.page.scss'],
})
export class AddempPage {
  employeeName!: string;
  phoneNumber!: string;

  constructor(private navCtrl: NavController) { }

  gooooooBack() {
    this.navCtrl.navigateBack('/home');
  }

  saveData() {
    const employeeData = {
      name: this.employeeName,
      phoneNumber: this.phoneNumber
    };

    // Retrieve the existing employee data from localStorage
    let existingData = localStorage.getItem('employeeData');
    let employeeDataArray = [];

    if (existingData) {
      employeeDataArray = JSON.parse(existingData);
    }

    // Add the new employee data to the array
    employeeDataArray.push(employeeData);

    // Store the updated employee data in localStorage
    localStorage.setItem('employeeData', JSON.stringify(employeeDataArray));

    this.navCtrl.navigateBack('/directory');
  }

  validateInput(inputValue: string): boolean {
    const phonePattern = /^\d{10}$/;
    return phonePattern.test(inputValue);
  }

  checkInput() {
    if (this.validateInput(this.phoneNumber)) {
      console.log('Valid input');
    } else {
      console.log('Invalid input');
    }
  }
}
