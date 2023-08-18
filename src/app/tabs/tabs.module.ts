import { IonicModule } from "@ionic/angular";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { TabsPageRoutingModule } from "./tabs-routing.module";

import { TabsPage } from "./tabs.page";
import { AuthGuard } from "../core/auth.guard";
import { AddEmployeePage } from "../admin/add-employee/add-employee.page";
import { EmployeeListPage } from "./components/employee-list/employee-list.page";
import { SettingsPage } from "./components/settings/settings.page";
import { AttendanceSetupPage } from "../admin/attendance-setup/attendance-setup.page";
import { EmployeeProfilePage } from "../employee/employee-profile/employee-profile.page";
import { EditProfilePage } from "../employee/edit-profile/edit-profile.page";
import { PayrollSetupPage } from "../admin/payroll-setup/payroll-setup.page";
import { PayrollPage } from "../employee/payroll/payroll.page";
import { AttendancePage } from "../employee/attendance/attendance.page";

@NgModule({
  declarations: [
    TabsPage,
    AddEmployeePage,
    EmployeeListPage,
    SettingsPage,
    AttendanceSetupPage,
    EmployeeProfilePage,
    EditProfilePage,
    PayrollSetupPage,
    PayrollPage,
    AttendancePage,
  ],
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TabsPageRoutingModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [AuthGuard],
})
export class TabsPageModule {}
