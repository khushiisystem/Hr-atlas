import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { DirectoryPage } from '../components/directory/directory.page';
import { AttendancePage } from '../components/attendance/attendance.page';
import { ProfilePage } from '../components/profile/profile.page';
import { Tab1Page } from '../tab1/tab1.page';
import { AuthGuard } from '../core/auth.guard';
import { AddEmployeePage } from './components/add-employee/add-employee.page';
import { EmployeeListPage } from './components/employee-list/employee-list.page';
import { SettingsPage } from './components/settings/settings.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'home',
        // canActivate: [AuthGuard],
        loadChildren: () => import('../tab1/tab1.module').then(m => m.Tab1PageModule)
      },
      {
        path: 'directory',
        title: "Directory",
        component: DirectoryPage,
        canActivate: [AuthGuard]
      },
      {
        path: 'attendance',
        title: "Attendance",
        component: AttendancePage,
        canActivate: [AuthGuard]
      },
      {
        path: 'profile',
        component: ProfilePage,
        canActivate: [AuthGuard]
      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      },
      {
        path: 'add-employee',
        title: "Add Employee",
        component: AddEmployeePage,
      },
      {
        path: 'employee-list',
        title: "Employee List",
        component: EmployeeListPage
      },
      {
        path: 'settings',
        title: "Settings",
        component: SettingsPage
      },
    ],
    // canActivate: [AuthGuard]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
