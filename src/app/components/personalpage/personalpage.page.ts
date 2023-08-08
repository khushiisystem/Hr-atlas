import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-personalpage',
  templateUrl: './personalpage.page.html',
  styleUrls: ['./personalpage.page.scss'],
})
export class PersonalpagePage implements OnInit {
  isEditMode: boolean = false;

  fullName!: string;
  dateOfBirth!: string;
  gender!: string;
  bloodGroup!: string;
  maritalStatus!: string;

  phoneNumber!: string;
  alternatePhoneNumber!: string;
  personalEmail!: string;
  officialEmail!: string;

  currentAddress!: string;

  constructor(private router: Router) { this.fullName = "nikhil khandelwal";
  this.dateOfBirth = "2000-01-01";
  this.gender = "Male";
  this.bloodGroup = "O+";
  this.maritalStatus = "Single";

  this.phoneNumber = "1234567890";
  this.alternatePhoneNumber = "9876543210";
  this.personalEmail = "nikhil@gmail.com";
  this.officialEmail = "nikhil.khandelwal.intern@in.spundan.com";

  this.currentAddress = "xyz nagar"; }

  ngOnInit() {
  }
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }
  goBackpage() {
    this.router.navigate(['./profile']);
  }

}
