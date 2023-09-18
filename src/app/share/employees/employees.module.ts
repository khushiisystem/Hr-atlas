import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';


import { EmployeesPage } from './employees.page';
import { NameImgPageModule } from '../components/name-img/name-img.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NameImgPageModule,
  ],
  exports: [EmployeesPage],
  declarations: [EmployeesPage]
})
export class EmployeesPageModule {}
