import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AttendanceSetupPageRoutingModule } from './attendance-setup-routing.module';

import { AttendanceSetupPage } from './attendance-setup.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AttendanceSetupPageRoutingModule
  ],
  declarations: [AttendanceSetupPage]
})
export class AttendanceSetupPageModule {}
