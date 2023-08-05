import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PayrollSetupPage } from './payroll-setup.page';

const routes: Routes = [
  {
    path: '',
    component: PayrollSetupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PayrollSetupPageRoutingModule {}
