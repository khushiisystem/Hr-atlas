import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PersonalpagePage } from './personalpage.page';

const routes: Routes = [
  {
    path: '',
    component: PersonalpagePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonalpagePageRoutingModule {}
