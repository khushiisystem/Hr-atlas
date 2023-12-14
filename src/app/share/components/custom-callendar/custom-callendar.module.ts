import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomCallendarPageRoutingModule } from './custom-callendar-routing.module';

import { CustomCallendarPage } from './custom-callendar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CustomCallendarPageRoutingModule
  ],
  declarations: [CustomCallendarPage],
  exports: [CustomCallendarPage],
})
export class CustomCallendarPageModule {}
