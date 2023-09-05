import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy, RouterModule } from "@angular/router";

import { IonicModule, IonicRouteStrategy } from "@ionic/angular";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { WorkpagePage } from "./components/workpage/workpage.page";
import { WeekpagePage } from "./components/weekpage/weekpage.page";
import { UserPage } from "./components/user/user.page";
import { LOGSPage } from "./components/logs/logs.page";
import { FileSaverModule } from "ngx-filesaver";
import { CommonModule, DatePipe } from "@angular/common";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { AuthGuard } from "./core/auth.guard";
import { TokenInterceptor } from "./core/token.interceptor";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { LeaveSetupPage } from "./admin/leave-setup/leave-setup.page";
import { EmployeeWorkWeekPage } from "./employee/employee-work-week/employee-work-week.page";
import { NgOtpInputModule } from "ng-otp-input";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NameImgPageModule } from "./share/components/name-img/name-img.module";
import { AddExperiencePageModule } from "./admin/add-experience/add-experience.module";

@NgModule({
  declarations: [
    AppComponent,
    WorkpagePage,
    WeekpagePage,
    UserPage,
    LOGSPage,
    LeaveSetupPage,
    EmployeeWorkWeekPage,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FileSaverModule,
    HttpClientModule,
    RouterModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgOtpInputModule,
    NameImgPageModule,
    AddExperiencePageModule,
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
