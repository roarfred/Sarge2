import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MapService } from './services/map.service';
import { KovaApiService } from './services/kova-api.service';

import { MenuModule } from './components/menus/menu.module';
import { MaterialModule } from './material.module';

import { AppComponent } from './app.component';
import { MapComponent } from './components/map.component';
import { UserComponent } from './components/user.component';
import { LoginBoxComponent } from "./components/login-box.component";

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    UserComponent,
    LoginBoxComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MenuModule,
    MaterialModule,
    HttpModule
  ],
  providers: [
    MapService,
    KovaApiService
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    LoginBoxComponent
  ]
})
export class AppModule { }
