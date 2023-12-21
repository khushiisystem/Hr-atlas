import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePopupPageRoutingModule } from './profile-popup-routing.module';

import { ProfilePopupPage } from './profile-popup.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePopupPageRoutingModule
  ],
  declarations: [ProfilePopupPage]
})
export class ProfilePopupPageModule {}
