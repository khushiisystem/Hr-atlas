import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teampage',
  templateUrl: './teampage.page.html',
  styleUrls: ['./teampage.page.scss'],
})
export class TeampagePage implements OnInit {

  constructor(private router: Router) { }


  ngOnInit() {
  }
  gooooooBack() {
    this.router.navigate(['./profile']);
  }

}