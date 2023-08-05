import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { WorkpagePageRoutingModule } from './workpage-routing.module';

import { WorkpagePage } from './workpage.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    WorkpagePageRoutingModule
  ],
  declarations: [WorkpagePage]
})
export class WorkpagePageModule {}
