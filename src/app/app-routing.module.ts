import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LeavesPage } from './components/leaves/leaves.page';
import { DirectoryPage } from './components/directory/directory.page';
import { WorkpagePage } from './components/workpage/workpage.page';
import { WeekpagePage } from './components/weekpage/weekpage.page';
import { UserPage } from './components/user/user.page';
import { LOGSPage } from './components/logs/logs.page';
import { LeaveadminPage } from './components/leaveadmin/leaveadmin.page';
import { EmployeeWorkWeekPage } from './employee/employee-work-week/employee-work-week.page';
import { AuthGuard } from './core/auth.guard';
const routes: Routes = [
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () => import('./share/share.module').then( m => m.SharePageModule),
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'leaves',
    component: LeavesPage
  },
  {
    path: 'directory',
    component: DirectoryPage
  },
  {
    path: 'workpage',
    component: WorkpagePage
  },
  {
    path: 'weekpage',
    component: WeekpagePage
  },
  {
    path: 'user',
    component: UserPage
  },
  {
    path: 'logs',
    component: LOGSPage
  },
  {
    path: 'leaveadmin',
    component: LeaveadminPage
  },
  {
    path: 'employee-work-week/:employeeId',
    title: "Work Week",
    component: EmployeeWorkWeekPage,
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
