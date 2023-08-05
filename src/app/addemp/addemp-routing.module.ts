import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddempPage } from './addemp.page';

const routes: Routes = [
  {
    path: '',
    component: AddempPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AddempPageRoutingModule {}
