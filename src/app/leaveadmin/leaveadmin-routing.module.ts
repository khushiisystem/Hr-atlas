import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeaveadminPage } from './leaveadmin.page';

const routes: Routes = [
  {
    path: '',
    component: LeaveadminPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeaveadminPageRoutingModule {}
