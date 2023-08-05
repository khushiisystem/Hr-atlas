import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-weekpage',
  templateUrl: './weekpage.page.html',
  styleUrls: ['./weekpage.page.scss'],
})
export class WeekpagePage implements OnInit {

  constructor(private router: Router) { }


  ngOnInit() {
  }
  gooooooBack() {
    this.router.navigate(['./profile']);
  }

}