import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddempPageRoutingModule } from './addemp-routing.module';

import { AddempPage } from './addemp.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddempPageRoutingModule
  ],
  declarations: [AddempPage]
})
export class AddempPageModule {}
