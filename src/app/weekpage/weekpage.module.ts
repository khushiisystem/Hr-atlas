import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WeekpagePageRoutingModule } from './weekpage-routing.module';

import { WeekpagePage } from './weekpage.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WeekpagePageRoutingModule
  ],
  declarations: [WeekpagePage]
})
export class WeekpagePageModule {}
