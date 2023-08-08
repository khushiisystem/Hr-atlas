import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterPage } from './components/footer/footer.page';
import { IonicModule } from '@ionic/angular';
import { BrowserModule } from '@angular/platform-browser';



@NgModule({
  declarations: [FooterPage],
  exports: [FooterPage],
  imports: [
    IonicModule,
    CommonModule,
    BrowserModule
  ]
})
export class ShareModule { }
