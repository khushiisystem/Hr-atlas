import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BiopagePageRoutingModule } from './biopage-routing.module';

import { BiopagePage } from './biopage.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BiopagePageRoutingModule
  ],
  declarations: [BiopagePage]
})
export class BiopagePageModule {}
