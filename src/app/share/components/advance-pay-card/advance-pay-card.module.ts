import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { AdvancePayCardPage } from './advance-pay-card.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [AdvancePayCardPage],
  exports: [AdvancePayCardPage]
})
export class AdvancePayCardPageModule {}
