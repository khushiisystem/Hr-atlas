import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BiopagePage } from './biopage.page';

const routes: Routes = [
  {
    path: '',
    component: BiopagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BiopagePageRoutingModule {}
