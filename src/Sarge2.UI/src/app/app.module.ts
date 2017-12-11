import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ColorPickerModule, ColorPickerComponent } from 'ngx-color-picker';

import { MapService } from './services/map.service';

import { MenuModule } from './components/menus/menu.module';
import { MaterialModule } from './material.module';

import { AppComponent } from './app.component';
import { MapComponent } from './components/map.component';
import { UserComponent } from './components/user.component';
import { LoginBoxComponent } from "./components/login-box.component";

import { AngularFireModule, FirebaseAppConfig } from 'angularfire2/angularfire2';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireDatabase, AngularFireDatabaseModule } from 'angularfire2/database';

import { Routes, RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { AuthGuardService } from './services/auth-guard.service';
import { AuthService } from './services/auth.service';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    UserComponent,
    LoginBoxComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.fireBase),    
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    FormsModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MenuModule,
    MaterialModule,
    HttpModule,
    RouterModule.forRoot([]),
    AppRoutingModule,
    ColorPickerModule
  ],
  providers: [
    MapService,
    AuthGuardService,
    AuthService,
  ],
  bootstrap: [AppComponent],
  entryComponents: [
    LoginBoxComponent
  ]
})
export class AppModule { }
