import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonSkeletonText, IonicModule } from '@ionic/angular';

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
  providers:[AuthGuard, IonSkeletonText],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ProfilePageModule {}
