import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
})
export class SettingsPage implements OnInit {
  constructor(private router: Router) { }
 

  ngOnInit() {
  }
  
  goBack() {
    this.router.navigate(['./home']);
  }
  goToPage1(){
    this.router.navigate(['./attendance-setup']);

  }
  goToPage2(){
    this.router.navigate(['./leave-setup']);

  }
  goToPage3(){
    this.router.navigate(['./payroll-setup']);

  }
  goToPage4(){
    this.router.navigate(['./additional-setup']);

  }
 
}
