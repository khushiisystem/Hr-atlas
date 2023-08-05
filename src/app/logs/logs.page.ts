import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.page.html',
  styleUrls: ['./logs.page.scss'],
})
export class LOGSPage implements OnInit {
  toggleChecked: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
  }
  gooooooBack() {
    this.router.navigate(['./home']);
  }
  goleave() {
    this.router.navigate(['./leaves']);
  }
  

  toggleChanged() {
    if (this.toggleChecked) {
      this.router.navigate(['./logs']);
    } else {
      this.router.navigate(['./']);
    }
  }

}
