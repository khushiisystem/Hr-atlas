import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TeampagePageRoutingModule } from './teampage-routing.module';

import { TeampagePage } from './teampage.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TeampagePageRoutingModule
  ],
  declarations: [TeampagePage]
})
export class TeampagePageModule {}
