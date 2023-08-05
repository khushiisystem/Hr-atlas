import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AttendanceSetupPage } from './attendance-setup.page';

const routes: Routes = [
  {
    path: '',
    component: AttendanceSetupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AttendanceSetupPageRoutingModule {}
