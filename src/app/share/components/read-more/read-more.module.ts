import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { IonicModule } from '@ionic/angular';

import { ReadMorePage } from './read-more.page';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
  ],
  declarations: [ReadMorePage],
  exports: [ReadMorePage],
})
export class ReadMorePageModule {}
