import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TeampagePage } from './teampage.page';

const routes: Routes = [
  {
    path: '',
    component: TeampagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TeampagePageRoutingModule {}
