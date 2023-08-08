import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }
  goBackpage() {
    this.router.navigate(['./home']);
  }
  logout() {
    this.router.navigate(['./login']);
  }
  openbioPage(){
    this.router.navigate(['./biopage']);
  }
  openPersonalPage() {
    this.router.navigate(['./personalpage']);
  }
  openWorkPage() {
    this.router.navigate(['./workpage']);
  }
  openTeamPage() {
    this.router.navigate(['./teampage']);
  }
  openWeekPage() {
    this.router.navigate(['./weekpage']);
  }


}
