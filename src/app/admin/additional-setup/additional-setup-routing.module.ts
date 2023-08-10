import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AdditionalSetupPage } from './additional-setup.page';

const routes: Routes = [
  {
    path: '',
    component: AdditionalSetupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdditionalSetupPageRoutingModule {}
