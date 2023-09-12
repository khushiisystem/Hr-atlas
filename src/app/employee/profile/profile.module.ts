import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ProfilePageRoutingModule } from './profile-routing.module';

import { ProfilePage } from './profile.page';
import { NameImgPageModule } from 'src/app/share/components/name-img/name-img.module';
import { AuthGuard } from 'src/app/core/auth.guard';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ProfilePageRoutingModule,
    NameImgPageModule,
  ],
  declarations: [ProfilePage],
  providers:[AuthGuard]
})
export class ProfilePageModule {}
