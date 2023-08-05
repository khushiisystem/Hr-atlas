import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { WorkpagePage } from './workpage.page';

const routes: Routes = [
  {
    path: '',
    component: WorkpagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WorkpagePageRoutingModule {}
