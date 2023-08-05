import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LeaveadminPageRoutingModule } from './leaveadmin-routing.module';

import { LeaveadminPage } from './leaveadmin.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LeaveadminPageRoutingModule
  ],
  declarations: [LeaveadminPage]
})
export class LeaveadminPageModule {}
