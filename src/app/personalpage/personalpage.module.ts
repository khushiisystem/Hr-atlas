import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PersonalpagePageRoutingModule } from './personalpage-routing.module';

import { PersonalpagePage } from './personalpage.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PersonalpagePageRoutingModule
  ],
  declarations: [PersonalpagePage]
})
export class PersonalpagePageModule {}
