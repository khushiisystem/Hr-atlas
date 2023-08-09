import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TabsPageRoutingModule } from './tabs-routing.module';

import { TabsPage } from './tabs.page';
import { AuthGuard } from '../core/auth.guard';
import { AddEmployeePage } from './components/add-employee/add-employee.page';
import { EmployeeListPage } from './components/employee-list/employee-list.page';
import { SettingsPage } from './components/settings/settings.page';
import { AttendanceSetupPage } from './components/attendance-setup/attendance-setup.page';

@NgModule({
  declarations: [TabsPage, AddEmployeePage, EmployeeListPage, SettingsPage, AttendanceSetupPage, ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabsPageRoutingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [AuthGuard,]
})
export class TabsPageModule {}
