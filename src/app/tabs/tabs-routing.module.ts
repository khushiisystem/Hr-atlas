import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { DirectoryPage } from '../components/directory/directory.page';
import { AttendancePage } from '../components/attendance/attendance.page';
import { ProfilePage } from '../components/profile/profile.page';
import { Tab1Page } from '../tab1/tab1.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule)
      },
      {
        path: 'directory',
        component: DirectoryPage
      },
      {
        path: 'attendance',
        component: AttendancePage
      },
      {
        path: 'profile',
        component: ProfilePage
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
