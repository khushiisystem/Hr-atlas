import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PayrollSetupPageRoutingModule } from './payroll-setup-routing.module';

import { PayrollSetupPage } from './payroll-setup.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PayrollSetupPageRoutingModule
  ],
  declarations: [PayrollSetupPage]
})
export class PayrollSetupPageModule {}
