import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LOGSPageRoutingModule } from './logs-routing.module';

import { LOGSPage } from './logs.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LOGSPageRoutingModule
  ],
  declarations: [LOGSPage]
})
export class LOGSPageModule {}
