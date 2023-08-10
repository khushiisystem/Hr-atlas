import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdditionalSetupPageRoutingModule } from './additional-setup-routing.module';

import { AdditionalSetupPage } from './additional-setup.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdditionalSetupPageRoutingModule
  ],
  declarations: [AdditionalSetupPage]
})
export class AdditionalSetupPageModule {}
