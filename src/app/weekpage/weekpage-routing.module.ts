import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WeekpagePage } from './weekpage.page';

const routes: Routes = [
  {
    path: '',
    component: WeekpagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WeekpagePageRoutingModule {}
