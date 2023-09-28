import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-admin-tutorials',
  templateUrl: './admin-tutorials.page.html',
  styleUrls: ['./admin-tutorials.page.scss'],
})
export class AdminTutorialsPage implements OnInit {
  setupName: string = '';

  constructor(
    private modalCtrl: ModalController,
    private popoverCtl: PopoverController,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  skip(){
    if(this.setupName === 'leave'){
      this.popoverCtl.dismiss('leaveDone');
      // this.modalCtrl.dismiss('leaveDone');
    } else {
      this.popoverCtl.dismiss('attendanceDone');
      // this.modalCtrl.dismiss('attendanceDone');
    }
  }

  next(){
    if(this.setupName === 'leave'){
      this.popoverCtl.dismiss('leaveDone');
      // this.modalCtrl.dismiss('leaveDone');
    } else {
      this.popoverCtl.dismiss('attendanceDone');
      // this.modalCtrl.dismiss('attendanceDone');
    }
  }

  goToSetting(){
    this.popoverCtl.dismiss();
    this.router.navigate(['/tabs/settings']);
  }

}
