import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  userRole: string = "";

  constructor() {
    this.userRole = localStorage.getItem("userRole") || "Employee";
  }

  clearLastRoute(){localStorage.removeItem('lastRoute');}

}
