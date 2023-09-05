import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AdminLeavesPage } from './admin-leaves.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  exports: [AdminLeavesPage],
  declarations: [AdminLeavesPage]
})
export class AdminLeavesPageModule {}
