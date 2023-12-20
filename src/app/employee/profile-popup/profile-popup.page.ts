import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController, PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-profile-popup',
  templateUrl: './profile-popup.page.html',
  styleUrls: ['./profile-popup.page.scss'],
})
export class ProfilePopupPage implements OnInit {

  constructor(
    private modalCtrl: PopoverController,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  skip(){
    this.modalCtrl.dismiss(null, 'skip');
  }
  goToSetting(){
    this.modalCtrl.dismiss(null, 'settingProfile');
  }

}
