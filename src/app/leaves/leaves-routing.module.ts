import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeavesPage } from './leaves.page';

const routes: Routes = [
  {
    path: '',
    component: LeavesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeavesPageRoutingModule {}
