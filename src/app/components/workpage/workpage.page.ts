import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-workpage',
  templateUrl: './workpage.page.html',
  styleUrls: ['./workpage.page.scss'],
})
export class WorkpagePage implements OnInit {
  isEditMode: boolean = false;

  Employeeid!: string;
  Employeetype!: string;
  Status!: string;
  Dateofjoining!: string;
  Worklocation!: string;
  Workexperience! : string;
  Probationperiod! :string;


  Designation!: string;
  Jobtitle!: string;
  Department!: string;
  Subdepartment!: string;

  

  constructor(private router: Router) { 
  this.Employeeid= "10032";
  this.Employeetype = "Full Time";
  this.Status = "Active";
  this.Dateofjoining = "06/04/2022";
  this.Worklocation = "-";
  this.Workexperience="-";
  this.Probationperiod="-";
  this.Designation = "DevOPs engineer";
  this.Jobtitle = "intern";
  this.Department = "Technical";
  this.Subdepartment = "-";

  }
  ngOnInit() {
  }

  goBack() {history.back();}

}
