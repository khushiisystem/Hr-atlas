import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-biopage',
  templateUrl: './biopage.page.html',
  styleUrls: ['./biopage.page.scss'],
})
export class BiopagePage implements OnInit {

  constructor(private router: Router) { }
  ngOnInit() {
  }

  goBack() {
    this.router.navigate(['./home']);

}}