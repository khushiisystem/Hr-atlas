import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomCallendarPage } from './custom-callendar.page';

const routes: Routes = [
  {
    path: '',
    component: CustomCallendarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomCallendarPageRoutingModule {}
