import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { AttendancePage } from "./components/attendance/attendance.page";
import { LeavesPage } from "./components/leaves/leaves.page";
import { DirectoryPage } from "./components/directory/directory.page";
import { WorkpagePage } from "./components/workpage/workpage.page";
import { WeekpagePage } from "./components/weekpage/weekpage.page";
import { UserPage } from "./components/user/user.page";
import { AdditionalSetupPage } from "./components/additional-setup/additional-setup.page";
import { LOGSPage } from "./components/logs/logs.page";
import { LeaveadminPage } from "./components/leaveadmin/leaveadmin.page";
import { FileSaverModule } from "ngx-filesaver";
import { DatePipe } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { AuthGuard } from "./core/auth.guard";
import { TokenInterceptor } from "./core/token.interceptor";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LeaveSetupPage } from "./admin/leave-setup/leave-setup.page";
import { EmployeeWorkWeekPage } from "./employee/employee-work-week/employee-work-week.page";

@NgModule({
  declarations: [
    AppComponent,
    AttendancePage,
    LeavesPage,
    DirectoryPage,
    WorkpagePage,
    WeekpagePage,
    UserPage,
    AdditionalSetupPage,
    LOGSPage,
    LeaveadminPage,
    LeaveSetupPage,
    EmployeeWorkWeekPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FileSaverModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    AuthGuard,
    DatePipe,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
