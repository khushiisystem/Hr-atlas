import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeaveSetupPageRoutingModule } from './leave-setup-routing.module';

import { LeaveSetupPage } from './leave-setup.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeaveSetupPageRoutingModule
  ],
  declarations: [LeaveSetupPage]
})
export class LeaveSetupPageModule {}
