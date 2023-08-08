import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AddempPage } from './components/addemp/addemp.page';
import { AttendancePage } from './components/attendance/attendance.page';
import { LeavesPage } from './components/leaves/leaves.page';
import { PayrollPage } from './components/payroll/payroll.page';
import { ProfilePage } from './components/profile/profile.page';
import { SettingsPage } from './components/settings/settings.page';
import { DirectoryPage } from './components/directory/directory.page';
import { BiopagePage } from './components/biopage/biopage.page';
import { PersonalpagePage } from './components/personalpage/personalpage.page';
import { WorkpagePage } from './components/workpage/workpage.page';
import { TeampagePage } from './components/teampage/teampage.page';
import { WeekpagePage } from './components/weekpage/weekpage.page';
import { UserPage } from './components/user/user.page';
import { AttendanceSetupPage } from './components/attendance-setup/attendance-setup.page';
import { LeaveSetupPage } from './components/leave-setup/leave-setup.page';
import { PayrollSetupPage } from './components/payroll-setup/payroll-setup.page';
import { AdditionalSetupPage } from './components/additional-setup/additional-setup.page';
import { LOGSPage } from './components/logs/logs.page';
import { LeaveadminPage } from './components/leaveadmin/leaveadmin.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '',
    loadChildren: () => import('./share/share.module').then( m => m.SharePageModule)
  },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: 'addemp',
    component: AddempPage
  },
  {
    path: 'attendance',
    component: AttendancePage
  },
  {
    path: 'leaves',
    component: LeavesPage
  },
  {
    path: 'payroll',
    component: PayrollPage
  },
  {
    path: 'profile',
    component: ProfilePage
  },
  {
    path: 'settings',
    component: SettingsPage
  },
  {
    path: 'directory',
    component: DirectoryPage
  },
  {
    path: 'biopage',
    component: BiopagePage
  },
  {
    path: 'personalpage',
    component: PersonalpagePage
  },
  {
    path: 'workpage',
    component: WorkpagePage
  },
  {
    path: 'teampage',
    component: TeampagePage
  },
  {
    path: 'weekpage',
    component: WeekpagePage
  },
  {
    path: 'personalpage',
    component: PersonalpagePage
  },{
    path: 'user',
    component: UserPage
  },
  {
    path: 'attendance-setup',
    component: AttendanceSetupPage
  },
  {
    path: 'leave-setup',
    component: LeaveSetupPage
  },
  {
    path: 'payroll-setup',
    component: PayrollSetupPage
  },
  {
    path: 'additional-setup',
    component: AdditionalSetupPage
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
    path: 'tab4',
    loadChildren: () => import('./tab4/tab4.module').then( m => m.Tab4PageModule)
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
