import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LOGSPage } from './logs.page';

const routes: Routes = [
  {
    path: '',
    component: LOGSPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LOGSPageRoutingModule {}
