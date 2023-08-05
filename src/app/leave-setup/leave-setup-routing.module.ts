import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LeaveSetupPage } from './leave-setup.page';

const routes: Routes = [
  {
    path: '',
    component: LeaveSetupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LeaveSetupPageRoutingModule {}
